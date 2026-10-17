import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageCreatedEvent } from '../common/events/message-created.event';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User } from '../user/entities/user.entity';
import { MediaService } from '../media/media.service';
import { MAX_BYTES_CAPTURA } from '../media/imagen-subida';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly eventEmitter: EventEmitter2,
    private readonly authorizationService: AuthorizationService,
    private readonly media: MediaService,
  ) {}

  /**
   * Enviar un mensaje. `sender` viene del JWT (no del DTO): su nombre se usa
   * para el título de la notificación al destinatario sin consulta aparte.
   */
  async create(createMessageDto: CreateMessageDto, sender: User): Promise<Message> {
    const senderId = sender.id;
    const senderName = sender.fullName;
    if (createMessageDto.receiverId === senderId) {
      throw new BadRequestException('No puedes enviarte un mensaje a ti mismo');
    }
    await this.authorizationService.assertCanMessage(sender, createMessageDto.receiverId);
    // Un admin puede escribir a cualquiera, pero el destinatario debe existir
    // (si no, la llave foránea termina en un 500).
    if (!(await this.messageRepository.manager.count(User, { where: { id: createMessageDto.receiverId } }))) {
      throw new NotFoundException('Destinatario no encontrado');
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId,
    });

    const saved = await this.messageRepository.save(message);

    await this.eventEmitter.emitAsync(
      'message.created',
      new MessageCreatedEvent(saved.id, senderId, senderName, saved.receiverId, saved.content),
    );

    return saved;
  }

  /**
   * Obtener bandeja de entrada (mensajes recibidos)
   */
  async getInbox(userId: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { receiverId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener mensajes enviados
   */
  async getSent(userId: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { senderId: userId },
      relations: ['receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener conversación entre dos usuarios
   */
  async getConversation(userId: number, otherUserId: number): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId AND message.receiverId = :otherUserId) OR ' +
        '(message.senderId = :otherUserId AND message.receiverId = :userId)',
        { userId, otherUserId },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    message.isRead = true;
    return await this.messageRepository.save(message);
  }

  /** Un mensaje propio (de quien lo envió); a los demás, «no encontrado» (no se revela que existe). */
  private async mensajePropio(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId, senderId: userId } });
    if (!message) throw new NotFoundException('Mensaje no encontrado');
    return message;
  }

  /**
   * Editar el texto de un mensaje enviado (sugerencia n.º 13, Julio 16/10: «si me equivoco no lo puedo corregir»).
   * Como en Slack o Teams, sin límite de tiempo y con la marca «Editado» para el destinatario.
   */
  async editar(messageId: number, user: User, content: string): Promise<Message> {
    const message = await this.mensajePropio(messageId, user.id);
    const texto = content.trim();
    if (!texto) throw new BadRequestException('El contenido es obligatorio');
    if (texto === message.content) return message;
    message.content = texto;
    message.editadoEn = new Date();
    return await this.messageRepository.save(message);
  }

  /** Adjunta una imagen a un mensaje propio (hasta 3 MB, como el pantallazo de las sugerencias); reemplaza la anterior. */
  async adjuntarImagen(messageId: number, user: User, datos: Buffer | undefined): Promise<{ imagenId: string }> {
    const message = await this.mensajePropio(messageId, user.id);
    const imagen = await this.media.subirImagen(user, datos, MAX_BYTES_CAPTURA);
    const anterior = message.imagenId;
    message.imagenId = imagen.id;
    await this.messageRepository.save(message);
    if (anterior) await this.media.eliminar(user, anterior).catch(() => undefined);
    return { imagenId: imagen.id };
  }

  /** La imagen de un mensaje, solo para quien lo envió o lo recibió. */
  async imagen(messageId: number, userId: number): Promise<{ mimeType: string; data: Buffer }> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message || (message.senderId !== userId && message.receiverId !== userId)) throw new NotFoundException('Mensaje no encontrado');
    if (!message.imagenId) throw new NotFoundException('Este mensaje no tiene imagen.');
    return this.media.obtener(message.imagenId);
  }

  /**
   * Contar mensajes no leídos
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.messageRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}

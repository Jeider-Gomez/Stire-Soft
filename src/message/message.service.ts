import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageCreatedEvent } from '../common/events/message-created.event';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Enviar un mensaje. `senderName` viene del JWT del controlador (no del
   * DTO): se usa solo para el título de la notificación al destinatario, sin
   * disparar una consulta aparte al usuario.
   */
  async create(
    createMessageDto: CreateMessageDto,
    senderId: number,
    senderName: string,
  ): Promise<Message> {
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

  /**
   * Contar mensajes no leídos
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.messageRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}

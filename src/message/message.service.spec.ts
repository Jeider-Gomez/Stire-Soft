import { NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let eventEmitter: { emitAsync: jest.Mock };

  beforeEach(() => {
    messageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    eventEmitter = { emitAsync: jest.fn().mockResolvedValue(undefined) };
    service = new MessageService(messageRepository as never, eventEmitter as never);
  });

  it('crea un mensaje con el remitente autenticado, sin confiar en el DTO', async () => {
    const message = { id: 1, senderId: 7, receiverId: 12, content: 'Hola' } as Message;
    messageRepository.create.mockReturnValue(message);
    messageRepository.save.mockResolvedValue(message);

    await expect(service.create({ receiverId: 12, content: 'Hola' }, 7, 'Ana Pérez')).resolves.toBe(message);
    expect(messageRepository.create).toHaveBeenCalledWith({ receiverId: 12, content: 'Hola', senderId: 7 });
    expect(messageRepository.save).toHaveBeenCalledWith(message);
  });

  it('al crear un mensaje, emite message.created con los datos para notificar al destinatario', async () => {
    const message = { id: 1, senderId: 7, receiverId: 12, content: 'Hola' } as Message;
    messageRepository.create.mockReturnValue(message);
    messageRepository.save.mockResolvedValue(message);

    await service.create({ receiverId: 12, content: 'Hola' }, 7, 'Ana Pérez');

    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      'message.created',
      expect.objectContaining({
        messageId: 1,
        senderId: 7,
        senderName: 'Ana Pérez',
        receiverId: 12,
        content: 'Hola',
      }),
    );
  });

  it('obtiene la bandeja de entrada con remitente y mensajes más recientes primero', async () => {
    const messages = [{ id: 1 }] as Message[];
    messageRepository.find.mockResolvedValue(messages);

    await expect(service.getInbox(7)).resolves.toBe(messages);
    expect(messageRepository.find).toHaveBeenCalledWith({
      where: { receiverId: 7 }, relations: ['sender'], order: { createdAt: 'DESC' },
    });
  });

  it('obtiene los mensajes enviados con destinatario y mensajes más recientes primero', async () => {
    const messages = [{ id: 1 }] as Message[];
    messageRepository.find.mockResolvedValue(messages);

    await expect(service.getSent(7)).resolves.toBe(messages);
    expect(messageRepository.find).toHaveBeenCalledWith({
      where: { senderId: 7 }, relations: ['receiver'], order: { createdAt: 'DESC' },
    });
  });

  it('consulta una conversación bidireccional en orden cronológico', async () => {
    const messages = [{ id: 1 }] as Message[];
    const queryBuilder = {
      leftJoinAndSelect: jest.fn(), where: jest.fn(), orderBy: jest.fn(), getMany: jest.fn().mockResolvedValue(messages),
    };
    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    messageRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.getConversation(7, 12)).resolves.toBe(messages);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      '(message.senderId = :userId AND message.receiverId = :otherUserId) OR ' +
        '(message.senderId = :otherUserId AND message.receiverId = :userId)',
      { userId: 7, otherUserId: 12 },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('message.createdAt', 'ASC');
  });

  it('marca como leído únicamente un mensaje cuyo destinatario es el usuario autenticado', async () => {
    const message = { id: 1, receiverId: 7, isRead: false } as Message;
    messageRepository.findOne.mockResolvedValue(message);
    messageRepository.save.mockResolvedValue({ ...message, isRead: true });

    await expect(service.markAsRead(1, 7)).resolves.toMatchObject({ isRead: true });
    expect(messageRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, receiverId: 7 } });
    expect(messageRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isRead: true }));
  });

  it('rechaza marcar como leído un mensaje ajeno o inexistente', async () => {
    messageRepository.findOne.mockResolvedValue(null);

    await expect(service.markAsRead(1, 7)).rejects.toThrow(NotFoundException);
    expect(messageRepository.save).not.toHaveBeenCalled();
  });

  it('cuenta solo los mensajes no leídos del destinatario autenticado', async () => {
    messageRepository.count.mockResolvedValue(3);

    await expect(service.getUnreadCount(7)).resolves.toBe(3);
    expect(messageRepository.count).toHaveBeenCalledWith({ where: { receiverId: 7, isRead: false } });
  });
});

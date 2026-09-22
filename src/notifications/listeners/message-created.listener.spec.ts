import { MessageCreatedListener } from './message-created.listener';
import { MessageCreatedEvent } from '../../common/events/message-created.event';
import { NotificationType } from '../../common/enums/notification-type.enum';

describe('MessageCreatedListener', () => {
  let listener: MessageCreatedListener;
  const notificationsService = { createNotification: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    listener = new MessageCreatedListener(notificationsService as never);
  });

  it('crea una notificación de tipo message para el destinatario, con el remitente en el título', async () => {
    const event = new MessageCreatedEvent(1, 7, 'Ana Pérez', 12, 'Hola, ¿cómo vas con la práctica?');

    await listener.handleMessageCreatedEvent(event);

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      12,
      'Nuevo mensaje de Ana Pérez',
      'Hola, ¿cómo vas con la práctica?',
      NotificationType.MESSAGE,
    );
  });

  it('recorta el contenido a 140 caracteres para la vista previa', async () => {
    const longContent = 'x'.repeat(200);
    const event = new MessageCreatedEvent(1, 7, 'Ana Pérez', 12, longContent);

    await listener.handleMessageCreatedEvent(event);

    const [, , preview] = notificationsService.createNotification.mock.calls[0];
    expect(preview).toBe(`${'x'.repeat(140)}…`);
  });

  it('si falla la creación de la notificación, no propaga el error (no debe tumbar el envío del mensaje)', async () => {
    notificationsService.createNotification.mockRejectedValue(new Error('DB caída'));
    const event = new MessageCreatedEvent(1, 7, 'Ana Pérez', 12, 'Hola');

    await expect(listener.handleMessageCreatedEvent(event)).resolves.toBeUndefined();
  });
});

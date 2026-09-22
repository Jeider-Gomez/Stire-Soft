export class MessageCreatedEvent {
  constructor(
    public readonly messageId: number,
    public readonly senderId: number,
    public readonly senderName: string,
    public readonly receiverId: number,
    public readonly content: string,
  ) {}
}

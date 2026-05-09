import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TutorConversation } from './entities/tutor-conversation.entity';

@Injectable()
export class TutorConversationsRepository extends Repository<TutorConversation> {
  constructor(private dataSource: DataSource) {
    super(TutorConversation, dataSource.createEntityManager());
  }

  async getRecentContext(studentId: number, limit: number = 5): Promise<TutorConversation[]> {
    return this.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
      take: limit,
    }).then(msgs => msgs.reverse()); // Devolver en orden cronológico
  }
}

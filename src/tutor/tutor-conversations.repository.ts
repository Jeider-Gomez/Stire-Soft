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

  /** Últimos mensajes visibles (user/assistant) del estudiante, del más antiguo al más reciente. */
  async getHistory(studentId: number, limit: number): Promise<TutorConversation[]> {
    return this.createQueryBuilder('c')
      .where('c.studentId = :studentId', { studentId })
      .andWhere('c.role IN (:...roles)', { roles: ['user', 'assistant'] })
      .orderBy('c.createdAt', 'DESC')
      .addOrderBy('c.id', 'DESC')
      .take(limit)
      .getMany()
      .then(msgs => msgs.reverse());
  }
}

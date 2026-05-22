import { LearningStatus } from '../enums/learning-status.enum';

export class LearningStatusChangedEvent {
  constructor(
    public readonly studentId: number,
    public readonly learningUnitId: number,
    public readonly oldStatus: LearningStatus,
    public readonly newStatus: LearningStatus,
    public readonly mastery: number,
  ) {}
}

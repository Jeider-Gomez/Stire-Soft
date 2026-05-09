export class SubmissionGradedEvent {
  constructor(
    public readonly submissionId: string,
    public readonly studentId: number,
    public readonly activityId: number,
    public readonly learningUnitId: number,
    public readonly score: number,
    public readonly passingScore: number,
  ) {}
}

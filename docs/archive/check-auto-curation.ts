import { DataSource } from 'typeorm';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionAnswer } from '../submission-answers/entities/submission-answer.entity';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Submission, SubmissionAnswer, LearningProgress],
    synchronize: false,
  });

  await dataSource.initialize();
  const submissionRepo = dataSource.getRepository(Submission);
  const answerRepo = dataSource.getRepository(SubmissionAnswer);
  const progressRepo = dataSource.getRepository(LearningProgress);

  const stale = await submissionRepo.find({ where: { status: 'graded' }, relations: ['answers'] });
  let allOk = true;
  for (const sub of stale) {
    const hasIncorrect = sub.answers.some(a => a.isCorrect === false && a.feedback?.includes('Tiempo de ejecución excedido'));
    if (hasIncorrect) {
      console.log(`✅ Submission ${sub.id} auto‑curated correctly.`);
      const progress = await progressRepo.findOne({ where: { submissionId: sub.id } });
      if (progress) {
        console.log(`   LearningProgress status: ${progress.status}`);
      }
    } else {
      console.error(`❌ Submission ${sub.id} not properly auto‑curated.`);
      allOk = false;
    }
  }
  if (allOk) {
    console.log('✅ All stale submissions processed correctly.');
    process.exit(0);
  } else {
    console.error('❌ Some submissions were not auto‑curated correctly.');
    process.exit(1);
  }
})();

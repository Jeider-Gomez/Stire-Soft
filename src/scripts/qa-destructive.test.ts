// src/scripts/qa-destructive.test.ts
/*
  Destructive QA Test – runs the seeder and validates security, timeout and syntax handling.
  Execute with: npx tsx src/scripts/qa-destructive.test.ts
*/
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { QaDestructivoSeeder } from '../seeds/qa-destructivo.seeder';
import { ConfigService } from '@nestjs/config';

(async () => {
  // Bootstrap Nest application (without starting the HTTP server listener)
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const config = app.get(ConfigService);
  const baseUrl = `http://localhost:${config.get('PORT') || 3000}`;
  const server = app.getHttpServer();

  console.log('🚀 Running QA Destructive Seeder');
  const seeder = app.get(QaDestructivoSeeder);
  await seeder.seed();
  console.log('✅ Seeder completed');

  // Helper to obtain JWT for a user (login endpoint must exist)
  const login = async (email: string, password: string) => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email, password });
    return res.body.access_token as string;
  };

  // -----------------------------------
  // 1. Student trying to create an Institution – must be 403
  // -----------------------------------
  const studentToken = await login('student1@cooperativa.org', 'Password123');
  const resInst = await request(server)
    .post('/institutions')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ name: 'Hackers', domain: 'hackers.org' });
  console.log('\n[TEST] Student POST /institutions →', resInst.status);
  if (resInst.status !== 403) throw new Error('Security breach: Student was able to POST /institutions');

  // -----------------------------------
  // 2. Teacher accessing learning_state of another institution – must be 403
  // -----------------------------------
  const teacherToken = await login('docente@sena.edu.co', 'Password123');
  const resLearning = await request(server)
    .get('/learning-progress/student/student2@upb.edu.co') // endpoint may vary; adapt to actual route
    .set('Authorization', `Bearer ${teacherToken}`);
  console.log('[TEST] Teacher GET other learning_state →', resLearning.status);
  if (resLearning.status !== 403) throw new Error('Security breach: Teacher accessed foreign learning state');

  // -----------------------------------
  // 3. Submit code with syntax error – should be marked wrong_answer
  // -----------------------------------
  // Create a simple activity and question first (reuse seeded data or create on‑fly)
  const adminToken = await login('admin@upb.edu.co', 'Password123');
  const activityRes = await request(server)
    .post('/activities')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Syntax Error Test', description: 'test', typeId: 1, learningUnitId: 1, passingScore: 70 });
  const activityId = activityRes.body.id;

  const questionRes = await request(server)
    .post('/activity-questions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ activityId, type: 'code', config: { language: 'javascript', testCases: [{ input: '', expected: '42' }] } });
  const questionId = questionRes.body.id;

  const startRes = await request(server)
    .post('/submissions/start')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ activityId });
  const submissionId = startRes.body.id;

  const badCode = 'function foo() { console.log("missing brace"; }'; // syntax error
  const submitRes = await request(server)
    .post(`/submissions/${submissionId}/submit`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ answers: [{ questionId, answer: { code: badCode } }] });
  console.log('[TEST] Submit syntax error →', submitRes.body);
  if (submitRes.body.results[0].status !== 'wrong_answer') {
    throw new Error('Expected wrong_answer for syntax error but got ' + submitRes.body.results[0].status);
  }

  // -----------------------------------
  // 4. Submit code that exceeds timeout – should be status 'timeout'
  // -----------------------------------
  const timeoutCode = 'while(true) {}'; // infinite loop
  const timeoutRes = await request(server)
    .post(`/submissions/${submissionId}/submit`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ answers: [{ questionId, answer: { code: timeoutCode } }] });
  console.log('[TEST] Submit timeout code →', timeoutRes.body);
  if (timeoutRes.body.results[0].status !== 'timeout') {
    throw new Error('Expected timeout but got ' + timeoutRes.body.results[0].status);
  }

  console.log('\n✅ All destructive QA tests passed');
  await app.close();
})();

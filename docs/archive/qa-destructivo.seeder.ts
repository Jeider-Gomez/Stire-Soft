// src/seeds/qa-destructivo.seeder.ts
/*
  Destructive QA Seeder – populates the database with a rich set of data for
  stress‑testing, security validation and data‑integrity checks.
*/
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from '../institutions/institution.entity';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';
import { Evaluation } from '../evaluations/evaluation.entity';
import { LearningState } from '../learning-states/learning-state.entity';
import * as bcrypt from 'bcrypt';

/**
 * The seeder is idempotent – running it multiple times will not duplicate rows
 * because we use `upsert` (ON CONFLICT) on unique columns (e.g. name, email).
 */
@Injectable()
export class QaDestructivoSeeder {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(LearningState)
    private readonly learningStateRepo: Repository<LearningState>,
  ) {}

  async seed() {
    // ---------- Institutions ----------
    const institutionsData = [
      { name: 'UPB', domain: 'upb.edu.co' },
      { name: 'SENA', domain: 'sena.edu.co' },
      { name: 'Cooperativa', domain: 'cooperativa.org' },
    ];
    const institutions = await Promise.all(
      institutionsData.map(data =>
        this.institutionRepo.upsert(data, ['name']).then(() =>
          this.institutionRepo.findOne({ where: { name: data.name } })
        )
      ),
    );

    // ---------- Users (Admin, Teacher, Students) ----------
    const passwordHash = await bcrypt.hash('Password123', 10);
    const admin = await this.userRepo.upsert(
      {
        email: 'admin@upb.edu.co',
        name: 'Admin User',
        role: Role.ADMIN,
        institution: institutions.find(i => i.name === 'UPB'),
        password: passwordHash,
      },
      ['email']
    ).then(() => this.userRepo.findOne({ where: { email: 'admin@upb.edu.co' } }));

    const teacher = await this.userRepo.upsert(
      {
        email: 'docente@sena.edu.co',
        name: 'Docente SENA',
        role: Role.TEACHER,
        institution: institutions.find(i => i.name === 'SENA'),
        password: passwordHash,
      },
      ['email']
    ).then(() => this.userRepo.findOne({ where: { email: 'docente@sena.edu.co' } }));

    const studentSuccess = await this.userRepo.upsert(
      {
        email: 'student1@cooperativa.org',
        name: 'Estudiante Uno',
        role: Role.STUDENT,
        institution: institutions.find(i => i.name === 'Cooperativa'),
        password: passwordHash,
      },
      ['email']
    ).then(() => this.userRepo.findOne({ where: { email: 'student1@cooperativa.org' } }));

    const studentFail = await this.userRepo.upsert(
      {
        email: 'student2@upb.edu.co',
        name: 'Estudiante Dos',
        role: Role.STUDENT,
        institution: institutions.find(i => i.name === 'UPB'),
        password: passwordHash,
      },
      ['email']
    ).then(() => this.userRepo.findOne({ where: { email: 'student2@upb.edu.co' } }));

    // ---------- Evaluations (correct, wrong_answer, timeout) ----------
    const evaluationsData = [
      {
        student: studentSuccess,
        status: 'passed',
        score: 100,
        details: { isCorrect: true },
      },
      {
        student: studentFail,
        status: 'failed',
        score: 0,
        details: { isCorrect: false, reason: 'wrong_answer' },
      },
      {
        student: studentFail,
        status: 'timeout',
        score: 0,
        details: { isCorrect: false, reason: 'timeout' },
      },
    ];
    await Promise.all(
      evaluationsData.map(ev => this.evaluationRepo.save(ev))
    );

    // ---------- Learning States (mastery per unit) ----------
    const learningStatesData = [
      {
        student: studentSuccess,
        unitId: 1,
        mastery: 0.95,
        progress: 1,
      },
      {
        student: studentFail,
        unitId: 1,
        mastery: 0.30,
        progress: 0.4,
      },
    ];
    await Promise.all(
      learningStatesData.map(ls => this.learningStateRepo.save(ls))
    );

    console.log('✅ QA Destructivo Seeder finished');
  }
}

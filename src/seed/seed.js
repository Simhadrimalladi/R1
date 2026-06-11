import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Subject from '../models/Lookup.js';
import Test from '../models/Test.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preproute_test_management';

const subjects = [
  {
    name: 'English', slug: 'english', topics: [
      { name: 'Grammar', slug: 'grammar', subTopics: [{ name: 'Application', slug: 'application' }, { name: 'Tenses', slug: 'tenses' }] },
      { name: 'Writing', slug: 'writing', subTopics: [{ name: 'Essay', slug: 'essay' }, { name: 'Letter Writing', slug: 'letter-writing' }] },
      { name: 'Reading', slug: 'reading', subTopics: [{ name: 'Comprehension', slug: 'comprehension' }] }
    ]
  },
  {
    name: 'Mathematics', slug: 'mathematics', topics: [
      { name: 'Algebra', slug: 'algebra', subTopics: [{ name: 'Linear Equations', slug: 'linear-equations' }, { name: 'Quadratic Equations', slug: 'quadratic-equations' }] },
      { name: 'Geometry', slug: 'geometry', subTopics: [{ name: 'Triangles', slug: 'triangles' }, { name: 'Circles', slug: 'circles' }] }
    ]
  },
  {
    name: 'Science', slug: 'science', topics: [
      { name: 'Physics', slug: 'physics', subTopics: [{ name: 'Motion', slug: 'motion' }, { name: 'Light', slug: 'light' }] },
      { name: 'Chemistry', slug: 'chemistry', subTopics: [{ name: 'Atoms', slug: 'atoms' }, { name: 'Acids and Bases', slug: 'acids-bases' }] }
    ]
  }
];

const questions = [
  {
    questionText: 'Choose the correctly punctuated sentence.',
    options: [
      { text: 'Its raining, outside.', isCorrect: false },
      { text: 'It’s raining outside.', isCorrect: true },
      { text: 'Its raining outside?', isCorrect: false },
      { text: 'It’s raining, outside?', isCorrect: false }
    ],
    solution: 'The contraction “It’s” means “It is”.',
    difficulty: 'EASY', topic: 'Grammar', subTopic: 'Application', order: 1
  },
  {
    questionText: 'Which word is a synonym of “rapid”?',
    options: [
      { text: 'Slow', isCorrect: false },
      { text: 'Fast', isCorrect: true },
      { text: 'Quiet', isCorrect: false },
      { text: 'Late', isCorrect: false }
    ],
    solution: 'Rapid means fast or quick.',
    difficulty: 'EASY', topic: 'Grammar', subTopic: 'Application', order: 2
  }
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  await Promise.all([User.deleteMany({}), Subject.deleteMany({}), Test.deleteMany({})]);

  const passwordHash = await User.hashPassword('vedant123');
  const user = await User.create({ username: 'vedant-admin', passwordHash, name: 'Alex Wando', role: 'ADMIN' });
  await Subject.insertMany(subjects);

  await Test.create({
    code: 'TST-DEMO-001',
    type: 'CHAPTER_WISE',
    name: 'Chapter 1 Grammar Application',
    subject: 'English',
    topic: 'Grammar',
    subTopic: 'Application',
    durationMinutes: 60,
    difficulty: 'EASY',
    markingScheme: { wrong: -1, unattempted: 0, correct: 5 },
    totalQuestions: 50,
    totalMarks: 250,
    questions,
    status: 'DRAFT',
    createdBy: user._id
  });

  console.log('Seed completed. Login with vedant-admin / vedant123');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

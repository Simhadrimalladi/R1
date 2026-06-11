import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema],
  solution: { type: String, default: '' },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'DIFFICULT'], default: 'EASY' },
  topic: { type: String, default: '' },
  subTopic: { type: String, default: '' },
  order: { type: Number, default: 1 }
}, { timestamps: true });

const publishSchema = new mongoose.Schema({
  mode: { type: String, enum: ['NOW', 'SCHEDULE'], default: 'NOW' },
  startAt: { type: Date, default: null },
  liveUntilType: { type: String, enum: ['ALWAYS', 'ONE_WEEK', 'TWO_WEEKS', 'THREE_WEEKS', 'ONE_MONTH', 'CUSTOM'], default: 'ALWAYS' },
  endAt: { type: Date, default: null }
}, { _id: false });

const testSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['CHAPTER_WISE', 'PYQ', 'MOCK_TEST'], default: 'CHAPTER_WISE' },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  subTopic: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'DIFFICULT'], default: 'EASY' },
  markingScheme: {
    wrong: { type: Number, default: -1 },
    unattempted: { type: Number, default: 0 },
    correct: { type: Number, default: 5 }
  },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  questions: [questionSchema],
  status: { type: String, enum: ['DRAFT', 'READY', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'], default: 'DRAFT' },
  publishSettings: { type: publishSchema, default: () => ({}) },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

testSchema.virtual('completedQuestions').get(function completedQuestions() {
  return this.questions?.length || 0;
});

testSchema.set('toJSON', { virtuals: true });
testSchema.set('toObject', { virtuals: true });

export default mongoose.model('Test', testSchema);

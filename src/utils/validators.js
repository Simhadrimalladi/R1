import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required')
}).refine((data) => data.username || data.userId, {
  message: 'Either username or userId is required',
  path: ['username']
});

export const testDetailsSchema = z.object({
  type: z.enum(['CHAPTER_WISE', 'PYQ', 'MOCK_TEST']).default('CHAPTER_WISE'),
  name: z.string().min(2, 'Test name is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  subTopic: z.string().min(1, 'Sub topic is required'),
  durationMinutes: z.coerce.number().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'DIFFICULT']).default('EASY'),
  markingScheme: z.object({
    wrong: z.coerce.number().default(-1),
    unattempted: z.coerce.number().default(0),
    correct: z.coerce.number().min(1).default(5)
  }),
  totalQuestions: z.coerce.number().min(1),
  totalMarks: z.coerce.number().min(1)
});

export const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  options: z.array(z.object({ text: z.string().min(1), isCorrect: z.boolean().default(false) })).min(2),
  solution: z.string().optional().default(''),
  difficulty: z.enum(['EASY', 'MEDIUM', 'DIFFICULT']).default('EASY'),
  topic: z.string().optional().default(''),
  subTopic: z.string().optional().default('')
}).refine((data) => data.options.some((option) => option.isCorrect), {
  message: 'At least one correct option is required',
  path: ['options']
});

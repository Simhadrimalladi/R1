import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import Test from '../models/Test.js';
import Subject from '../models/Lookup.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { testDetailsSchema, questionSchema } from '../utils/validators.js';

async function resolveIdsToNames(body) {
  let subjectName = body.subject;
  let topicName = Array.isArray(body.topics) ? body.topics[0] : body.topic;
  let subTopicName = Array.isArray(body.sub_topics) ? body.sub_topics[0] : (body.subTopic || body.sub_topic);

  if (body.subject && mongoose.Types.ObjectId.isValid(body.subject)) {
    const subjectDoc = await Subject.findById(body.subject);
    if (subjectDoc) {
      subjectName = subjectDoc.name;
      
      const topicId = Array.isArray(body.topics) ? body.topics[0] : body.topic;
      if (topicId) {
        const topicDoc = subjectDoc.topics.find(t => t._id?.toString() === topicId || t.name === topicId);
        if (topicDoc) {
          topicName = topicDoc.name;
          
          const subTopicId = Array.isArray(body.sub_topics) ? body.sub_topics[0] : (body.subTopic || body.sub_topic);
          if (subTopicId) {
            const subTopicDoc = topicDoc.subTopics.find(s => s._id?.toString() === subTopicId || s.name === subTopicId);
            if (subTopicDoc) {
              subTopicName = subTopicDoc.name;
            }
          }
        }
      }
    }
  }
  
  return { subjectName, topicName, subTopicName };
}

async function normalizeTestPayload(body) {
  const resolved = await resolveIdsToNames(body);

  let difficulty = body.difficulty;
  if (typeof difficulty === 'string') {
    difficulty = difficulty.toUpperCase();
    if (!['EASY', 'MEDIUM', 'DIFFICULT'].includes(difficulty)) {
      difficulty = 'EASY';
    }
  }

  let type = body.type;
  if (type === 'practice') type = 'CHAPTER_WISE';
  else if (type === 'pyq') type = 'PYQ';
  else if (type === 'mock_test') type = 'MOCK_TEST';
  else if (typeof type === 'string') type = type.toUpperCase();

  let markingScheme = body.markingScheme;
  if (body.correct_marks !== undefined || body.wrong_marks !== undefined || body.unattempt_marks !== undefined) {
    markingScheme = {
      correct: body.correct_marks !== undefined ? Number(body.correct_marks) : 5,
      wrong: body.wrong_marks !== undefined ? Number(body.wrong_marks) : -1,
      unattempted: body.unattempt_marks !== undefined ? Number(body.unattempt_marks) : 0
    };
  }

  return {
    type: type || 'CHAPTER_WISE',
    name: body.name,
    subject: resolved.subjectName,
    topic: resolved.topicName,
    subTopic: resolved.subTopicName,
    durationMinutes: body.total_time !== undefined ? Number(body.total_time) : (body.durationMinutes !== undefined ? Number(body.durationMinutes) : undefined),
    difficulty: difficulty || 'EASY',
    markingScheme: markingScheme || { wrong: -1, unattempted: 0, correct: 5 },
    totalQuestions: body.total_questions !== undefined ? Number(body.total_questions) : (body.totalQuestions !== undefined ? Number(body.totalQuestions) : undefined),
    totalMarks: body.total_marks !== undefined ? Number(body.total_marks) : (body.totalMarks !== undefined ? Number(body.totalMarks) : undefined)
  };
}

function formatTestResponse(test) {
  return {
    _id: test._id,
    id: test._id.toString(),
    name: test.name,
    type: test.type,
    subject: test.subject,
    topic: test.topic,
    subTopic: test.subTopic,
    durationMinutes: test.durationMinutes,
    difficulty: test.difficulty,
    markingScheme: test.markingScheme,
    totalQuestions: test.totalQuestions,
    totalMarks: test.totalMarks,
    status: test.status,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
    
    topics: [test.topic],
    sub_topics: [test.subTopic],
    correct_marks: test.markingScheme.correct,
    wrong_marks: test.markingScheme.wrong,
    unattempt_marks: test.markingScheme.unattempted,
    total_time: test.durationMinutes,
    total_questions: test.totalQuestions,
    total_marks: test.totalMarks,
    questions: test.questions.map(q => q._id.toString()),
    created_at: test.createdAt
  };
}

function formatZodError(error) {
  return error.issues.map(issue => {
    const field = issue.path.join('.');
    return field ? `${field}: ${issue.message}` : issue.message;
  }).join(', ');
}

export const getTests = asyncHandler(async (req, res) => {
  const { status, search, page, limit } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { subject: new RegExp(search, 'i') },
    { topic: new RegExp(search, 'i') }
  ];
  
  if (page || limit) {
    const skip = (Number(page || 1) - 1) * Number(limit || 20);
    const [items, total] = await Promise.all([
      Test.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit || 20)),
      Test.countDocuments(filter)
    ]);
    return res.json({ success: true, data: { items, total, page: Number(page || 1), limit: Number(limit || 20) } });
  }
  
  const tests = await Test.find(filter).sort({ updatedAt: -1 });
  const data = tests.map(test => formatTestResponse(test));
  res.json({ success: true, data });
});

export const createTest = asyncHandler(async (req, res) => {
  const normalized = await normalizeTestPayload(req.body);
  const parsed = testDetailsSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new ApiError(400, `Invalid test details: ${formatZodError(parsed.error)}`, parsed.error.flatten());
  }
  const test = await Test.create({
    ...parsed.data,
    code: `TST-${nanoid(8).toUpperCase()}`,
    createdBy: req.user?._id,
    status: 'DRAFT'
  });
  res.status(201).json({ success: true, data: formatTestResponse(test), message: 'Test created successfully' });
});

export const getTestById = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  res.json({ success: true, data: formatTestResponse(test) });
});

export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  
  if (req.body.questions && Array.isArray(req.body.questions)) {
    const questionIds = req.body.questions;
    test.questions = test.questions.filter(q => questionIds.includes(q._id.toString()));
  }

  if (req.body.status) {
    if (req.body.status === 'live') {
      test.status = 'PUBLISHED';
    } else {
      test.status = req.body.status.toUpperCase();
    }
  }

  const mergedBody = { ...test.toObject(), ...req.body };
  const normalized = await normalizeTestPayload(mergedBody);
  const parsed = testDetailsSchema.partial().safeParse(normalized);
  if (!parsed.success) {
    throw new ApiError(400, `Invalid test details: ${formatZodError(parsed.error)}`, parsed.error.flatten());
  }

  Object.assign(test, parsed.data);
  await test.save();
  res.json({ success: true, data: formatTestResponse(test) });
});

export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  res.json({ success: true, data: { id: req.params.id } });
});

export const addQuestion = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, `Invalid question: ${formatZodError(parsed.error)}`, parsed.error.flatten());
  }
  test.questions.push({ ...parsed.data, order: test.questions.length + 1 });
  if (test.questions.length >= test.totalQuestions) test.status = 'READY';
  await test.save();
  res.status(201).json({ success: true, data: formatTestResponse(test) });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  const question = test.questions.id(req.params.questionId);
  if (!question) throw new ApiError(404, 'Question not found');
  const parsed = questionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, `Invalid question: ${formatZodError(parsed.error)}`, parsed.error.flatten());
  }
  Object.assign(question, parsed.data);
  await test.save();
  res.json({ success: true, data: formatTestResponse(test) });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  const exists = test.questions.id(req.params.questionId);
  if (!exists) throw new ApiError(404, 'Question not found');
  test.questions.pull(req.params.questionId);
  test.questions.forEach((question, index) => { question.order = index + 1; });
  if (test.status === 'READY' && test.questions.length < test.totalQuestions) test.status = 'DRAFT';
  await test.save();
  res.json({ success: true, data: formatTestResponse(test) });
});

export const publishTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw new ApiError(404, 'Test not found');
  if (!test.questions.length) throw new ApiError(400, 'Add at least one MCQ question before publishing');

  const { mode = 'NOW', startAt = null, liveUntilType = 'ALWAYS', endAt = null } = req.body;
  test.publishSettings = { mode, startAt, liveUntilType, endAt };
  test.status = mode === 'SCHEDULE' ? 'SCHEDULED' : 'PUBLISHED';
  await test.save();
  res.json({ success: true, data: formatTestResponse(test) });
});

export const getTracking = asyncHandler(async (_req, res) => {
  const tests = await Test.find({ status: { $in: ['PUBLISHED', 'SCHEDULED'] } }).sort({ updatedAt: -1 });
  const rows = tests.map((test) => ({
    id: test._id,
    name: test.name,
    subject: test.subject,
    status: test.status,
    totalQuestions: test.totalQuestions,
    completedQuestions: test.questions.length,
    totalMarks: test.totalMarks,
    attempts: Math.floor(Math.random() * 120),
    averageScore: Math.floor(45 + Math.random() * 45),
    updatedAt: test.updatedAt
  }));
  res.json({ success: true, data: rows });
});

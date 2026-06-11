import Test from '../models/Test.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const bulkCreateQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'Questions array is required' });
  }

  const createdQuestions = [];
  const questionsByTestId = {};

  for (const q of questions) {
    const testId = q.test_id;
    if (!testId) {
      throw new ApiError(400, 'test_id is required for all questions');
    }
    if (!questionsByTestId[testId]) {
      questionsByTestId[testId] = [];
    }
    questionsByTestId[testId].push(q);
  }

  for (const [testId, testQuestions] of Object.entries(questionsByTestId)) {
    const test = await Test.findById(testId);
    if (!test) {
      throw new ApiError(404, `Test not found: ${testId}`);
    }

    const startOrder = test.questions.length + 1;
    const mappedQuestions = testQuestions.map((q, idx) => {
      const options = [
        { text: q.option1 || '', isCorrect: q.correct_option === 'option1' },
        { text: q.option2 || '', isCorrect: q.correct_option === 'option2' },
        { text: q.option3 || '', isCorrect: q.correct_option === 'option3' },
        { text: q.option4 || '', isCorrect: q.correct_option === 'option4' }
      ];

      return {
        questionText: q.question,
        options,
        solution: q.explanation || '',
        difficulty: (q.difficulty || 'EASY').toUpperCase(),
        topic: test.topic,
        subTopic: test.subTopic,
        order: startOrder + idx
      };
    });

    test.questions.push(...mappedQuestions);
    
    if (test.questions.length >= test.totalQuestions) {
      test.status = 'READY';
    }
    
    await test.save();

    const newlySaved = test.questions.slice(test.questions.length - mappedQuestions.length);
    newlySaved.forEach((q, idx) => {
      const orig = testQuestions[idx];
      createdQuestions.push({
        id: q._id.toString(),
        type: orig.type || 'mcq',
        question: q.questionText,
        option1: orig.option1,
        option2: orig.option2,
        option3: orig.option3,
        option4: orig.option4,
        correct_option: orig.correct_option,
        explanation: q.solution,
        difficulty: q.difficulty.toLowerCase(),
        test_id: testId
      });
    });
  }

  res.status(201).json({
    success: true,
    data: createdQuestions,
    message: `Successfully created ${createdQuestions.length} questions`
  });
});

export const fetchBulkQuestions = asyncHandler(async (req, res) => {
  const { question_ids } = req.body;
  if (!Array.isArray(question_ids) || question_ids.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const tests = await Test.find({ 'questions._id': { $in: question_ids } });
  const data = [];

  for (const test of tests) {
    for (const q of test.questions) {
      if (question_ids.includes(q._id.toString())) {
        const opt1 = q.options[0]?.text || '';
        const opt2 = q.options[1]?.text || '';
        const opt3 = q.options[2]?.text || '';
        const opt4 = q.options[3]?.text || '';

        let correctOption = '';
        if (q.options[0]?.isCorrect) correctOption = 'option1';
        else if (q.options[1]?.isCorrect) correctOption = 'option2';
        else if (q.options[2]?.isCorrect) correctOption = 'option3';
        else if (q.options[3]?.isCorrect) correctOption = 'option4';

        data.push({
          id: q._id.toString(),
          type: 'mcq',
          question: q.questionText,
          option1: opt1,
          option2: opt2,
          option3: opt3,
          option4: opt4,
          correct_option: correctOption,
          explanation: q.solution,
          difficulty: q.difficulty.toLowerCase(),
          test_id: test._id.toString()
        });
      }
    }
  }

  res.json({ success: true, data });
});

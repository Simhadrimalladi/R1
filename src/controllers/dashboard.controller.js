import Test from '../models/Test.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const [total, draft, published, scheduled, tests] = await Promise.all([
    Test.countDocuments(),
    Test.countDocuments({ status: 'DRAFT' }),
    Test.countDocuments({ status: 'PUBLISHED' }),
    Test.countDocuments({ status: 'SCHEDULED' }),
    Test.find().sort({ updatedAt: -1 }).limit(6)
  ]);
  res.json({
    success: true,
    data: {
      stats: { total, draft, published, scheduled },
      recentTests: tests
    }
  });
});

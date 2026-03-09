import { Router } from 'express';
import FeedbackController from '@/controllers/FeedbackController.js';
import { auth } from '@/middlewares/auth.js';
import { validate } from '@/middlewares/validate.js';
import { privateRateLimit, publicRateLimit } from '@/middlewares/rateLimit.js';
import {
    CreateFeedbackRequestSchema,
    ReviewFeedbackRequestSchema,
    GetFeedbacksRequestSchema,
    DeleteFeedbackRequestSchema,
} from '@/schemas/index';

const router = Router();
const feedbackController = new FeedbackController();

// Public: submit anonymous feedback
router.post('/', publicRateLimit, validate(CreateFeedbackRequestSchema), feedbackController.createFeedback);

// Admin: get all feedbacks with pagination and filters
router.get('/', auth(), privateRateLimit, validate(GetFeedbacksRequestSchema), feedbackController.getFeedbacks);

// Admin: get statistics summary
router.get('/stats', auth(), privateRateLimit, feedbackController.getStats);

// Admin: get a specific feedback by uuid
router.get('/:feedbackId', auth(), privateRateLimit, feedbackController.getFeedbackById);

// Admin: mark feedback as reviewed with optional internal note
router.patch(
    '/:feedbackId/review',
    auth(),
    privateRateLimit,
    validate(ReviewFeedbackRequestSchema),
    feedbackController.reviewFeedback
);

// Admin: delete a feedback
router.delete(
    '/:feedbackId',
    auth(),
    privateRateLimit,
    validate(DeleteFeedbackRequestSchema),
    feedbackController.deleteFeedback
);

export default router;

import { RequestHandler } from 'express';
import FeedbackService from '@/services/FeedbackService.js';
import { GetFeedbacksQueryType, GetStatsQueryType } from '@/schemas/feedback.schema.js';

export default class FeedbackController {
    private feedbackService: FeedbackService;

    constructor() {
        this.feedbackService = new FeedbackService();
    }

    createFeedback: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.feedbackService.createFeedback(req.body);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    getFeedbacks: RequestHandler = async (req, res, next) => {
        try {
            const query = req.query as unknown as GetFeedbacksQueryType;
            const response = await this.feedbackService.getFeedbacks(query);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    getFeedbackById: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.feedbackService.getFeedbackByUuid(req.params.feedbackId);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    reviewFeedback: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.feedbackService.reviewFeedback(
                req.params.feedbackId,
                req.body
            );
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    deleteFeedback: RequestHandler = async (req, res, next) => {
        try {
            const response = await this.feedbackService.deleteFeedback(req.params.feedbackId);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };

    getStats: RequestHandler = async (req, res, next) => {
        try {
            const query = req.query as unknown as GetStatsQueryType;
            const response = await this.feedbackService.getStats(query);
            if (response.success) {
                res.status(response.code).send(response);
            } else {
                next(response.error);
            }
        } catch (error) {
            next(error);
        }
    };
}

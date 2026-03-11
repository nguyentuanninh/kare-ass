import { z } from 'zod';

const ratingSchema = z.number().int().min(1).max(5);

const CreateFeedbackBodySchema = z.object({
    service_rating: ratingSchema,
    staff_rating: ratingSchema,
    hygiene_rating: ratingSchema,
    would_recommend: z.boolean(),
    comment: z.string().max(500).optional(),
});

export const CreateFeedbackRequestSchema = z.object({
    body: CreateFeedbackBodySchema,
});

const ReviewFeedbackBodySchema = z.object({
    internal_note: z.string().max(1000).optional(),
});

export const ReviewFeedbackRequestSchema = z.object({
    body: ReviewFeedbackBodySchema,
    params: z.object({
        feedbackId: z.string(),
    }),
});

const GetFeedbacksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['pending', 'reviewed']).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export const GetFeedbacksRequestSchema = z.object({
    query: GetFeedbacksQuerySchema,
});

export const DeleteFeedbackRequestSchema = z.object({
    params: z.object({
        feedbackId: z.string(),
    }),
});

const GetStatsQuerySchema = z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export const GetStatsRequestSchema = z.object({
    query: GetStatsQuerySchema,
});

export type CreateFeedbackBodyType = z.infer<typeof CreateFeedbackBodySchema>;
export type ReviewFeedbackBodyType = z.infer<typeof ReviewFeedbackBodySchema>;
export type GetFeedbacksQueryType = z.infer<typeof GetFeedbacksQuerySchema>;
export type GetStatsQueryType = z.infer<typeof GetStatsQuerySchema>;

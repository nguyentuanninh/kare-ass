import { Model } from 'sequelize';

export interface IFeedbackStatDB extends Model {
    id: number;
    date: string;
    count: number;
    sum_service_rating: number;
    sum_staff_rating: number;
    sum_hygiene_rating: number;
    recommend_count: number;
    pending_delta: number;
    reviewed_delta: number;
    created_at: Date;
    updated_at: Date;
}

export interface IFeedbackStatResponse {
    total: number;
    avg_service_rating: number;
    avg_staff_rating: number;
    avg_hygiene_rating: number;
    avg_overall_rating: number;
    recommend_rate: number;
    pending_count: number;
    reviewed_count: number;
}

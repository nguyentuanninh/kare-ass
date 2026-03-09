import { FeedbackStatus } from '@/configs/constant.js';
import { Model } from 'sequelize';

export interface IFeedbackDB extends Model {
    id: number;
    uuid: string;
    service_rating: number;
    staff_rating: number;
    hygiene_rating: number;
    would_recommend: boolean;
    comment?: string;
    status: FeedbackStatus;
    internal_note?: string;
    created_at: Date;
    updated_at: Date;
}

export interface IFeedbackResponse {
    uuid: string;
    service_rating: number;
    staff_rating: number;
    hygiene_rating: number;
    would_recommend: boolean;
    comment?: string;
    status: FeedbackStatus;
    internal_note?: string;
    created_at: Date;
    updated_at: Date;
}

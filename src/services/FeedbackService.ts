import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { logger } from '@/configs/logger.js';
import FeedbackDao from '@/dao/FeedbackDao.js';
import FeedbackStatDao from '@/dao/FeedbackStatDao.js';
import responseHandler from '@/helpers/responseHandler.js';
import { FeedbackStatus } from '@/configs/constant.js';
import { useI18n } from '@/middlewares/asyncContext.js';
import { ApiResponse } from '@/types/api.types.js';
import { IFeedbackResponse } from '@/models/interfaces/IFeedback.js';
import {
    CreateFeedbackBodyType,
    ReviewFeedbackBodyType,
    GetFeedbacksQueryType,
    GetStatsQueryType,
} from '@/schemas/feedback.schema.js';

export default class FeedbackService {
    private feedbackDao: FeedbackDao;
    private feedbackStatDao: FeedbackStatDao;

    constructor() {
        this.feedbackDao = new FeedbackDao();
        this.feedbackStatDao = new FeedbackStatDao();
    }

    private getTodayDate = (): string => {
        return new Date().toISOString().split('T')[0];
    };

    private recordFeedbackCreated = async (feedback: {
        service_rating: number;
        staff_rating: number;
        hygiene_rating: number;
        would_recommend: boolean;
    }): Promise<void> => {
        await this.feedbackStatDao.incrementByDate(this.getTodayDate(), {
            count: 1,
            sum_service_rating: feedback.service_rating,
            sum_staff_rating: feedback.staff_rating,
            sum_hygiene_rating: feedback.hygiene_rating,
            recommend_count: feedback.would_recommend ? 1 : 0,
            pending_delta: 1,
        });
    };

    private recordFeedbackReviewed = async (): Promise<void> => {
        await this.feedbackStatDao.incrementByDate(this.getTodayDate(), {
            pending_delta: -1,
            reviewed_delta: 1,
        });
    };

    createFeedback = async (
        body: CreateFeedbackBodyType
    ): Promise<ApiResponse<IFeedbackResponse | undefined>> => {
        const i18n = useI18n();
        try {
            const feedback = await this.feedbackDao.create({
                uuid: uuidv4(),
                service_rating: body.service_rating,
                staff_rating: body.staff_rating,
                hygiene_rating: body.hygiene_rating,
                would_recommend: body.would_recommend,
                comment: body.comment || null,
                status: FeedbackStatus.PENDING,
                created_at: new Date(),
                updated_at: new Date(),
            });

            if (!feedback) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('feedback.errors.create_failed')
                );
            }

            await this.recordFeedbackCreated({
                service_rating: body.service_rating,
                staff_rating: body.staff_rating,
                hygiene_rating: body.hygiene_rating,
                would_recommend: body.would_recommend,
            });

            const { id, ...feedbackResponse } = feedback.toJSON();

            return responseHandler.returnSuccess(
                httpStatus.CREATED,
                i18n.__('feedback.success.created'),
                feedbackResponse as IFeedbackResponse
            );
        } catch (e) {
            logger.error('createFeedback', e);
            throw Error(i18n.__('feedback.errors.create_failed'));
        }
    };

    getFeedbacks = async (query: GetFeedbacksQueryType): Promise<ApiResponse> => {
        const i18n = useI18n();
        try {
            const { page, limit, status, start_date, end_date } = query;
            const offset = (page - 1) * limit;

            const where: Record<string, any> = {};

            if (status) {
                where.status = status;
            }

            if (start_date || end_date) {
                where.created_at = {};
                if (start_date) {
                    where.created_at[Op.gte] = new Date(start_date);
                }
                if (end_date) {
                    const end = new Date(end_date);
                    end.setHours(23, 59, 59, 999);
                    where.created_at[Op.lte] = end;
                }
            }

            const result = await this.feedbackDao.getDataTableData(where, {
                limit,
                offset,
                order: [['created_at', 'DESC']],
            });

            return responseHandler.returnPagination(result, page, limit);
        } catch (e) {
            logger.error('getFeedbacks', e);
            throw Error(i18n.__('feedback.errors.fetch_failed'));
        }
    };

    getFeedbackByUuid = async (
        uuid: string
    ): Promise<ApiResponse<IFeedbackResponse | undefined>> => {
        const i18n = useI18n();
        try {
            const feedback = await this.feedbackDao.findOneByWhere({ uuid });

            if (!feedback) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('feedback.errors.not_found')
                );
            }

            const { id, ...feedbackResponse } = feedback.toJSON();

            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('common.success.retrieved'),
                feedbackResponse as IFeedbackResponse
            );
        } catch (e) {
            logger.error('getFeedbackByUuid', e);
            throw Error(i18n.__('feedback.errors.fetch_failed'));
        }
    };

    reviewFeedback = async (uuid: string, body: ReviewFeedbackBodyType): Promise<ApiResponse> => {
        const i18n = useI18n();
        try {
            const feedback = await this.feedbackDao.findOneByWhere({ uuid });

            if (!feedback) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('feedback.errors.not_found')
                );
            }

            const updateData: Record<string, any> = {
                status: FeedbackStatus.REVIEWED,
                updated_at: new Date(),
            };

            if (body.internal_note !== undefined) {
                updateData.internal_note = body.internal_note;
            }

            const affectedRows = await this.feedbackDao.updateWhere(updateData, {
                where: { uuid },
            });

            if (affectedRows === 0) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('feedback.errors.update_failed')
                );
            }

            if (feedback.toJSON().status === FeedbackStatus.PENDING) {
                await this.recordFeedbackReviewed();
            }

            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('feedback.success.reviewed')
            );
        } catch (e) {
            logger.error('reviewFeedback', e);
            throw Error(i18n.__('feedback.errors.update_failed'));
        }
    };

    deleteFeedback = async (uuid: string): Promise<ApiResponse> => {
        const i18n = useI18n();
        try {
            const feedback = await this.feedbackDao.findOneByWhere({ uuid });

            if (!feedback) {
                return responseHandler.returnError(
                    httpStatus.NOT_FOUND,
                    i18n.__('feedback.errors.not_found')
                );
            }

            const deletedRows = await this.feedbackDao.deleteByWhere({ uuid });

            if (deletedRows === 0) {
                return responseHandler.returnError(
                    httpStatus.BAD_REQUEST,
                    i18n.__('feedback.errors.delete_failed')
                );
            }

            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('feedback.success.deleted')
            );
        } catch (e) {
            logger.error('deleteFeedback', e);
            throw Error(i18n.__('feedback.errors.delete_failed'));
        }
    };

    getStats = async (query: GetStatsQueryType): Promise<ApiResponse> => {
        const i18n = useI18n();
        try {
            const stats = await this.feedbackStatDao.getAggregatedStats(
                query.start_date,
                query.end_date
            );

            return responseHandler.returnSuccess(
                httpStatus.OK,
                i18n.__('common.success.retrieved'),
                stats
            );
        } catch (e) {
            logger.error('getStats', e);
            throw Error(i18n.__('feedback.errors.fetch_failed'));
        }
    };
}

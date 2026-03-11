import { Op, fn, col, literal, WhereOptions } from 'sequelize';
import models from '@/models/index.js';
import { IFeedbackStatDB, IFeedbackStatResponse } from '@/models/interfaces/IFeedbackStat.js';
import { ModelStatic } from 'sequelize';
import SuperDao from './SuperDao.js';

const FeedbackStat = models.feedbackStat as unknown as ModelStatic<IFeedbackStatDB>;

export interface FeedbackStatIncrements {
    count?: number;
    sum_service_rating?: number;
    sum_staff_rating?: number;
    sum_hygiene_rating?: number;
    recommend_count?: number;
    pending_delta?: number;
    reviewed_delta?: number;
}

export default class FeedbackStatDao extends SuperDao<IFeedbackStatDB> {
    public readonly FeedbackStat: ModelStatic<IFeedbackStatDB>;

    constructor() {
        super(FeedbackStat);
        this.FeedbackStat = FeedbackStat;
    }

    async incrementByDate(date: string, increments: FeedbackStatIncrements): Promise<void> {
        const [record] = await this.FeedbackStat.findOrCreate({
            where: { date },
            defaults: {
                date,
                count: 0,
                sum_service_rating: 0,
                sum_staff_rating: 0,
                sum_hygiene_rating: 0,
                recommend_count: 0,
                pending_delta: 0,
                reviewed_delta: 0,
            } as IFeedbackStatDB['_creationAttributes'],
        });

        await record.increment(increments as Record<string, number>);
    }

    async getAggregatedStats(
        start_date?: string,
        end_date?: string
    ): Promise<IFeedbackStatResponse> {
        const dateWhere: WhereOptions<IFeedbackStatDB> = {};
        if (start_date || end_date) {
            const dateCondition: { [Op.gte]?: string; [Op.lte]?: string } = {};
            if (start_date) dateCondition[Op.gte] = start_date;
            if (end_date) dateCondition[Op.lte] = end_date;
            (dateWhere as any).date = dateCondition;
        }

        const [ratingRow, statusRow] = await Promise.all([
            this.FeedbackStat.findOne({
                attributes: [
                    [fn('COALESCE', fn('SUM', col('count')), literal('0')), 'total'],
                    [
                        fn('COALESCE', fn('SUM', col('sum_service_rating')), literal('0')),
                        'sum_service',
                    ],
                    [fn('COALESCE', fn('SUM', col('sum_staff_rating')), literal('0')), 'sum_staff'],
                    [
                        fn('COALESCE', fn('SUM', col('sum_hygiene_rating')), literal('0')),
                        'sum_hygiene',
                    ],
                    [
                        fn('COALESCE', fn('SUM', col('recommend_count')), literal('0')),
                        'sum_recommend',
                    ],
                ],
                where: Object.keys(dateWhere).length ? dateWhere : {},
                raw: true,
            }),
            this.FeedbackStat.findOne({
                attributes: [
                    [
                        fn('COALESCE', fn('SUM', col('pending_delta')), literal('0')),
                        'pending_count',
                    ],
                    [
                        fn('COALESCE', fn('SUM', col('reviewed_delta')), literal('0')),
                        'reviewed_count',
                    ],
                ],
                raw: true,
            }),
        ]);

        const r = ratingRow as unknown as Record<string, string>;
        const s = statusRow as unknown as Record<string, string>;

        const total = parseInt(r?.total ?? '0', 10);
        const sum_service = parseInt(r?.sum_service ?? '0', 10);
        const sum_staff = parseInt(r?.sum_staff ?? '0', 10);
        const sum_hygiene = parseInt(r?.sum_hygiene ?? '0', 10);
        const sum_recommend = parseInt(r?.sum_recommend ?? '0', 10);

        if (total === 0) {
            return {
                total: 0,
                avg_service_rating: 0,
                avg_staff_rating: 0,
                avg_hygiene_rating: 0,
                avg_overall_rating: 0,
                recommend_rate: 0,
                pending_count: parseInt(s?.pending_count ?? '0', 10),
                reviewed_count: parseInt(s?.reviewed_count ?? '0', 10),
            };
        }

        const avg_service_rating = parseFloat((sum_service / total).toFixed(2));
        const avg_staff_rating = parseFloat((sum_staff / total).toFixed(2));
        const avg_hygiene_rating = parseFloat((sum_hygiene / total).toFixed(2));
        const avg_overall_rating = parseFloat(
            ((avg_service_rating + avg_staff_rating + avg_hygiene_rating) / 3).toFixed(2)
        );
        const recommend_rate = parseFloat(((sum_recommend / total) * 100).toFixed(1));

        return {
            total,
            avg_service_rating,
            avg_staff_rating,
            avg_hygiene_rating,
            avg_overall_rating,
            recommend_rate,
            pending_count: parseInt(s?.pending_count ?? '0', 10),
            reviewed_count: parseInt(s?.reviewed_count ?? '0', 10),
        };
    }
}

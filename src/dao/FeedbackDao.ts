import models from '@/models/index.js';
import { IFeedbackDB } from '@/models/interfaces/IFeedback.js';
import { ModelStatic } from 'sequelize';
import SuperDao from './SuperDao.js';

const Feedback = models.feedback as unknown as ModelStatic<IFeedbackDB>;

export default class FeedbackDao extends SuperDao<IFeedbackDB> {
    public readonly Feedback: ModelStatic<IFeedbackDB>;

    constructor() {
        super(Feedback);
        this.Feedback = Feedback;
    }
}

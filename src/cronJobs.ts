import cron from 'node-cron';
import { logger } from '@/configs/logger.js';
// schedule tasks to be run on the server
export const scheduleCronJobs = () => {
    // cron.schedule('* * * * *', () => {
    //     logger.info('Cron job executed every minute', { job: 'every_minute' });
    // });
};

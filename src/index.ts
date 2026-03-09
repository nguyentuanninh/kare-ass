import http from 'http';
import { Server } from 'socket.io';
import { rootSocket } from '@/configs/rootSocket.js';
import { config } from '@/configs/config.js';
import { app } from '@/app.js';
import { logger } from '@/configs/logger.js';
import { scheduleCronJobs } from '@/cronJobs.js';

scheduleCronJobs();

const port = config.port || 3000;

logger.info('Starting Typescript Express API...');

// socket initialization
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    path: '/api/v1/socket.io',
});
globalThis.io = io;

rootSocket(io);

server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

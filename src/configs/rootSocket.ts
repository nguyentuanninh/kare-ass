import { Server } from 'socket.io';
import { logger } from '@/configs/logger.js';

export const rootSocket = (io: Server) => {
    io.on('connection', (socket) => {
        logger.info('New socket connection', { socketId: socket.id });

        socket.on('join-new-room', (room) => {
            logger.info('Socket joining room', { socketId: socket.id, room });
            socket.join(room);
        });

        socket.on('disconnect', () => {
            logger.info('Socket disconnected', {
                socketId: socket.id,
                rooms: Array.from(socket.rooms),
            });
        });
    });
    return io;
};

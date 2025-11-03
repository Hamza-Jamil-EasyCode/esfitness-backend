import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

let io: SocketIOServer;

export function setupSocket() {
    const SOCKET_PORT = process.env.SOCKET_PORT || 4000;
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    const server = http.createServer();

    server.listen(SOCKET_PORT, () => {
        console.log(`Socket.IO server running on port ${SOCKET_PORT}`);
    });

    io = new SocketIOServer(server, {
        cors: {
            origin: CLIENT_URL
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
    });

    return io;
}

export function emitSocketEvent(eventName: string, payload: any) {
    if (io && eventName) {
        io.emit(eventName, payload || '');
    }
}

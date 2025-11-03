import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
    const numCPUs = process.env.NODE_ENV === 'production' ? os.cpus().length : 1;
    console.log(`Primary process is running. Forking ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited. Code: ${code}, Signal: ${signal}`);
        console.log('Starting a new worker...');
        cluster.fork();
    });
} else {
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is running on port ${PORT}`);
    });
}

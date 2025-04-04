// run with node --experimental-worker index.js on Node.js 10.x
const { Worker } = require('worker_threads');

module.exports = async (excutePath, workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(excutePath, { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    });
};
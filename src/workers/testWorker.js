const { workerData, parentPort } = require('worker_threads');
// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"

try {
    const dataExport = {
        username: "ok_success"
    };

    parentPort.postMessage({
        status: true,
        data: dataExport,
        worker_data: workerData,
        msg: null,
        error: null
    });
} catch (e) {
    parentPort.postMessage({
        status: false,
        msg: e.message,
        error: 500
    });
}
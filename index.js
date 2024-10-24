const express = require('express');
const { Worker } = require('worker_threads'); // Import Worker from worker_threads

const app = express();

// Function to run the CPU-intensive task in a worker thread
function runImageProcessingWorker() {
  return new Promise((resolve, reject) => {
    // Create a new worker
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');

      // Perform CPU-intensive task: image processing
      for (let i = 0; i < 100000000; i++) {
        // Simulating image processing
      }

      // Once done, notify the main thread
      parentPort.postMessage('done');
    `, { eval: true }); // The eval option allows us to pass a string to the worker

    // When the worker sends a message, resolve the promise
    worker.on('message', (message) => {
      if (message === 'done') {
        resolve();
      }
    });

    // If there's an error, reject the promise
    worker.on('error', reject);

    // If the worker exits unexpectedly, reject the promise
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// Express route for image processing
app.get('/image-process', async (req, res) => {
  try {
    // Run the CPU-intensive task in a separate thread
    await runImageProcessingWorker();

    // Send response once the task is done
    res.send('Image processed in background thread');
  } catch (err) {
    res.status(500).send('Image processing failed');
  }
});

// Define root route (optional, for clearer response)
app.get('/', (req, res) => {
  res.send('Welcome to the image processing API');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

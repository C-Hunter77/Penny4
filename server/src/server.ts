import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import routes from './routes/index.js';

dotenv.config();
const app = express();
app.use(express.json());

// Serve static files from public/
app.use(express.static(path.resolve('public')));

// Mount our API router
app.use('/api', routes);

// Fallback to index.html (for SPAs or static frontend fallback)
app.get('*', (_req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// Connect to Mongo and start server
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/socialDB')
  .then(() => {
    const port = process.env.PORT || 3001;
    app.listen(port, () =>
      console.log(`🚀 Server running at http://localhost:${port}`)
    );
  })
  .catch(err => console.error('❌ DB connection error:', err));

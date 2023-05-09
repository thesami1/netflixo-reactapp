import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import UserRouter from './Routes/UserRouter.js'
import { errorHandler } from './middlewares/errorMiddleware.js';
import MoviesRouter from './Routes/MoviesRouter.js';
import CategoriesRouter from './Routes/CategoriesRouter.js';
import UploadRouter from './Controllers/UploadFile.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//connectDB
connectDB();

// Main route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// other routes
app.use('/api/users', UserRouter);
app.use('/api/movies', MoviesRouter);
app.use('/api/categories', CategoriesRouter);
app.use('/api/upload', UploadRouter);

// error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  
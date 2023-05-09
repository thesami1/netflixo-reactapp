import express from 'express';

import { admin, protect } from '../middlewares/Auth.js';
import * as movieController from '../Controllers/MoviesController.js';

const router = express.Router();

// ********* PUBLIC ROUTES *********
router.post('/import', movieController.importMovies);
router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieById);
router.get('/rated/top', movieController.getTopRatedMovies);
router.get('/random/all', movieController.getRandomMovies);

// ********* PRIVATE ROUTES *********
router.post('/:id/reviews', protect, movieController.createMovieReview);



// ********* ADMIN ROUTES *********
router.put('/:id', protect, admin, movieController.updateMovie);
router.delete('/:id', protect, admin, movieController.deleteMovie);
router.delete('/', protect, admin, movieController.deleteAllMovie);
router.post('/', protect, admin, movieController.createMovie);


export default router;
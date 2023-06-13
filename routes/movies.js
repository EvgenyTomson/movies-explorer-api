const moviesRouter = require('express').Router();
const {
  getMovies,
  deleteMovie,
  createMovie,
} = require('../controllers/movies');

const { createMovieJoi, checkMovieIdJoi } = require('../middlewares/celebrate');

moviesRouter.get('/', getMovies);
moviesRouter.delete('/:_id', checkMovieIdJoi, deleteMovie);
moviesRouter.post('/', createMovieJoi, createMovie);

module.exports = moviesRouter;

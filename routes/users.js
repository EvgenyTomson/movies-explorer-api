const usersRouter = require('express').Router();
const {
  updateUser,
  getCurrentUser,
} = require('../controllers/users');

const { updateUserJoi } = require('../middlewares/celebrate');

usersRouter.get('/me', getCurrentUser);
usersRouter.patch('/me', updateUserJoi, updateUser);

module.exports = usersRouter;

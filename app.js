const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { PORT, DB_URI } = require('./config');
const { corsOptions } = require('./constants/constants');

const app = express();

const catchErrorsMiddleware = require('./middlewares/catchErrors');
const { requestLogger } = require('./middlewares/logger');
const { apiRateLimiter } = require('./middlewares/rateLimiter');

// const corsOptions = {
//   origin: allowedCors,
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

app.use(express.json());

mongoose.connect(DB_URI, {});

app.use(requestLogger);

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(helmet());

app.use(apiRateLimiter);

app.use('/', require('./routes/index'));

app.use(catchErrorsMiddleware);

app.listen(PORT, () => {});

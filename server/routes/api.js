import express from 'express';
var router = express.Router();

import usersRouter from './controllers/users.js';
import friendsRouter from './controllers/friends.js';
import restaurantRouter from './controllers/restaurant.js';

router.use('/users', usersRouter);
router.use('/friends', friendsRouter);
router.use('/restaurant', restaurantRouter);

export default router;
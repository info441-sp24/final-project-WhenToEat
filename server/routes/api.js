import express from 'express';
var router = express.Router();

import usersRouter from './controllers/users.js';
import friendsRouter from './controllers/friends.js';
import restaurantRouter from './controllers/restaurant.js';
import lobbiesRouter from './controllers/lobbies.js';

router.use('/users', usersRouter);
router.use('/friends', friendsRouter);
router.use('/explore', restaurantRouter);
router.use('/lobbies', lobbiesRouter);

export default router;
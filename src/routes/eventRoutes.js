const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all event routes

router.post('/', eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/category/:category', eventController.getEventsByCategory);
router.get('/upcoming', eventController.getUpcomingEvents);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
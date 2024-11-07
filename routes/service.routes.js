// service.routes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes use auth middleware
router.use(authMiddleware);

// Service management routes
router.post('/create', serviceController.createService);
router.post('/update', serviceController.updateService);
router.post('/all', serviceController.getAllServices);
router.post('/car', serviceController.getServicesByCarId);
router.post('/message', serviceController.addMessage);

module.exports = router;
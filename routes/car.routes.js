const express = require('express');
const router = express.Router();
const carController = require('../controllers/car.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes use auth middleware
router.use(authMiddleware);

// Car management routes
router.post('/add', carController.addCar);
router.post('/all', carController.getAllCars);
router.post('/user', carController.getCarsByUserId);
router.post('/delete', carController.deleteCar);
router.post('/update', carController.updateCar);

module.exports = router;
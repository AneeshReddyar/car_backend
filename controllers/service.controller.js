// service.controller.js
const Service = require('../models/service.model');
const Car = require('../models/car.model');
const User = require('../models/user.model');

exports.createService = async (req, res) => {
  try {
    const { userId, carId, scheduledDate, notes } = req.body;

    // Validate user and car existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        error: 'Car not found'
      });
    }

    // Verify car belongs to user
    if (car.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Not authorized to create service for this car'
      });
    }

    const service = await Service.create({
      userId,
      carId,
      scheduledDate,
      notes
    });

    res.status(201).json({
      message: 'Service request created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      error: 'Failed to create service request',
      details: error.message
    });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { serviceId, userId, serviceDetails, status, laborCharges } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }

    // Calculate total quotation if service details are provided
    let totalQuotation = 0;
    if (serviceDetails) {
      Object.keys(serviceDetails).forEach(key => {
        if (key !== 'other' && serviceDetails[key].price) {
          totalQuotation += serviceDetails[key].price;
        }
      });
      
      if (serviceDetails.other) {
        serviceDetails.other.forEach(item => {
          if (item.price) totalQuotation += item.price;
        });
      }
    }

    // Calculate final amount
    const finalAmount = totalQuotation + (laborCharges || service.laborCharges);

    const updateData = {
      ...(serviceDetails && { serviceDetails }),
      ...(status && { status }),
      ...(laborCharges && { laborCharges }),
      totalQuotation,
      finalAmount
    };

    if (status === 'completed') {
      updateData.completionDate = new Date();
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      error: 'Failed to update service',
      details: error.message
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const { status } = req.body;

    const filter = {};
    if (status) filter.status = status;

    const services = await Service.find(filter)
      .populate('userId', 'email userType')
      .populate('carId', 'make model variant registrationNumber')
      .sort({ createdAt: -1 });

    res.json({
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      details: error.message
    });
  }
};

exports.getServicesByCarId = async (req, res) => {
  try {
    const { carId, userId } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        error: 'Car not found'
      });
    }

    // Verify car belongs to user
    if (car.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Not authorized to view services for this car'
      });
    }

    const services = await Service.find({ carId })
      .populate('userId', 'email userType')
      .populate('carId', 'make model variant registrationNumber')
      .sort({ createdAt: -1 });

    res.json({
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Fetch car services error:', error);
    res.status(500).json({
      error: 'Failed to fetch car services',
      details: error.message
    });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { serviceId, userId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }

    service.messages.push({
      userId,
      message
    });

    await service.save();

    res.json({
      message: 'Message added successfully',
      service
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      error: 'Failed to add message',
      details: error.message
    });
  }
};
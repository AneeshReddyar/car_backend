const Car = require('../models/car.model');
const User = require('../models/user.model');

exports.addCar = async (req, res) => {
  try {
    const { userId, ...carDetails } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (user.userType !== 'customer') {
      return res.status(403).json({ 
        error: 'Only customers can add cars' 
      });
    }

    // Validate required fields
    const requiredFields = [
      'make', 'model', 'variant', 'yearOfManufacture', 'registrationYear',
      'registrationNumber', 'color', 'fuelType', 'transmission',
      'engineDisplacement', 'kilometers', 'vin', 'ownership',
      'insuranceValid', 'rtoLocation', 'price', 'description'
    ];

    const missingFields = requiredFields.filter(field => !carDetails[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate date fields
    const insuranceDate = new Date(carDetails.insuranceValid);
    if (isNaN(insuranceDate)) {
      return res.status(400).json({
        error: 'Invalid insurance validity date'
      });
    }

    // Check for duplicate VIN or registration
    const existingCar = await Car.findOne({
      $or: [
        { vin: carDetails.vin },
        { registrationNumber: carDetails.registrationNumber }
      ]
    });

    if (existingCar) {
      return res.status(400).json({
        error: 'A car with this VIN or registration number already exists'
      });
    }

    // Prepare car data
    const carData = {
      ...carDetails,
      userId,
      features: {
        powerSteering: carDetails.features?.powerSteering ?? true,
        powerWindows: carDetails.features?.powerWindows ?? false,
        airConditioner: carDetails.features?.airConditioner ?? false,
        driverAirbag: carDetails.features?.driverAirbag ?? false,
        passengerAirbag: carDetails.features?.passengerAirbag ?? false,
        alloyWheels: carDetails.features?.alloyWheels ?? false,
        multimediaSystem: carDetails.features?.multimediaSystem ?? false,
        centralLocking: carDetails.features?.centralLocking ?? false,
        abs: carDetails.features?.abs ?? false,
        parkingSensors: carDetails.features?.parkingSensors ?? false
      },
      condition: {
        exterior: carDetails.condition?.exterior || 'Good',
        interior: carDetails.condition?.interior || 'Good'
      },
      location: {
        city: carDetails.location?.city || '',
        state: carDetails.location?.state || '',
        pincode: carDetails.location?.pincode || ''
      }
    };

    const car = await Car.create(carData);
    
    res.status(201).json({
      message: 'Car added successfully',
      car
    });
  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ 
      error: 'Failed to add car',
      details: error.message 
    });
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const {
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      city,
      state,
      make,
      model,
      minYear,
      maxYear
    } = req.body;

    // Build filter object
    const filter = {};

    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (city) filter['location.city'] = city;
    if (state) filter['location.state'] = state;
    if (make) filter.make = make;
    if (model) filter.model = model;
    if (minYear) filter.yearOfManufacture = { $gte: minYear };
    if (maxYear && filter.yearOfManufacture) {
      filter.yearOfManufacture.$lte = maxYear;
    } else if (maxYear) {
      filter.yearOfManufacture = { $lte: maxYear };
    }
    if (minPrice) filter.price = { $gte: minPrice };
    if (maxPrice && filter.price) {
      filter.price.$lte = maxPrice;
    } else if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }

    const cars = await Car.find(filter)
      .populate('userId', 'email userType')
      .sort({ createdAt: -1 });
    
    res.json({ 
      count: cars.length,
      cars 
    });
  } catch (error) {
    console.error('Fetch cars error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cars',
      details: error.message 
    });
  }
};

exports.getCarsByUserId = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const cars = await Car.find({ userId })
      .populate('userId', 'email userType')
      .sort({ createdAt: -1 });
    
    res.json({ 
      count: cars.length,
      cars 
    });
  } catch (error) {
    console.error('Fetch user cars error:', error);
    console.log('Fetch user cars error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user cars',
      details: error.message 
    });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const { carId,userId } = req.body;
    // const userId = req.userId; // From auth middleware

    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({ 
        error: 'Car not found' 
      });
    }

    // Verify the car belongs to the user
    if (car.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Not authorized to delete this car' 
      });
    }

    await Car.findByIdAndDelete(carId);
    
    res.json({ 
      message: 'Car deleted successfully' 
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ 
      error: 'Failed to delete car',
      details: error.message 
    });
  }
};

// New method to update car details
exports.updateCar = async (req, res) => {
  try {
    const { carId,userId, ...updateData } = req.body;
    // const userId = req.userId;

    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({ 
        error: 'Car not found' 
      });
    }

    // Verify the car belongs to the user
    if (car.userId.toString() !== userId) {
      console.log("Not authorized to update this car");
      return res.status(403).json({ 
        error: 'Not authorized to update this car' 
      });
    }

    // Don't allow updating VIN or registration number
    delete updateData.vin;
    delete updateData.registrationNumber;
    delete updateData.userId;

    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Car updated successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('Update car error:', error);
    console.log('Update car error:', error);
    res.status(500).json({ 
      error: 'Failed to update car',
      details: error.message 
    });
  }
};
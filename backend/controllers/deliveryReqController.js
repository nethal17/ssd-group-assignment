import DeliveryRequest from "../models/deliverReqModel.js";

// Create a new delivery request
export const createDeliveryRequest = async (req, res) => {
  try {
    const {
      farmerId,
      farmerPhone,
      wasteType,
      pickupDate,
      emergencyContact,
      district,
      otherDistrict,
      location,
    } = req.body;

    // Validate required fields
    if (!farmerId || !farmerPhone || !wasteType || !pickupDate || !district || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Prepare data for saving
    const deliveryRequestData = {
      farmerId,
      farmerPhone,
      wasteType,
      pickupDate,
      emergencyContact,
      district,
      location: {
        type: "Point",
        coordinates: [location.coordinates[0], location.coordinates[1]], // MongoDB requires [lng, lat]
      },
    };

    // Add 'otherDistrict' if district is "Other"
    if (district === "Other") {
      deliveryRequestData.otherDistrict = otherDistrict;
    }

    // Save to database
    const newDeliveryRequest = new DeliveryRequest(deliveryRequestData);
    await newDeliveryRequest.save();

    res.status(201).json({ message: "Delivery request submitted successfully", data: newDeliveryRequest });
  } catch (error) {
    console.error("Error creating delivery request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all delivery requests
export const getAllDeliveryRequests = async (req, res) => {
  try {
    const deliveryRequests = await DeliveryRequest.find();
    res.status(200).json(deliveryRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery requests" });
  }
};

// Get a single delivery request by ID
export const getDeliveryRequestById = async (req, res) => {
  try {
    const deliveryRequest = await DeliveryRequest.findById(req.params.id);
    if (!deliveryRequest) {
      return res.status(404).json({ message: "Delivery request not found" });
    }
    res.status(200).json(deliveryRequest);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery request" });
  }
};

export const updateDeliveryRequestStatusById = async (req, res) => {
  try {
    const deliveryRequest = await DeliveryRequest.findById(req.params.id);

    if (!deliveryRequest) {
      return res.status(404).json({ message: "Delivery request not found" });
    }

    if (deliveryRequest.status === "Pending") {
      deliveryRequest.status = "accepted";
      await deliveryRequest.save();

      return res.status(200).json({ 
        message: "Delivery request accepted", 
        deliveryRequest 
      });
    } else if (deliveryRequest.status = "accepted"){
      deliveryRequest.status = "completed";
      await deliveryRequest.save();

      return res.status(200).json({ 
        message: "Delivery request accepted", 
        deliveryRequest 
      });
    }

    return res.status(200).json({ 
      message: `Delivery request is already ${deliveryRequest.status}`, 
      deliveryRequest 
    });

  } catch (error) {
    console.error("Error updating delivery request:", error);
    res.status(500).json({ message: "Error updating delivery request" });
  }
};

export const updateFarmerDetailsById = async (req, res) => {
  try {

      const { id } = req.params;
      const updatedData = req.body;

      const updatedFarmer = await DeliveryRequest.findByIdAndUpdate(id, updatedData, {
        new: true, 
        runValidators: true,
      });
  
      if (!updatedFarmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
  
      res.status(200).json(updatedFarmer);
    } catch (error) {
      console.error("Error updating farmer:", error );
      res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteFarmerDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFarmer = await DeliveryRequest.findByIdAndDelete(id);

    if (!deletedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.status(200).json({ message: "Farmer deleted successfully", deletedFarmer });
  } catch (error) {
    console.error("Error deleting farmer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

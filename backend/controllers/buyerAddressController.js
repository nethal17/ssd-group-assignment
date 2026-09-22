import BuyerAddress from "../models/buyerAddress.model.js";

// Save or update a buyer address
export const saveOrUpdateBuyerAddress = async (req, res) => {
  try {
    const { buyerId, address, city, postalCode, phone, saveInfo } = req.body;

    if (!buyerId) {
      return res.status(400).json({ error: "Buyer ID is required" });
    }

    const existingAddress = await BuyerAddress.findOne({ buyerId });

    if (existingAddress) {
      existingAddress.address = address;
      existingAddress.city = city;
      existingAddress.postalCode = postalCode;
      existingAddress.phone = phone;
      existingAddress.saveInfo = saveInfo;
      
      await existingAddress.save();

      return res.status(200).json({ message: "Buyer address updated successfully", data: existingAddress });
    } else {
      const newAddress = new BuyerAddress({
        buyerId,
        address,
        city,
        postalCode,
        phone,
        saveInfo,
      });

      await newAddress.save();
      return res.status(201).json({ message: "Buyer address saved successfully", data: newAddress });
    }
  } catch (error) {
    console.error("Error saving/updating buyer address:", error);
    res.status(500).json({ error: "Failed to save or update buyer address" });
  }
};

// Get all buyer addresses
export const getBuyerAddresses = async (req, res) => {
  try {
    const addresses = await BuyerAddress.find();
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching buyer addresses:", error);
    res.status(500).json({ error: "Failed to fetch buyer addresses" });
  }
};

// Get address by buyer ID  
export const getAddressByBuyerId = async (req, res) => {
  try {
    const { buyerId } = req.params;
    
    if (!buyerId) {
      return res.status(400).json({ error: "Buyer ID is required" });
    }

    const address = await BuyerAddress.findOne({ buyerId });
    
    if (!address) {
      return res.status(404).json({ message: "Address not found for this buyer" });
    }
    res.status(200).json(address);
  } catch (error) {
    console.error("Error fetching buyer address:", error);
    res.status(500).json({ error: "Failed to fetch buyer address" });
  }
};

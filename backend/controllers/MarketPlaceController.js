import mongoose from 'mongoose';
import Marketplace from '../models/Marketplace.js';
import ProductListing from '../models/ProductListing.js';
import nodemailer from 'nodemailer';

export const getFarmerListings = async (req, res) => {
    try {
      const { farmerId } = req.params;
  
      // Validate farmerId
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        return res.status(400).json({ message: 'Invalid farmerId.' });
      }
  
      // Find all products associated with the farmer
      const products = await ProductListing.find({ farmerId: farmerId}); // Populate farmer details
  
      if (products.length === 0) {
        return res.status(404).json({ message: 'No listings found for this farmer.' });
      }
  
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

export const getListingDetails = async (req, res) => {
    try {
      const { listingId } = req.params;
  
      // Validate listingId
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID.' });
      }
  
      // Find the listing
      const listing = await ProductListing.findById(listingId).populate('farmerId', 'name email');
  
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found.' });
      }
  
      res.status(200).json(listing);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

export const deleteListing = async (req, res) => {
    try {
      const { listingId } = req.params;
  
      // Validate listingId
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID.' });
      }
  
      // Find and delete the listing
      const deletedListing = await ProductListing.findByIdAndDelete(listingId);
  
      if (!deletedListing) {
        return res.status(404).json({ message: 'Listing not found.' });
      }
  
      res.status(200).json({ message: 'Listing deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid product ID.' 
            });
        }

        // Find the product and populate farmer details
        const product = await Marketplace.findById(productId)
            .populate('farmerId', 'name email phone')
            .select('-__v'); // Exclude version key

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found.' 
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching product',
            error: error.message 
        });
    }
};  

export const getAllListings = async (req, res) => {
  try {
    // First, check for and remove expired listings
    const now = new Date();
    const expiredListings = await ProductListing.find({
      expireDate: { $lte: now },
      status: { $ne: 'Rejected' } // Don't process already rejected listings
    }).populate('farmerId', 'name email');

    // Process each expired listing
    for (const listing of expiredListings) {
      try {
        // Send email notification to farmer
        if (listing.farmerId && listing.farmerId.email) {
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { 
              user: process.env.EMAIL_USER, 
              pass: process.env.EMAIL_PASS 
            }
          });

          const mailOptions = {
            to: listing.farmerId.email,
            from: process.env.EMAIL_USER,
            subject: `Your Product Listing for ${listing.wasteItem} Has Expired`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">AgriWaste Management</h2>
                <p>Dear ${listing.farmerId.name || 'Valued Farmer'},</p>
                
                <p>We would like to inform you that your product listing has been removed from our marketplace because it has expired.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Product Details</h3>
                  <p><strong>Product:</strong> ${listing.wasteItem}</p>
                  <p><strong>Category:</strong> ${listing.wasteCategory}</p>
                  <p><strong>Type:</strong> ${listing.wasteType}</p>
                  <p><strong>Quantity:</strong> ${listing.quantity}</p>
                  <p><strong>Price:</strong> ${listing.price}</p>
                  <p><strong>Expiry Date:</strong> ${listing.expireDate.toDateString()}</p>
                </div>
                
                <p>If you'd like to relist this product, please create a new listing with updated details.</p>
                
                <p>Best regards,<br>The AgriWaste Management Team</p>
                
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                  <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
        }

        // Remove the expired listing
        await ProductListing.findByIdAndDelete(listing._id);
      } catch (error) {
        console.error(`Failed to process expired listing ${listing._id}:`, error);
        // Continue with next listing even if one fails
      }
    }

    // Now get all active listings
    const listings = await ProductListing.find({
      expireDate: { $gt: now },
      status: 'Approved'
    }).populate('farmerId', 'name email');
    
    res.status(200).json(listings);
  } catch (error) {
    console.error('Error in getAllListings:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getWasteByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validate category
    if (!category) {
      return res.status(400).json({ 
        success: false,
        message: 'Category is required.' 
      });
    }

    // Define waste types for each category
    const wasteTypes = {
      'Organic Waste': ['Crop Residues', 'Fruit & Vegetable Waste', 'Plantation Waste', 'Nut & Seed Waste', 'Livestock & Dairy Waste', 'Forestry Waste'],
      'Inorganic Waste': ['Chemical Waste', 'Plastic Waste', 'Metal Waste', 'Fabric & Textile Waste', 'Glass & Ceramic Waste', 'Rubber Waste']
    };

    // Get the waste types for the requested category
    const categoryWasteTypes = wasteTypes[category] || [];

    // Find all products where wasteItem matches any of the category's waste types
    const products = await Marketplace.find({
      wasteItem: { $in: categoryWasteTypes }
    })
    .populate('farmerId', 'name email phone')
    .select('-__v'); // Exclude version key

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No products found in this category.' 
      });
    }

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching products by category',
      error: error.message 
    });
  }
};

export const getWasteDetailsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validate category
    if (!category) {
      return res.status(400).json({ 
        success: false,
        message: 'Category is required.' 
      });
    }

    // Find all product listings in the specified category
    const products = await ProductListing.find({ 
      wasteCategory: category,
      status: 'Approved' // Only get approved listings
    })
    .populate('farmerId', 'name phone')
    .select('-__v'); // Exclude version key

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No waste details found in this category.' 
      });
    }

    // Transform the data to include waste type details
    const wasteDetails = products.map(product => ({
      _id: product._id,
      wasteCategory: product.wasteCategory,
      wasteType: product.wasteType,
      wasteItem: product.wasteItem,
      description: product.description,
      location: {
        province: product.province,
        district: product.district,
        city: product.city
      },
      quantity: product.quantity,
      price: product.price,
      expireDate: product.expireDate,
      image: product.image,
      farmer: {
        name: product.farmerId?.name,
        email: product.farmerId?.email,
        phone: product.farmerId?.phone
      }
    }));

    res.status(200).json({
      success: true,
      data: wasteDetails
    });

  } catch (error) {
    console.error('Error fetching waste details by category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching waste details by category',
      error: error.message 
    });
  }
};

export const getWasteDetailsByType = async (req, res) => {
  try {
    const { wasteType } = req.params;

    // Validate waste type
    if (!wasteType) {
      return res.status(400).json({ 
        success: false,
        message: 'Waste type is required.' 
      });
    }

    // Create a case-insensitive regex for the waste type
    const wasteTypeRegex = new RegExp(wasteType.replace(/\s+/g, '\\s*'), 'i');

    // Find all product listings with the specified waste type
    const products = await ProductListing.find({ 
      $or: [
        { wasteType: wasteTypeRegex },
        { wasteItem: wasteTypeRegex }
      ],
      status: 'Approved' // Only get approved listings
    })
    .populate('farmerId', 'name phone email')
    .select('-__v'); // Exclude version key

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: `No waste details found for ${wasteType}.` 
      });
    }

    // Transform the data to include waste details
    const wasteDetails = products.map(product => ({
      _id: product._id,
      wasteCategory: product.wasteCategory,
      wasteType: product.wasteType,
      wasteItem: product.wasteItem,
      description: product.description,
      location: {
        province: product.province,
        district: product.district,
        city: product.city
      },
      quantity: product.quantity,
      price: product.price * 1.2,
      expireDate: product.expireDate,
      image: product.image,
      farmerId: product.farmerId,
      farmer: {
        name: product.farmerId?.name,
        email: product.farmerId?.email,
        phone: product.farmerId?.phone
      }
    }));

    res.status(200).json({
      success: true,
      data: wasteDetails
    });

  } catch (error) {
    console.error('Error fetching waste details by type:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching waste details by type',
      error: error.message 
    });
  }
};

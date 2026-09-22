
import Product from '../models/Product.js'; // Import the Product model
import mongoose from 'mongoose';

// Get product details by ID
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Return the product details
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details.', error: error.message });
  }
};

// Get all listings for a specific farmer
export const getFarmerListings = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Validate farmerId
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmerId.' });
    }

    // Find all products associated with the farmer
    const products = await Marketplace.find({ farmerId: farmerId}); // Populate farmer details

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
    const listing = await Product.findById(listingId).populate('farmerId', 'name email');

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
    const deletedListing = await Product.findByIdAndDelete(listingId);

    if (!deletedListing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    res.status(200).json({ message: 'Listing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
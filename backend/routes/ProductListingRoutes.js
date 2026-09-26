import express from 'express';
import { 
  getWasteTypes, 
  getWasteItems, 
  getDistricts,
  createProductListing,
  getAllProductListings,
  approveProductListing,
  deleteProductListing,
  getApprovedProductListings,
  getRandomApprovedProduct,
  getRandomApprovedProductListings
} from '../controllers/ProductListingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';


const router = express.Router();

// Routes for dynamic dropdowns
router.get('/waste-types/:wasteCategory', getWasteTypes);
router.get('/waste-items/:wasteType', getWasteItems);
router.get('/districts/:province', getDistricts);

// Route for creating a product listing
router.post('/create', authMiddleware, createProductListing);

// Route for getting only approved product listings
router.get('/listings/approved', getApprovedProductListings);


router.get('/random-approved', getRandomApprovedProduct);
router.get('/random-approved-listings', getRandomApprovedProductListings);

// Admin routes
router.get('/admin/listings', authMiddleware, authorizeRoles("admin"), getAllProductListings);
router.put('/admin/approve/:listingId', authMiddleware, authorizeRoles("admin"), approveProductListing);
router.delete('/admin/delete/:listingId', authMiddleware, authorizeRoles("admin"), deleteProductListing);

export default router;
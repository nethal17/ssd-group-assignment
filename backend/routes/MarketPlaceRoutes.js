import express from 'express';
import {
  getFarmerListings,
  getListingDetails,
  deleteListing,
  getProductById,
  getAllListings,
  getWasteByCategory,
  getWasteDetailsByCategory,
  getWasteDetailsByType
} from '../controllers/marketPlaceController.js';

const router = express.Router();

router.get('/farmer-listings/:farmerId', getFarmerListings);
router.get('/listings-details/:listingId', getListingDetails);
router.delete('/listings-delete/:listingId', deleteListing);
router.get('/product/:productId', getProductById);
router.get('/listings', getAllListings);
router.get('/waste/:category', getWasteByCategory);
router.get('/waste-details/:category', getWasteDetailsByCategory);
router.get('/waste-type/:wasteType', getWasteDetailsByType);

export default router;


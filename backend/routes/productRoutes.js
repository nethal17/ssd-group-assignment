import express from 'express';
import { getProductById,getFarmerListings,getListingDetails,deleteListing} from '../controllers/productController.js'; 


const router = express.Router();

// Route to get product details by ID
router.get('/get-product/:productId', getProductById);
router.get('/farmer-listings/:farmerId', getFarmerListings);
router.get('/listings-details/:listingId', getListingDetails);
router.delete('/listings-delete/:listingId', deleteListing);


export default router;


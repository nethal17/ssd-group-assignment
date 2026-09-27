import express from 'express';
import { getProductById,getFarmerListings,getListingDetails,deleteListing} from '../controllers/productController.js'; 
import { validate } from "../validation/validate.js";
import { listingIdParams } from "../validation/schemas/listing.schemas.js";


const router = express.Router();

// Route to get product details by ID
router.get('/get-product/:productId', getProductById);
router.get('/farmer-listings/:farmerId', getFarmerListings);
router.get('/listings-details/:listingId', getListingDetails);
router.delete('/listings-delete/:listingId', validate({ params: listingIdParams }), deleteListing);


export default router;


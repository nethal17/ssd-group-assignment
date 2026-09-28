import express from 'express';
import {
  addReview,
  publishReview,
  getPendingReviews,
  getPublishedReviews,
  getFarmerAverageRating,
  getFarmerReviews,
  deleteReview,
  getReviewDetails,
  getTopRandomReviews
} from '../controllers/reviewController.js'; 
import { validate } from "../validation/validate.js";
import { addReviewBody, reviewIdParams, deleteReviewBody } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();


router.post('/add', validate({ body: addReviewBody }), addReview);
router.get('/random-top-reviews', getTopRandomReviews);
router.put('/publish/:reviewId', validate({ params: reviewIdParams }), publishReview);
router.get('/pending', getPendingReviews);
router.get('/published/:productId', getPublishedReviews);
router.get('/average-rating/:farmerId', getFarmerAverageRating);
router.delete('/review-delete/:reviewId', validate({ params: reviewIdParams, body: deleteReviewBody }), deleteReview);
router.get('/details/:reviewId', getReviewDetails);
router.get('/farmer-reviews/:farmerId', getFarmerReviews);

export default router;

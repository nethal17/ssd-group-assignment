import Review from '../models/Review.js';
import OrderHistory from '../models/orderHistory.model.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';
import nodemailer from "nodemailer";


// Add a review (Buyer)
export const addReview = async (req, res) => {
  try {
    const { buyerId, orderId, farmerId, productName, rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(buyerId) ||
        !mongoose.Types.ObjectId.isValid(farmerId) ||
        !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid IDs provided.' });
    }

    const order = await OrderHistory.findOne({
      _id: orderId,
      userId: buyerId,
      orderStatus: 'toReview'
    });

    if (!order) {
      return res.status(403).json({ 
        message: 'You can only review products from valid orders.' 
      });
    }

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this order.' 
      });
    }

    const newReview = new Review({
      buyerId,
      orderId,
      farmerId,
      productName,
      rating,
      review,
      status: 'pending'
    });

    await newReview.save();

    // Send email notification to buyer
    try {
      const buyer = await User.findById(buyerId);
      if (buyer && buyer.email) {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS 
          }
        });

        const mailOptions = {
          to: buyer.email,
          from: process.env.EMAIL_USER,
          subject: `Your Review for ${productName} is Pending Approval`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">AgriWaste Management</h2>
              <p>Dear ${buyer.name || 'Valued Customer'},</p>
              
              <p>Thank you for submitting your review!</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                <h3 style="margin-top: 0;">Review Details</h3>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Rating:</strong> ${rating}/5</p>
                <p><strong>Your Review:</strong> ${review}</p>
                <p><strong>Status:</strong> Pending Approval</p>
              </div>
              
              <p>Your review is currently being reviewed by our team. We'll notify you once it's been published.</p>
              
              <p>Best regards,<br>The AgriWaste Management Team</p>
              
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.error('Failed to send review submission email:', emailError);
    }

    res.status(201).json({ message: 'Review submitted successfully.', review: newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Failed to submit review.', error: error.message });
  }
};

// Publish a review (Manager)
export const publishReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Validate buyerId and farmerId
    if (!mongoose.Types.ObjectId.isValid(review.buyerId)) {
      return res.status(400).json({ message: 'Invalid buyerId.' });
    }

    // Update review status to published
    review.status = 'published';
    await review.save();

    // Get buyer and farmer details
    const buyer = await User.findById(review.buyerId);
    const farmer = await User.findById(review.farmerId);
    
    // Send email to buyer
    if (buyer && buyer.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS 
          }
        });

        const mailOptions = {
          to: buyer.email,
          from: process.env.EMAIL_USER,
          subject: `Your Review for ${review.productName} Has Been Published`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">AgriWaste Management</h2>
              <p>Dear ${buyer.name || 'Valued Customer'},</p>
              
              <p>We're pleased to inform you that your review has been published!</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                <h3 style="margin-top: 0;">Review Details</h3>
                <p><strong>Product:</strong> ${review.productName}</p>
                <p><strong>Rating:</strong> ${review.rating}/5</p>
                <p><strong>Your Review:</strong> ${review.review}</p>
                <p><strong>Status:</strong> Published</p>
              </div>
              
              <p>Thank you for sharing your experience with our community.</p>
              
              <p>Best regards,<br>The AgriWaste Management Team</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send review published email to buyer:', emailError);
      }
    }

    // Send email to farmer
    if (farmer && farmer.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS 
          }
        });

        const mailOptions = {
          to: farmer.email,
          from: process.env.EMAIL_USER,
          subject: `New Review for Your Product: ${review.productName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">AgriWaste Management</h2>
              <p>Dear ${farmer.name || 'Valued Farmer'},</p>
              
              <p>You have received a new review for your product!</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                <h3 style="margin-top: 0;">Review Details</h3>
                <p><strong>Product:</strong> ${review.productName}</p>
                <p><strong>Rating:</strong> ${review.rating}/5</p>
                <p><strong>Review:</strong> ${review.review}</p>
              </div>
              
              <p>Customer feedback is valuable for improving your products and services.</p>
              
              <p>Best regards,<br>The AgriWaste Management Team</p>
              
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send new review notification to farmer:', emailError);
      }
    }

    res.status(200).json({ message: 'Review published successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending reviews (Manager Dashboard)
export const getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await Review.find({ status: 'pending' })
      .populate({
        path: 'buyerId',
        select: 'name', // Only select the 'name' field from User
        model: 'User' // Specify the model to populate from
      });
      
    if (!pendingReviews || pendingReviews.length === 0) {
      return res.status(404).json({ message: 'No pending reviews found.' });
    }

    res.status(200).json(pendingReviews);
  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get 3 random published reviews with rating 4 or 5
export const getTopRandomReviews = async (req, res) => {
  try {
    // Only published reviews with rating 4 or 5
    const pipeline = [
      { $match: { status: 'published', rating: { $in: [4, 5] } } },
      { $sample: { size: 3 } },
      { $lookup: {
          from: 'users',
          localField: 'buyerId',
          foreignField: '_id',
          as: 'buyerInfo'
        }
      },
      { $unwind: '$buyerInfo' },
      { $project: {
          _id: 1,
          productName: 1,
          rating: 1,
          review: 1,
          createdAt: 1,
          buyer: { name: '$buyerInfo.name', _id: '$buyerInfo._id' }
        }
      }
    ];
    const reviews = await Review.aggregate(pipeline);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get published reviews (Marketplace)
export const getPublishedReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const publishedReviews = await Review.find({ productId, status: 'published' }).populate('buyerId');
    res.status(200).json(publishedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get average rating for a farmer
export const getFarmerAverageRating = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Get all published reviews for the farmer
    const reviews = await Review.find({ farmerId, status: 'published' });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.status(200).json({ averageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    // Delete the review and log the reason
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get review details by reviewId
export const getReviewDetails = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID.' });
    }

    const review = await Review.findById(reviewId)
      .populate('buyerId', 'name email')
      .populate({
        path: 'productId',
        model: 'Marketplace',
        select: 'wasteItem description price farmerId'
      });

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFarmerReviews = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmer ID.' });
    }
    /* Find all reviews for products belonging to this farmer
    const reviews = await Review.find()
      .populate({
        path: 'productId',
        match: { farmerId: farmerId },
        model: 'Marketplace',
        select: 'wasteItem'
      })
      .populate('buyerId', 'name email');
    // Filter out reviews that don't have a product (due to the match)
    const filteredReviews = reviews.filter(review => review.productId);
    if (filteredReviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this farmer.' });
    }
    res.status(200).json(filteredReviews);*/
    // Find all reviews for this farmer
    const reviews = await Review.find({ farmerId })
    .populate('buyerId', 'name email');
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this farmer.' });
    }
    // Populate buyerId and productId details


    res.status(200).json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
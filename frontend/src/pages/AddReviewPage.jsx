import React, { useEffect, useState } from 'react';
import { apiService, API_URL } from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { FaStar } from 'react-icons/fa';

export const AddReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, buyerId } = location.state || { productId: '', buyerId: '' };
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    console.log('Location State:', location.state);
    
    if (!productId || !buyerId) {
      toast.error('Product ID or Buyer ID is missing.');
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('No token found, please login again.');
          return;
        }

        const response = await apiService.get(`/api/products/${productId}`);
        console.log('Product Details:', response.data);
      } catch (error) {
        const errorMessage = error.response?.status === 404 ? 'Product not found.' : 'Failed to fetch product details.';
        toast.error(errorMessage);
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [productId, buyerId, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !buyerId) {
      toast.error('Product ID or Buyer ID is missing.');
      return;
    }

    try {
      await apiService.post(
        `/api/reviews/add`,
        { productId, buyerId, rating, review }
      );

      // Show success toast message
      toast.success('Your review is under pending, review submitted successfully.');

      // Navigate to the profile page
      navigate('/profile');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error submitting review.';
      toast.error(`Error: ${errorMessage}`);
      console.error('Error submitting review:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Add Review</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating:</label>
            <div className="flex space-x-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={30}
                  className={`cursor-pointer transition-colors ${
                    star <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                />
              ))}
            </div>
          </div>

          {/* Review Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review:</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              rows={5}
              placeholder="Write your review here..."
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Submit Review
            </button>
          </div>


        </form>
      </div>
    </>
  );
};
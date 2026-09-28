import { useState } from 'react';
import { apiService } from '../utils/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { FaStar } from 'react-icons/fa';

export const AddReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // A review belongs to one of the buyer's orders: /add-review?orderId=... or navigation state.
  // The server works out the buyer (from the login), farmer and product (from the order).
  const orderId = location.state?.orderId || searchParams.get('orderId') || '';
  const productName = location.state?.productName || '';
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId) {
      toast.error('Please open this page from one of your orders.');
      return;
    }
    if (rating < 1) {
      toast.error('Please choose a rating.');
      return;
    }

    try {
      await apiService.post(
        `/api/reviews/add`,
        { orderId, rating, review }
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
        {productName && <p className="mb-6 text-center text-gray-600">{productName}</p>}
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
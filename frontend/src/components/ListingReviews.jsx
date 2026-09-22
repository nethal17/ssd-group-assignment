import { apiService } from "../utils/api";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {  FiUser, FiPackage, FiMessageSquare } from "react-icons/fi";
import { RiStarSFill } from "react-icons/ri";

export const ListingReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (!token || !userData?._id) {
          setReviews([]);
          toast.error("Please login to view reviews");
          return;
        }

        const response = await apiService.get(
          `/api/reviews/farmer-reviews/${userData._id}`
        );
        
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error("Failed to fetch reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex flex-col items-start mb-8 space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 font-poppins">Customer Feedback</h2>
        <p className="text-gray-500">What buyers are saying about your products</p>
      </div>
      
      {/* Stats Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-full bg-green-100 text-green-600">
                <RiStarSFill className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-full bg-blue-100 text-blue-600">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-800">{reviews.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-green-500 to-green-600">
              <tr>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">No</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Product</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Rating</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Review</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Buyer</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <tr 
                    key={review._id} 
                    className="transition-all duration-200 hover:shadow-md hover:scale-[1.005]"
                  >
                    <td className="px-8 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-800">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                          <FiPackage className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="truncate max-w-[180px]">{review.productName || "Unknown Product"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <RiStarSFill
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-600">
                      <div className="relative">
                        <div className="absolute -left-3 top-1 w-1 h-6 bg-green-400 rounded-full"></div>
                        <p className="pl-3 italic line-clamp-2">"{review.review}"</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-blue-600">
                          {review.buyerId?.name || "Unknown Buyer"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 mb-4 rounded-full bg-gray-100">
                        <FiMessageSquare className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-gray-700">No reviews yet</h3>
                      <p className="max-w-md text-gray-500">Your products haven't received any reviews yet. Check back later!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
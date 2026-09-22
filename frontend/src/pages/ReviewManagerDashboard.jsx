import React, { useEffect, useState } from 'react';
import { apiService } from '../utils/api';
import { toast } from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { FaCheck, FaTrash, FaEye, FaSpinner, FaSearch } from 'react-icons/fa';

export const ReviewManagerDashboard = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await apiService.get(`/api/reviews/pending?timestamp=${Date.now()}`);
      setPendingReviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching pending reviews:', error.response?.data?.message || error.message);
      toast.error('Failed to fetch pending reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishReview = async (reviewId) => {
    try {
      const response = await apiService.put(`/api/reviews/publish/${reviewId}`);
      if (response.status === 200) {
        toast.success(response.data?.message || 'Review published successfully!');
        fetchPendingReviews();
      } else {
        toast.error(response.data?.message || 'Failed to publish review. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing review:', error.response?.data?.message || error.message);
      const errorMsg = error?.response?.data?.message || 'Failed to publish review. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await apiService.delete(`/api/reviews/review-delete/${reviewId}`);
      fetchPendingReviews();
      toast.success('Review deleted successfully!');
    } catch (error) {
      console.error('Error deleting review:', error.response?.data?.message || error.message);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  const handlePreviewReview = async (reviewId) => {
    try {
      const response = await apiService.get(`/api/reviews/details/${reviewId}`);
      setSelectedReview(response.data);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Error fetching review details:', error.response?.data?.message || error.message);
      toast.error('Failed to fetch review details. Please try again.');
    }
  };

  const filteredReviews = pendingReviews.filter(review => 
    review.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Review Management</h2>
              <p className="text-gray-600 mt-2">Manage and moderate pending product reviews</p>
            </div>
            <div className="relative mt-4 md:mt-0 w-full md:w-64">
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-green-500" />
                <span className="ml-3 text-gray-600">Loading reviews...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No pending reviews found</h3>
                <p className="text-gray-500">{searchTerm ? 'Try a different search term' : 'All reviews have been processed'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-300">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                        Review
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                              {review.buyerId?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {review.buyerId?.name || "Unknown Buyer"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{review.productName || "Unknown Product"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                            {review.review}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handlePreviewReview(review._id)}
                              className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePublishReview(review._id)}
                              className="p-2 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              title="Publish"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {isPreviewModalOpen && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Review Details</h3>
                  <button
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-lg">
                      {selectedReview.buyerId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {selectedReview.buyerId?.name || "Unknown Buyer"}
                      </h4>
                      <div className="flex items-center mt-1">
                        {renderStars(selectedReview.rating)}
                        <span className="ml-2 text-sm text-gray-500">{selectedReview.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-1">Product</h4>
                    <p className="text-gray-700">{selectedReview.productName || "Unknown Product"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-1">Review</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedReview.review}</p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        handlePublishReview(selectedReview._id);
                        setIsPreviewModalOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaCheck className="mr-2" /> Publish
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteReview(selectedReview._id);
                        setIsPreviewModalOpen(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
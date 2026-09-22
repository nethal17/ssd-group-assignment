import { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { toast } from 'react-hot-toast';
import { FiPackage, FiCheck, FiTrash2, FiEye, FiCalendar, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { FiUser, FiFileText, FiDollarSign, FiLayers, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export const InventoryManagerDashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expireDate) => {
    const today = new Date();
    const expiry = new Date(expireDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expireDate) => {
    const daysRemaining = getDaysRemaining(expireDate);
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 7) return 'soon';
    return 'ok';
  };

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No token found, please login again.');
        navigate("/login");
        return;
      }

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userRole = userData.role;
      if (userRole !== "admin") {
        toast.error("Only Admin can list agri-waste");
        navigate("/");
        return;
      }

      const response = await apiService.get('/api/product-listing/admin/listings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedListings = response.data
        .map(listing => ({
          ...listing,
          daysUntilExpiry: getDaysRemaining(listing.expireDate),
          expiryStatus: getExpiryStatus(listing.expireDate),
          formattedExpiry: formatDate(listing.expireDate)
        }))
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

      setListings(processedListings);
      
    } catch (error) {
      console.error('Error fetching listings:', error.response?.data?.message || error.message);
      toast.error('Failed to fetch listings. Please try again.');
    }
  };

  const pendingListings = listings.filter((listing) => listing.status === 'Pending');

  const handleApprove = async (listingId) => {
    setApproving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No token found, please login again.');
        return;
      }

      await apiService.put(`/api/product-listing/admin/approve/${listingId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Listing approved and moved to Marketplace.');
      fetchListings();
    } catch (error) {
      console.error('Error approving listing:', error.response?.data?.message || error.message);
      toast.error('Failed to approve listing. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No token found, please login again.');
        return;
      }

      const listingToDelete = listings.find(listing => listing._id === productToDelete);
      if (!listingToDelete) {
        toast.error('Listing not found');
        return;
      }

      const farmerEmail = listingToDelete.farmerId?.email;
      if (!farmerEmail) {
        toast.error('Farmer email not found');
        return;
      }

      await apiService.delete(`/api/product-listing/admin/delete/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { 
          reason: deleteReason,
          farmerEmail: farmerEmail,
          productName: listingToDelete.wasteItem
        },
      });

      toast.success('Listing deleted successfully and farmer notified.');
      setShowDeleteModal(false);
      setDeleteReason('');
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePreview = (listing) => {
    setSelectedProduct(listing);
    setShowPreviewModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired': return <FiAlertTriangle className="w-4 h-4 mr-1" />;
      case 'soon': return <FiClock className="w-4 h-4 mr-1" />;
      default: return <FiCheck className="w-4 h-4 mr-1" />;
    }
  };

  const getStatusText = (days) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires Today';
    if (days === 1) return '1 Day Left';
    if (days <= 7) return `${days} Days Left`;
    return 'OK';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Dashboard Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm w-fit">
              <FiPackage className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pending Listings</h1>
              <p className="text-white/90">Review and manage product listings from farmers</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b">
          {[
            { label: 'Total Pending', value: pendingListings.length, badge: 'Today', color: 'green' },
            { label: 'Expired', value: pendingListings.filter(l => l.expiryStatus === 'expired').length, badge: 'Urgent', color: 'red' },
            { label: 'Expiring Soon', value: pendingListings.filter(l => l.expiryStatus === 'soon').length, badge: 'Warning', color: 'yellow' },
            { label: 'OK', value: pendingListings.filter(l => l.expiryStatus === 'ok').length, badge: 'Good', color: 'green' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
                <span className={`bg-${stat.color}-100 text-${stat.color}-800 text-xs font-medium px-2 py-0.5 rounded-full`}>
                  {stat.badge}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Listings Table Container */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiUser className="mr-2 opacity-70" /> Farmer
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiPackage className="mr-2 opacity-70" /> Product
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiDollarSign className="mr-2 opacity-70" /> Price
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiLayers className="mr-2 opacity-70" /> Qty
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 opacity-70" /> Expiry
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiSettings className="mr-2 opacity-70" /> Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {pendingListings.map((listing) => {
                  const statusIcon = getStatusIcon(listing.expiryStatus);
                  const statusText = getStatusText(listing.daysUntilExpiry);
                  
                  return (
                    <tr 
                      key={listing._id} 
                      className={`hover:bg-gray-50 ${
                        listing.expiryStatus === 'expired' ? 'bg-red-50/50' : 
                        listing.expiryStatus === 'soon' ? 'bg-yellow-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center border border-green-100 shadow-sm">
                            <span className="text-xs font-medium text-green-800">
                              {(listing.farmerId?.name || 'Unknown')[0]}
                            </span>
                            <span className={`absolute -bottom-1 -right-1 h-2 w-2 rounded-full border-2 border-white ${
                              listing.expiryStatus === 'expired' ? 'bg-red-500' : 
                              listing.expiryStatus === 'soon' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></span>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{listing.farmerId?.name || 'Unknown Farmer'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${
                            listing.expiryStatus === 'expired' ? 'bg-red-500' : 
                            listing.expiryStatus === 'soon' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{listing.wasteItem}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Rs.{listing.price}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{listing.quantity} units</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">
                            {listing.formattedExpiry}
                          </span>
                          {(listing.expiryStatus === 'soon' || listing.expiryStatus === 'expired') && (
                            <span className={`text-xs ${
                              listing.expiryStatus === 'expired' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {statusIcon} {statusText}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handlePreview(listing)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                            title="Preview"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleApprove(listing._id)}
                            disabled={approving}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200"
                            title="Approve"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setProductToDelete(listing._id);
                              setShowDeleteModal(true);
                            }}
                            disabled={deleting}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pendingListings.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FiPackage className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">No pending listings</h4>
                <p className="text-gray-500 max-w-md mx-auto">All listings have been reviewed. Check back later for new submissions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {showPreviewModal && selectedProduct && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl">
      {/* Modal Header */}
      <div className="relative">
        {selectedProduct.image ? (
          <div className="h-48 w-full bg-gradient-to-r from-green-100 to-emerald-100 overflow-hidden">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.wasteItem}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-center">
            <FiPackage className="w-16 h-16 text-green-400" />
          </div>
        )}
        <div className="absolute -bottom-4 left-4">
          <div className="h-16 w-16 rounded-xl bg-white shadow-lg border-4 border-white overflow-hidden">
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.wasteItem}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-100 flex items-center justify-center">
                <FiPackage className="w-8 h-8 text-green-600" />
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowPreviewModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Content */}
      <div className="pt-8 px-6 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.wasteItem}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selectedProduct.expiryStatus === 'expired' ? 'bg-red-100 text-red-800' :
                selectedProduct.expiryStatus === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getStatusText(selectedProduct.daysUntilExpiry)}
              </span>
              <span className="text-sm text-gray-500">Expires: {selectedProduct.formattedExpiry}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-2xl font-bold text-emerald-600">Rs.{selectedProduct.price}</p>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-500 uppercase font-medium">Quantity</p>
            <p className="text-lg font-semibold text-gray-900">{selectedProduct.quantity} units</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-500 uppercase font-medium">Farmer</p>
            <p className="text-lg font-semibold text-gray-900 truncate">{selectedProduct.farmerId?.name || 'Unknown'}</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700">{selectedProduct.description || 'No description provided'}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className={`inline-flex items-center text-xs font-semibold ${
                  selectedProduct.expiryStatus === 'expired' ? 'text-red-600' :
                  selectedProduct.expiryStatus === 'soon' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {getStatusIcon(selectedProduct.expiryStatus)}
                  {getStatusText(selectedProduct.daysUntilExpiry)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-gray-500">
                  {selectedProduct.formattedExpiry}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mt-2 text-xs flex rounded-full bg-gray-200">
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, selectedProduct.daysUntilExpiry * 5))}%`
                }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  selectedProduct.expiryStatus === 'expired' ? 'bg-red-500' :
                  selectedProduct.expiryStatus === 'soon' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setProductToDelete(selectedProduct._id);
              setShowPreviewModal(false);
              setShowDeleteModal(true);
            }}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Decline
          </button>
          <button
            onClick={() => {
              setShowPreviewModal(false);
              handleApprove(selectedProduct._id);
            }}
            disabled={approving || selectedProduct.expiryStatus === 'expired'}
            className={`px-5 py-2.5 rounded-xl text-white flex items-center ${
              selectedProduct.expiryStatus === 'expired' ? 'bg-gray-400 cursor-not-allowed' :
              'bg-emerald-600 hover:bg-emerald-700'
            } transition-colors`}
          >
            <FiCheck className="w-4 h-4 mr-2" />
            {approving ? 'Approving...' : 'Approve Listing'}
          </button>
        </div>
      </div>
    </div>
  </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                    <FiTrash2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Decline Listing</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">Please provide a reason for declining this listing. This will be sent to the farmer.</p>
                
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Enter reason for declining..."
                />
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteReason('');
                    }}
                    className="px-4 py-2 text-sm text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!deleteReason.trim() || deleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    {deleting ? 'Declining...' : 'Confirm Decline'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
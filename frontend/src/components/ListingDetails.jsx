import { apiService } from "../utils/api";
import { useEffect, useState } from "react";
import { FiInfo, FiX, FiTrash2, FiPackage, FiDollarSign, FiCalendar, FiMapPin, FiLayers } from "react-icons/fi";
import { toast } from "react-hot-toast";

export const ListingDetails = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !userData?._id) {
        setListings([]);
        toast.error("Please login to view your listings");
        return;
      }

      const response = await apiService.get(
        `/api/marketplace/farmer-listings/${userData._id}`
      );
      
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error("Failed to fetch your listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const viewListingDetails = async (listingId) => {
    try {
      const response = await apiService.get(
        `/api/marketplace/listings-details/${listingId}`
      );
      setSelectedListing(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to fetch listing details");
      console.error(error);
    }
  };

  const confirmDelete = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const deleteListing = async () => {
    try {
      await apiService.delete(
        `/api/marketplace/listings-delete/${listingToDelete._id}`
      );
      toast.success("Listing deleted successfully");
      fetchListings(); // Refresh the listings
    } catch (error) {
      toast.error("Failed to delete listing");
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setListingToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-t-green-500 border-r-green-500 border-b-green-700 border-l-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex flex-col items-start mb-8 space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 font-poppins bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700">
          Your Marketplace Listings
        </h2>
        <p className="text-gray-500">Manage and view all your product listings</p>
      </div>

      {/* Stats Cards */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2">
          <div className="p-6 bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-full bg-green-100 text-green-600">
                <FiPackage className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Listings</p>
                <p className="text-2xl font-semibold text-gray-800">{listings.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-full bg-purple-100 text-purple-600">
                <FiLayers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Quantity</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {listings.reduce((sum, listing) => sum + listing.quantity, 0)} kg
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listings Table */}
      <div className="overflow-hidden bg-white rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-green-500 to-green-600">
              <tr>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">No</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Product</th>
                <th className="hidden px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins md:table-cell">Description</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Price</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Quantity</th>
                <th className="px-8 py-4 text-sm font-semibold tracking-wider text-left text-white uppercase font-poppins">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {listings.length > 0 ? (
                listings.map((listing, index) => (
                  <tr 
                    key={listing._id} 
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
                        <span className="truncate max-w-[180px]">{listing.wasteItem}</span>
                      </div>
                    </td>
                    <td className="hidden px-8 py-5 text-sm text-gray-600 md:table-cell">
                      <div className="relative">
                        <div className="absolute -left-3 top-1 w-1 h-6 bg-green-400 rounded-full"></div>
                        <p className="pl-3 line-clamp-2">
                          {listing.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-green-600 whitespace-nowrap">
                      ${listing.price.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-blue-600 whitespace-nowrap">
                      {listing.quantity} kg
                    </td>
                    <td className="px-8 py-5 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => viewListingDetails(listing._id)}
                          className="p-2 text-green-600 transition-all duration-200 rounded-full hover:text-white hover:bg-green-600 hover:shadow-md"
                          title="View Details"
                        >
                          <FiInfo className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(listing)}
                          className="p-2 text-red-600 transition-all duration-200 rounded-full hover:text-white hover:bg-red-600 hover:shadow-md"
                          title="Delete Listing"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-4 mb-4 rounded-full bg-gray-100">
                        <FiPackage className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-gray-700">No Listings Found</h3>
                      <p className="max-w-md text-gray-500">
                        You don't have any listings in the marketplace yet. Create your first listing to get started!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800 font-poppins">
                  {selectedListing.wasteItem}
                </h3>
                <p className="text-sm text-gray-500">Product Details</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Section - Now with more space */}
              {selectedListing.image && (
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="p-4">
                    <h4 className="flex items-center text-lg font-medium text-gray-800 mb-3">
                      <FiPackage className="w-5 h-5 mr-2 text-green-600" />
                      Product Image
                    </h4>
                  </div>
                  <div className="flex justify-center p-2 bg-gray-100">
                    <img 
                      src={selectedListing.image} 
                      alt={selectedListing.wasteItem}
                      className="max-h-64 w-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Product Information Card - Perfectly aligned */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                  <FiPackage className="w-5 h-5 mr-2 text-green-600" />
                  Product Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</p>
                      <p className="text-sm text-gray-800 capitalize mt-1">{selectedListing.wasteCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</p>
                      <p className="text-sm text-gray-800 capitalize mt-1">{selectedListing.wasteType}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-line">
                      {selectedListing.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Status Card - Perfectly aligned */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                  <FiDollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Pricing & Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price</p>
                    <p className="text-lg font-semibold text-green-600">${selectedListing.price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</p>
                    <p className="text-lg font-semibold text-blue-600">{selectedListing.quantity} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize 
                        ${selectedListing.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          selectedListing.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {selectedListing.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates Card - Perfectly aligned */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                  <FiCalendar className="w-5 h-5 mr-2 text-green-600" />
                  Important Dates
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</p>
                    <p className="text-sm text-gray-800">
                      {new Date(selectedListing.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</p>
                    <p className="text-sm text-gray-800">
                      {new Date(selectedListing.expireDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
            
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 font-poppins">Confirm Deletion</h3>
                <p className="text-gray-500">This action cannot be undone</p>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-2 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 pt-0">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="mb-2 text-lg font-medium text-gray-800">
                  Delete "{listingToDelete.wasteItem}"?
                </h4>
                <p className="text-gray-600">
                  Are you sure you want to permanently remove this listing from the marketplace?
                </p>
              </div>
            </div>

            <div className="flex justify-end p-6 space-x-3 border-t">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 font-medium text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteListing}
                className="px-6 py-2 font-medium text-white transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
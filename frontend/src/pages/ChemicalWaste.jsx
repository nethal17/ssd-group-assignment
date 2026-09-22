import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiService } from "../utils/api";
import { toast } from "react-hot-toast";

export const ChemicalWaste = () => {
  const { wasteType } = useParams();
  const navigate = useNavigate();
  const [wasteDetails, setWasteDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWasteDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!wasteType) {
          navigate('/non-organic');
          return;
        }

        const response = await apiService.get(`/api/marketplace/waste-type/${encodeURIComponent(wasteType)}`);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'No waste details found');
        }
        
        setWasteDetails(response.data.data);
      } catch (error) {
        console.error('Error fetching waste details:', error);
        if (error.response?.status === 404) {
          setError(`No products available for ${wasteType}. Please check back later.`);
        } else {
          setError(`Failed to fetch waste details: ${error.message}`);
        }
        setWasteDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWasteDetails();
  }, [wasteType, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/non-organic" className="inline-flex items-center text-green-600 hover:text-green-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4 capitalize">{wasteType}</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/non-organic')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Return to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/non-organic" className="inline-flex items-center text-green-600 hover:text-green-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 capitalize">{wasteType}</h1>
        </div>

        {wasteDetails.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No {wasteType} products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wasteDetails.map((waste) => (
              <div key={waste._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-200">
                  {waste.image ? (
                    <img
                      src={waste.image}
                      alt={waste.wasteItem}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{waste.wasteItem}</h3>
                  <p className="text-gray-600 mb-2">{waste.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-semibold">Rs. {waste.price}</span>
                    <span className="text-gray-500">{waste.quantity} kg</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Location: {waste.location.city}, {waste.location.district}</p>
                    <p>Expires: {new Date(waste.expireDate).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
                        cartItems.push(waste);
                        localStorage.setItem("cart", JSON.stringify(cartItems));
                        toast.success(`${waste.wasteItem} added to cart!`);
                      }}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
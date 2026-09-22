import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from "./Navbar";
import { Button, Card, Spin, message, Table, Empty, Alert, Descriptions } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined, CreditCardOutlined } from '@ant-design/icons';

const FarmerPaymentNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [marketplaceData, setMarketplaceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    farmerId: id,
    allMarketplaceItems: 0,
    filteredItems: 0,
    apiResponse: null,
    errorMessage: null
  });

  useEffect(() => {
    console.log("FarmerPaymentNew component mounted with ID:", id);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch farmer details
        const farmerResponse = await apiService.get(`/api/auth/searchUser/${id}`);
        setFarmer(farmerResponse.data);
        console.log("Farmer data fetched:", farmerResponse.data);
        
        // Fetch marketplace data for this farmer
        try {
          // Try to fetch directly from the marketplace endpoint
          try {
            console.log("Attempting to fetch from marketplace endpoint");
            const directResponse = await apiService.get(`/api/marketplace/farmer-listings/${id}`);
            console.log("Direct marketplace response:", directResponse.data);
            
            if (directResponse.data && Array.isArray(directResponse.data)) {
              setMarketplaceData(directResponse.data);
              setDebugInfo(prev => ({
                ...prev,
                allMarketplaceItems: directResponse.data.length,
                filteredItems: directResponse.data.length,
                apiResponse: "marketplace endpoint"
              }));
              return; // Exit early if we got data from the direct endpoint
            }
          } catch (directError) {
            console.log("Direct endpoint failed, falling back to all listings:", directError);
            setDebugInfo(prev => ({
              ...prev,
              errorMessage: directError.message
            }));
          }
          
          // Fallback: Fetch all marketplace data
          console.log("Fetching all marketplace data as fallback");
          const marketplaceResponse = await apiService.get(`/api/marketplace/listings`);
          console.log('All Marketplace Data:', marketplaceResponse.data);
          
          if (marketplaceResponse.data && Array.isArray(marketplaceResponse.data)) {
            // Filter for this farmer's products - using exact match for farmerId
            const farmerProducts = marketplaceResponse.data.filter(item => item.farmerId === id);
            
            console.log('Farmer ID we are looking for:', id);
            console.log('Filtered products for farmer:', farmerProducts);
            
            setMarketplaceData(farmerProducts);
            setDebugInfo(prev => ({
              ...prev,
              allMarketplaceItems: marketplaceResponse.data.length,
              filteredItems: farmerProducts.length,
              apiResponse: "all listings with filtering"
            }));
          } else {
            console.warn('Marketplace data is not in the expected format');
            setMarketplaceData([]);
            setDebugInfo(prev => ({
              ...prev,
              errorMessage: "Marketplace data is not in the expected format"
            }));
          }
        } catch (marketplaceError) {
          console.error('Error fetching marketplace data:', marketplaceError);
          message.error('Failed to load marketplace data');
          setMarketplaceData([]);
          setDebugInfo(prev => ({
            ...prev,
            errorMessage: marketplaceError.message
          }));
        }
      } catch (error) {
        console.error('Error fetching farmer data:', error);
        setError('Failed to load farmer information');
        message.error('Failed to load farmer information');
        setDebugInfo(prev => ({
          ...prev,
          errorMessage: error.message
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calculate total payment (80% of the price)
  const calculatePayment = () => {
    return marketplaceData.reduce((total, item) => {
      return total + (item.price * 0.8);
    }, 0);
  };

  // Handle Stripe payment
  const handleStripePayment = async () => {
    try {
      const totalAmount = calculatePayment();
      console.log('Initiating payment for farmer:', {
        farmerId: id,
        farmerName: farmer.name,
        totalAmount: totalAmount
      });
      
      // Create a Stripe checkout session using the correct endpoint
      const response = await apiService.post('/api/stripe/farmer-payment', {
        userId: id,
        amount: totalAmount * 100, // Convert to cents
        currency: "LKR",
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/farmer-list",
        customerEmail: farmer.email
      });
      
      console.log("Stripe response:", response.data);
      
      if (!response.data.url) {
        throw new Error("No payment URL received from server");
      }
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error('Failed to initiate payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      </>
    );
  }

  if (error || !farmer) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || 'Farmer not found'}</span>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/farmer-list')}
            className="mt-4"
          >
            Back to Farmer List
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/farmer-list')}
          >
            Back to Farmer List
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
              <div className="mb-4 md:mb-0 md:mr-8">
                <img 
                  src={farmer.profilePic || 'https://via.placeholder.com/150'} 
                  alt={farmer.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{farmer.name}</h1>
                <p className="text-gray-600 mb-1">Email: {farmer.email}</p>
                <p className="text-gray-600 mb-1">Phone: {farmer.phone}</p>
                <p className="text-gray-600">
                  Status: <span className={farmer.isVerified ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {farmer.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-semibold">Farmer ID:</span> {farmer._id}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Marketplace Items</h2>
              {marketplaceData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (LKR)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (80%)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketplaceData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.wasteItem}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.wasteCategory || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.wasteType || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.price * 0.8).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <p className="text-gray-500 italic mb-4">No marketplace items found for this farmer.</p>
                        <p className="text-sm text-gray-600 mb-4">
                          This farmer hasn't listed any items in the marketplace yet.
                        </p>
                        <Button 
                          type="primary" 
                          onClick={() => navigate('/product-listing-form')}
                          className="mt-4"
                        >
                          Add New Product Listing
                        </Button>
                      </div>
                    }
                  />
                  
                  {/* Debug Information */}
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                    <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                    <Alert
                      message="Troubleshooting Information"
                      description={
                        <div>
                          <p><strong>Farmer ID:</strong> {debugInfo.farmerId}</p>
                          <p><strong>Total Marketplace Items:</strong> {debugInfo.allMarketplaceItems}</p>
                          <p><strong>Filtered Items:</strong> {debugInfo.filteredItems}</p>
                          <p><strong>API Response:</strong> {debugInfo.apiResponse || 'Unknown'}</p>
                          {debugInfo.errorMessage && (
                            <p><strong>Error:</strong> {debugInfo.errorMessage}</p>
                          )}
                          <p className="mt-2">
                            <ExclamationCircleOutlined className="text-yellow-500 mr-1" />
                            If you believe this farmer has listed items, please check:
                          </p>
                          <ul className="list-disc pl-5 mt-1">
                            <li>The farmer ID in the URL matches the farmer's actual ID</li>
                            <li>The marketplace items have the correct farmerId field</li>
                            <li>The API endpoints are working correctly</li>
                          </ul>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </div>
                </div>
              )}
            </div>

            <Card className="bg-green-50 border-green-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Total Commission to Pay</h3>
                <span className="text-2xl font-bold text-green-600">LKR {calculatePayment().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This amount represents 80% of the total price of all marketplace items listed by {farmer.name}.
              </p>
              
              {marketplaceData.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<CreditCardOutlined />}
                    onClick={handleStripePayment}
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                  >
                    Pay with Stripe
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmerPaymentNew; 
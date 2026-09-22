import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from "./Navbar";
import { Button, Card, Spin, message, Table, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const FarmerPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [marketplaceData, setMarketplaceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch farmer details
        const farmerResponse = await apiService.get(`/api/auth/searchUser/${id}`);
        setFarmer(farmerResponse.data);
        
        // Fetch marketplace data for this farmer
        try {
          // Fetch all marketplace data
          const marketplaceResponse = await apiService.get(`/api/product-listing/all`);
          console.log('All Marketplace Data:', marketplaceResponse.data);
          
          if (marketplaceResponse.data && Array.isArray(marketplaceResponse.data)) {
            // Filter for this farmer's products - using exact match for farmerId
            const farmerProducts = marketplaceResponse.data.filter(item => item.farmerId === id);
            
            console.log('Farmer ID we are looking for:', id);
            console.log('Filtered products for farmer:', farmerProducts);
            
            setMarketplaceData(farmerProducts);
          } else {
            console.warn('Marketplace data is not in the expected format');
            setMarketplaceData([]);
          }
        } catch (marketplaceError) {
          console.error('Error fetching marketplace data:', marketplaceError);
          message.error('Failed to load marketplace data');
          setMarketplaceData([]);
        }
      } catch (error) {
        console.error('Error fetching farmer data:', error);
        setError('Failed to load farmer information');
        message.error('Failed to load farmer information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calculate total payment (20% of the price)
  const calculatePayment = () => {
    return marketplaceData.reduce((total, item) => {
      return total + (item.price * 0.2);
    }, 0);
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (20%)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketplaceData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.wasteItem}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.wasteCategory || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.wasteType || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.price * 0.2).toFixed(2)}</td>
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
                      </div>
                    }
                  />
                </div>
              )}
            </div>

            <Card className="bg-green-50 border-green-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Total Commission to Pay</h3>
                <span className="text-2xl font-bold text-green-600">LKR {calculatePayment().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This amount represents 20% of the total price of all marketplace items listed by {farmer.name}.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmerPayment; 
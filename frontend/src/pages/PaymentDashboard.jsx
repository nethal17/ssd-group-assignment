import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Statistic, Typography, Spin } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  DollarOutlined,
  ArrowRightOutlined,
  WalletOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import Sidebar from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { apiService } from '../utils/api';

const { Title, Text } = Typography;

const PaymentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [farmerCount, setFarmerCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch farmers count using the same endpoint as FarmerList.jsx
        const farmersResponse = await apiService.get('/api/auth/getAllUsers');
        // Filter only farmers
        const farmersList = farmersResponse.data.data.filter(user => user.role === 'farmer');
        setFarmerCount(farmersList.length);

        // Fetch drivers count
        const driversList = farmersResponse.data.data.filter(user => user.role === 'truck_driver');
        setDriverCount(driversList.length);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching counts:', error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 ml-64 pt-16 flex items-center justify-center">
            <Spin size="large" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <div className="flex-1 ml-64 pt-16">
          <div className="p-8">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-2">Payment Management</Title>
            <Text className="text-gray-500 mb-8 block">Manage and process payments for farmers and drivers</Text>
            
            <Row gutter={[24, 24]}>
              {/* Farmer Payments Card */}
              <Col xs={24} md={12}>
                <Card 
                  className="h-full shadow-lg hover:shadow-xl transition-shadow border-0"
                  bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-full mr-4 shadow-md">
                      <UserOutlined className="text-4xl text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Farmer Payments</h2>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-gray-600 mb-6">
                      Manage payments to farmers for their agricultural waste products. 
                      Calculate and process payments based on marketplace sales.
                    </p>
                    
                    <Statistic 
                      title="Total Farmers" 
                      value={farmerCount} 
                      prefix={<UserOutlined />} 
                      className="mb-6"
                    />
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<DollarOutlined />}
                      onClick={() => navigate('/farmer-list')}
                      className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-md"
                    >
                      Pay Farmers
                      <ArrowRightOutlined className="ml-2" />
                    </Button>
                    
                    <Button 
                      type="default" 
                      size="large" 
                      icon={<HistoryOutlined />}
                      onClick={() => navigate('/farmer-list')}
                      className="w-full h-12 text-lg border-gray-300 hover:border-green-500 hover:text-green-500"
                    >
                      View Payment History
                    </Button>
                  </div>
                </Card>
              </Col>
              
              {/* Driver Payments Card */}
              <Col xs={24} md={12}>
                <Card 
                  className="h-full shadow-lg hover:shadow-xl transition-shadow border-0"
                  bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-full mr-4 shadow-md">
                      <TeamOutlined className="text-4xl text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Driver Payments</h2>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-gray-600 mb-6">
                      Process salary payments for truck drivers. 
                      View payment history and manage driver compensation.
                    </p>
                    
                    <Statistic 
                      title="Total Drivers" 
                      value={driverCount} 
                      prefix={<TeamOutlined />} 
                      className="mb-6"
                    />
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<DollarOutlined />}
                      onClick={() => navigate('/driver')}
                      className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md"
                    >
                      Pay Drivers
                      <ArrowRightOutlined className="ml-2" />
                    </Button>
                    
                    <Button 
                      type="default" 
                      size="large" 
                      icon={<HistoryOutlined />}
                      onClick={() => navigate('/high-payments')}
                      className="w-full h-12 text-lg border-gray-300 hover:border-blue-500 hover:text-blue-500"
                    >
                      View Payment History
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
            
            
            
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentDashboard; 
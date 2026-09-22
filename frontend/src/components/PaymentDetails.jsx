import React, { useEffect, useState } from 'react';
import { apiService } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from "../components/Navbar";
import { Card, Statistic, Progress, Tag, Button, Spin } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  ArrowRightOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        console.log('Fetching driver data for ID:', id);
        const driverResponse = await apiService.get(`/api/auth/searchUser/${id}`);
        console.log('Driver response:', driverResponse.data);
        setDriver(driverResponse.data);

        const deliveriesResponse = await apiService.get(`/api/delivery/completed`);
        console.log('Deliveries response:', deliveriesResponse.data);
        
        const driverDeliveries = deliveriesResponse.data.filter(
          delivery => delivery.userId._id === id && delivery.deliveryStatus === 'completed'
        );
        console.log('Filtered deliveries for driver:', driverDeliveries);
        setCompletedDeliveries(driverDeliveries.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data);
        setError('Failed to load driver information');
      }
    };

    fetchDriverData();
  }, [id]);

  const basicSalary = 20000.00;
  const deliveryBonus = 500.00;
  const bonusDeliveries = Math.max(0, completedDeliveries - 15);
  const totalSalary = basicSalary + (bonusDeliveries * deliveryBonus);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await apiService.post('/api/driver-payment', {
        totalSalary,
        driverId: id,
        driverName: driver.name
      });
      
      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Invalid response from payment server');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!driver) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Driver Profile Card */}
            <div className="lg:col-span-1">
              <Card className="h-full shadow-lg border-0 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                  <h2 className="text-xl font-semibold">Driver Profile</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <img 
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg" 
                      src={driver.profilePic || 'https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg'} 
                      alt={driver.name}
                    />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">{driver.name}</h3>
                    <div className="mt-2 space-y-1 text-center">
                      <p className="text-sm text-gray-500">ID: {id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                      <p className="text-sm text-gray-500">{driver.phone}</p>
                    </div>
                    <div className="mt-4">
                      <Tag color="blue" className="text-sm">
                        <UserOutlined className="mr-1" />
                        Driver
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Salary Details Card */}
            <div className="lg:col-span-2">
              <Card className="h-full shadow-lg border-0 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
                  <h2 className="text-xl font-semibold">Salary Details</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Basic Salary */}
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="text-gray-600">Basic Salary</h4>
                        
                      </div>
                      <Statistic
                        value={basicSalary}
                        precision={2}
                        prefix={<DollarOutlined className="text-blue-500" />}
                        suffix="Rs."
                        valueStyle={{ color: '#3b82f6', fontSize: '20px' }}
                      />
                    </div>

                    {/* Delivery Performance */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-gray-600">Delivery Performance</h4>
                        <Tag color="green" className="text-sm">
                          {completedDeliveries} Completed
                        </Tag>
                      </div>
                      <Progress 
                        percent={(completedDeliveries / 30) * 100} 
                        size="small" 
                        status="active"
                        strokeColor="#10B981"
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Target: 30 deliveries/month
                      </div>
                    </div>

                    {/* Bonus Details */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-gray-600">Bonus Details</h4>
                        <Tag color="purple" className="text-sm">
                          {bonusDeliveries} Extra Deliveries
                        </Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bonus per delivery:</span>
                        <span className="font-medium text-purple-600">Rs. {deliveryBonus.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Total Bonus:</span>
                        <span className="font-medium text-purple-600">
                          Rs. {(bonusDeliveries * deliveryBonus).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Total Salary */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-900">Total Salary</h4>
                        <Statistic
                          value={totalSalary}
                          precision={2}
                          prefix={<DollarOutlined className="text-green-500" />}
                          suffix="Rs."
                          valueStyle={{ color: '#10B981', fontSize: '24px' }}
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Payment Button */}
                    <Button
                      type="primary"
                      size="large"
                      className="w-full h-12 text-lg"
                      onClick={handlePay}
                      disabled={isProcessing}
                      icon={isProcessing ? <LoadingOutlined /> : <CheckCircleOutlined />}
                    >
                      {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                    </Button>

                    {/* Back Button */}
                    <Button
                      type="link"
                      className="w-full"
                      onClick={() => navigate('/driver')}
                    >
                      <ArrowRightOutlined className="transform rotate-180 mr-2" />
                      Back to Driver List
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentDetails;
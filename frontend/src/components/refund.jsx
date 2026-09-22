import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../utils/api';
import { Table, Button, Tag, message, Space, Modal, Card, Statistic, Row, Col, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Navbar } from "./Navbar";
import Sidebar from "./Sidebar";

const { Title, Text } = Typography;

const Refund = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchRefunds();
  }, []);  

  const calculateStats = useCallback(() => {
    const newStats = {
      total: refunds.length,
      pending: refunds.filter(r => r.refundStatus === 'pending').length,
      approved: refunds.filter(r => r.refundStatus === 'approved').length,
      rejected: refunds.filter(r => r.refundStatus === 'rejected').length,
      totalAmount: refunds.reduce((sum, r) => sum + r.totalPrice, 0)
    };
    setStats(newStats);
  }, [refunds]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const fetchRefunds = async () => {
    try {
      const response = await apiService.get('/api/refunds');
      setRefunds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      message.error('Failed to fetch refunds');
      setLoading(false);
    }
  };

  const handleStripePayment = async (refund) => {
    try {
      await handleStatusUpdate(refund._id, 'approved');
      const response = await apiService.post('/api/create-checkout-session', {
        totalSalary: refund.totalPrice,
        driverId: refund.userId._id,
        driverName: refund.userId.name,
        success_url: 'http://localhost:5173/success',
        cancel_url: 'http://localhost:5173/refunds'
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      message.error('Failed to process refund payment');
    }
  };

  const handleStatusUpdate = async (refundId, newStatus) => {
    try {
      await apiService.patch(`/api/refunds/${refundId}/status`, {
        status: newStatus
      });

      message.success(`Refund request ${newStatus} successfully`);
      fetchRefunds();
    } catch (error) {
      console.error('Error updating refund status:', error);
      message.error('Failed to update refund status');
    }
  };

  const handleDelete = async (refundId) => {
    try {
      await apiService.delete(`/api/refunds/${refundId}`);
      message.success('Refund deleted successfully');
      fetchRefunds();
    } catch (error) {
      console.error('Error deleting refund:', error);
      message.error('Failed to delete refund');
    }
  };

  const handleAcceptClick = (record) => {
    setSelectedRefund(record);
    setIsPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    if (selectedRefund) {
      try {
        await handleStripePayment(selectedRefund);
        setIsPaymentModalVisible(false);
      } catch (error) {
        console.error('Error processing payment:', error);
        message.error('Failed to process payment');
      }
    }
  };

  const columns = [
    {
      title: 'User Name',
      dataIndex: ['userId', 'name'],
      key: 'userName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => (
        <Text strong style={{ color: '#1890ff' }}>
          Rs. {price.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Canceled Date',
      dataIndex: 'canceledDate',
      key: 'canceledDate',
      render: (date) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'refundStatus',
      key: 'refundStatus',
      render: (status) => {
        const color = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange';
        const icon = status === 'approved' ? <CheckCircleOutlined /> : 
                    status === 'rejected' ? <CloseCircleOutlined /> : 
                    <ClockCircleOutlined />;
        return (
          <Tag color={color} icon={icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Reason',
      dataIndex: 'refundReason',
      key: 'refundReason',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.refundStatus === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleAcceptClick(record)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Accept
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleStatusUpdate(record._id, 'rejected')}
              >
                Decline
              </Button>
            </>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto bg-gray-50 ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <Title level={2} className="text-gray-800">Refund Management</Title>
            </div>
            
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Refunds"
                    value={stats.total}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Pending"
                    value={stats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Approved"
                    value={stats.approved}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Amount"
                    value={stats.totalAmount}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                    formatter={(value) => `Rs. ${value.toLocaleString()}`}
                  />
                </Card>
              </Col>
            </Row>
            
            <Card className="shadow-lg">
              <Table
                columns={columns}
                dataSource={refunds}
                loading={loading}
                rowKey="_id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true
                }}
                scroll={{ x: 1500 }}
              />
            </Card>
          </div>
        </div>
      </div>

      <Modal
        title="Confirm Refund Payment"
        open={isPaymentModalVisible}
        onOk={handlePaymentConfirm}
        onCancel={() => setIsPaymentModalVisible(false)}
        okText="Proceed to Payment"
        cancelText="Cancel"
        width={500}
      >
        {selectedRefund && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600">You are about to process a refund payment for:</p>
              <p className="mt-2"><strong>User:</strong> {selectedRefund.userId.name}</p>
              <p><strong>Product:</strong> {selectedRefund.productName}</p>
              <p><strong>Amount:</strong> Rs. {selectedRefund.totalPrice.toLocaleString()}</p>
            </div>
            <p className="text-gray-500">This will update the status to 'approved' and redirect you to the payment gateway.</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Refund; 
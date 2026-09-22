import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { Table, Button, Modal, Form, message } from 'antd';
import { EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { Navbar } from "./Navbar";
import { useNavigate } from 'react-router-dom';

const FarmerList = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/auth/getAllUsers');
      // Filter only farmers
      const farmersList = response.data.data.filter(user => user.role === 'farmer');
      setFarmers(farmersList);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      message.error('Failed to fetch farmers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingFarmer(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`/api/auth/userDelete/${id}`);
      message.success('Farmer deleted successfully');
      fetchFarmers();
    } catch (error) {
      console.error('Error deleting farmer:', error);
      message.error('Failed to delete farmer');
    }
  };

  const handleCalculatePayment = (farmerId) => {
    navigate(`/farmer/${farmerId}/payment`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await apiService.put(`/api/auth/updateUser/${editingFarmer._id}`, values);
      message.success('Farmer updated successfully');
      setIsModalVisible(false);
      fetchFarmers();
    } catch (error) {
      console.error('Error updating farmer:', error);
      message.error('Failed to update farmer');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Profile Picture',
      dataIndex: 'profilePic',
      key: 'profilePic',
      render: (profilePic) => (
        profilePic ? (
          <img src={profilePic} alt="Profile" style={{ width: 50, height: 50, borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No Image
          </div>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified) => (
        <span style={{ color: isVerified ? 'green' : 'red' }}>
          {isVerified ? 'Verified' : 'Not Verified'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            style={{ marginRight: 8 }}
          >
            Delete
          </Button>
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => handleCalculatePayment(record._id)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Calculate Payment
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Farmer List</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={farmers}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>

        <Modal
          title="Edit Farmer"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input the name!' }]}
            >
              <input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input the email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Please input the phone number!' }]}
            >
              <input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default FarmerList; 
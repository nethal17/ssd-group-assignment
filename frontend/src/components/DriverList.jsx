import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { Table, Button, Modal, Form, message } from 'antd';
import { EditOutlined, DeleteOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { Navbar } from "../components/Navbar";
import { useNavigate } from 'react-router-dom';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/auth/getAllUsers');
      // Filter only truck drivers
      const truckDrivers = response.data.data.filter(user => user.role === 'truck_driver');
      setDrivers(truckDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      message.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingDriver(record);
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
      message.success('Driver deleted successfully');
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      message.error('Failed to delete driver');
    }
  };

  const handleCalculatePayment = (driverId) => {
    navigate(`/driver/${driverId}/payment`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await apiService.put(`/api/auth/updateUser/${editingDriver._id}`, values);
      message.success('Driver updated successfully');
      setIsModalVisible(false);
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      message.error('Failed to update driver');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Driver List</h1>
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => navigate('/farmer-list')}
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
        >
          View Farmers
        </Button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={drivers}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>

      <Modal
        title="Edit Driver"
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

export default DriverList;
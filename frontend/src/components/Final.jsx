import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../utils/api';
import { Navbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Button, Card, Row, Col, Spin, Typography, Statistic, Tag } from 'antd';
import {
  HistoryOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  FilePdfOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text, Paragraph } = Typography;

const CountUpFallback = ({ end }) => (
  <span>{Number(end).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
);

export default function Final() {
  const reportRef = useRef(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [highTotalAmount, setHighTotalAmount] = useState(0);
  const [orderHistoryTotal, setOrderHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [CountUpComp, setCountUpComp] = useState(null);

  useEffect(() => {
    let mounted = true;
    // try to dynamically import react-countup; if not available, we'll use fallback
    import('react-countup')
      .then((mod) => {
        if (!mounted) return;
        setCountUpComp(() => mod.default || mod.CountUp || null);
      })
      .catch(() => {
        // ignore - we'll use fallback
      });

    const fetchAndCalculateTotals = async () => {
      try {
        const orderHistoryResponse = await apiService.get('/api/order-history');
        const orderHistoryData = orderHistoryResponse?.data || [];
        setOrderHistoryTotal((orderHistoryData.length || 0) * 1000);

        const paymentsResp = await apiService.get('/api/stripe-payments');
        const payments = paymentsResp?.data || [];

        const total = payments.reduce((sum, payment) => {
          const amount = parseFloat(payment.payAmount) || 0;
          return sum + amount;
        }, 0);

        const highTotal = payments.reduce((sum, payment) => {
          const amount = parseFloat(payment.payAmount) || 0;
          return amount >= 20000 ? sum + amount : sum;
        }, 0);

        setTotalAmount(total);
        setHighTotalAmount(highTotal);
      } catch (err) {
         
        console.error('Error fetching Final data:', err);
        setError(err?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateTotals();

    return () => {
      mounted = false;
    };
  }, []);

  const farmerPayment = totalAmount * 0.8;
  const profit = totalAmount * 0.2;

  const generatePDF = async () => {
    try {
      const element = reportRef.current;
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('payment-summary-report.pdf');
    } catch (err) {
       
      console.error('Error generating PDF:', err);
    }
  };

  const RenderNumber = ({ value }) => {
    if (CountUpComp) {
      return <CountUpComp end={value} duration={1.6} separator="," decimal="." />;
    }
    return <CountUpFallback end={value} />;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex items-center justify-center flex-1 ml-64">
            <Spin size="large" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex items-center justify-center flex-1 ml-64">
            <div className="text-center">
              <p className="mb-4 text-xl text-red-500">{error}</p>
              <Button type="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 overflow-auto bg-gray-50">
          <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Title level={2} className="mb-1 text-3xl font-bold text-gray-800">
                  Total Payments Summary
                </Title>
                <Text className="text-gray-500">Comprehensive overview of all financial transactions</Text>
              </div>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={generatePDF}
                className="flex items-center h-12 text-lg"
                style={{ backgroundColor: '#f5222d', borderColor: '#f5222d', gap: '8px' }}
              >
                Download Report
              </Button>
            </div>

            <div ref={reportRef}>
              <div className="flex flex-col gap-10">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="transition-shadow border-0 rounded-lg shadow-md hover:shadow-lg">
                      <Statistic
                        title={<span className="text-gray-600">Total Revenue</span>}
                        value={totalAmount}
                        precision={2}
                        prefix={<DollarOutlined className="text-green-500" />}
                        suffix="Rs."
                        valueStyle={{ color: '#10b981', fontSize: '24px' }}
                      />
                      <div className="flex items-center mt-2">
                        <RiseOutlined className="mr-1 text-green-500" />
                        <span className="text-sm text-green-500">12% increase</span>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card className="transition-shadow border-0 rounded-lg shadow-md hover:shadow-lg">
                      <Statistic
                        title={<span className="text-gray-600">Farmer Payments</span>}
                        value={farmerPayment}
                        precision={2}
                        prefix={<UserOutlined className="text-blue-500" />}
                        suffix="Rs."
                        valueStyle={{ color: '#3b82f6', fontSize: '24px' }}
                      />
                      <div className="flex items-center mt-2">
                        <CheckCircleOutlined className="mr-1 text-blue-500" />
                        <span className="text-sm text-blue-500">80% of revenue</span>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card className="transition-shadow border-0 rounded-lg shadow-md hover:shadow-lg">
                      <Statistic
                        title={<span className="text-gray-600">Delivery Payments</span>}
                        value={orderHistoryTotal}
                        precision={2}
                        prefix={<TeamOutlined className="text-purple-500" />}
                        suffix="Rs."
                        valueStyle={{ color: '#8b5cf6', fontSize: '24px' }}
                      />
                      <div className="flex items-center mt-2">
                        <ClockCircleOutlined className="mr-1 text-purple-500" />
                        <span className="text-sm text-purple-500">Total from orders</span>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card className="transition-shadow border-0 rounded-lg shadow-md hover:shadow-lg">
                      <Statistic
                        title={<span className="text-gray-600">Net Profit</span>}
                        value={profit}
                        precision={2}
                        prefix={<DollarOutlined className="text-yellow-500" />}
                        suffix="Rs."
                        valueStyle={{ color: '#f59e0b', fontSize: '24px' }}
                      />
                      <div className="flex items-center mt-2">
                        <RiseOutlined className="mr-1 text-yellow-500" />
                        <span className="text-sm text-yellow-500">20% of revenue</span>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Card className="overflow-hidden border-0 rounded-lg shadow-lg">
                  <div className="p-4 text-white bg-gradient-to-r from-blue-500 to-purple-600">
                    <Title level={3} className="m-0 text-white">Payment Summary</Title>
                  </div>

                  <div className="p-6">
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-8 mr-2 bg-red-500 rounded" />
                        <Title level={4} className="m-0 text-red-600">Outcomes</Title>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            <TeamOutlined className="mr-2 text-2xl text-purple-600" />
                            <Title level={4} className="m-0">Payment for Driver Salary</Title>
                          </div>
                          <div className="flex items-baseline">
                            <Text className="text-3xl font-bold text-purple-600">Rs. <RenderNumber value={highTotalAmount} /></Text>
                            <Tag color="purple" className="ml-2">Monthly</Tag>
                          </div>
                          <Paragraph className="mt-2 text-gray-500">Regular salary payments to truck drivers for delivery services.</Paragraph>
                        </div>

                        <div className="pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            <UserOutlined className="mr-2 text-2xl text-blue-600" />
                            <Title level={4} className="m-0">Farmer Payments</Title>
                          </div>
                          <div className="flex items-baseline">
                            <Text className="text-3xl font-bold text-blue-600">Rs. <RenderNumber value={farmerPayment} /></Text>
                            <Tag color="blue" className="ml-2">80%</Tag>
                          </div>
                          <Paragraph className="mt-2 text-gray-500">Payments to farmers for their agricultural waste products.</Paragraph>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-8 mr-2 bg-green-500 rounded" />
                        <Title level={4} className="m-0 text-green-600">Incomes</Title>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            <HistoryOutlined className="mr-2 text-2xl text-indigo-600" />
                            <Title level={4} className="m-0">Delivery Payments</Title>
                          </div>
                          <div className="flex items-baseline">
                            <Text className="text-3xl font-bold text-indigo-600">Rs. <RenderNumber value={orderHistoryTotal} /></Text>
                            <Tag color="indigo" className="ml-2">Shipping</Tag>
                          </div>
                          <Paragraph className="mt-2 text-gray-500">Total revenue from delivery services.</Paragraph>
                        </div>

                        <div className="pb-4 border-b border-gray-200">
                          <div className="flex items-center mb-2">
                            <RiseOutlined className="mr-2 text-2xl text-yellow-600" />
                            <Title level={4} className="m-0">Profit from selling products</Title>
                          </div>
                          <div className="flex items-baseline">
                            <Text className="text-3xl font-bold text-yellow-600">Rs. <RenderNumber value={profit} /></Text>
                            <Tag color="gold" className="ml-2">20%</Tag>
                          </div>
                          <Paragraph className="mt-2 text-gray-500">Net profit from all marketplace transactions.</Paragraph>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-8 mr-2 bg-green-600 rounded" />
                        <Title level={4} className="m-0 text-green-700">Total Profit</Title>
                      </div>
                      <div className="flex items-baseline">
                        <Text className="text-4xl font-bold text-green-700">Rs. <RenderNumber value={orderHistoryTotal + profit} /></Text>
                        <Tag color="green" className="ml-2">Shipping fees & Profit from selling products</Tag>
                      </div>
                      <Paragraph className="mt-2 text-gray-600">Combined total of Delivery Payments and Net Profit.</Paragraph>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
 
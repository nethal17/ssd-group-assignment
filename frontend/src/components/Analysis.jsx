import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { toast } from "react-hot-toast";
import { FaChartBar, FaUsers, FaUserCheck, FaUserTimes, FaHome, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Navbar } from './Navbar';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Analysis = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chartData, setChartData] = useState({
    roleDistribution: null,
    userGrowth: null,
    verificationStatus: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiService
      .get(`/api/auth/getAllUsers`)
      .then((response) => {
        setAllUsers(response.data.data);
        prepareChartData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const prepareChartData = (users) => {
    // Role Distribution Pie Chart
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const roleDistributionData = {
      labels: Object.keys(roleCounts).map(role => 
        role === "farmer" ? "Farmers" : 
        role === "buyer" ? "Buyers" : 
        role === "admin" ? "Admin" :
        role === "truck_driver" ? "Drivers" : role
      ),
      datasets: [{
        data: Object.values(roleCounts),
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',  // Green for Farmers
          'rgba(168, 85, 247, 0.6)', // Purple for Buyers
          'rgba(239, 68, 68, 0.6)',  // Red for Admin
          'rgba(234, 179, 8, 0.6)'   // Yellow for Drivers
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',    // Green border for Farmers
          'rgba(168, 85, 247, 1)',   // Purple border for Buyers
          'rgba(239, 68, 68, 1)',    // Red border for Admin
          'rgba(234, 179, 8, 1)'     // Yellow border for Drivers
        ],
        borderWidth: 1
      }]
    };

    // User Growth Line Chart
    const sortedByDate = [...users].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    const monthlyGrowth = sortedByDate.reduce((acc, user) => {
      const date = new Date(user.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    const userGrowthData = {
      labels: Object.keys(monthlyGrowth).map(date => {
        const [year, month] = date.split('-');
        return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      }),
      datasets: [{
        label: 'User Growth',
        data: Object.values(monthlyGrowth),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };

    // Verification Status Bar Chart
    const verificationData = {
      labels: ['Verified', 'Unverified'],
      datasets: [{
        label: 'Users',
        data: [
          users.filter(u => u.isVerified).length,
          users.filter(u => !u.isVerified).length
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    };

    setChartData({
      roleDistribution: roleDistributionData,
      userGrowth: userGrowthData,
      verificationStatus: verificationData
    });
  };

  // Add these chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    }
  };

  const pieChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        ...commonChartOptions.plugins.legend,
        position: 'right'
      }
    }
  };

  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-64' : 'w-0'} fixed left-0 top-16 h-[calc(100vh-64px)] bg-green-300 shadow-xl transition-all duration-300 z-20 overflow-hidden`}>
          <div className="flex flex-col h-full mt-2">
            
            <nav className="flex-1 p-4 space-y-2">
              <Link to="/admin-dashboard" className="flex items-center p-3 text-black-800 transition-colors rounded-lg hover:bg-green-100">
                <FaHome className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
              <Link to="/all-users" className="flex items-center p-3 text-black-800 transition-colors rounded-lg hover:bg-green-100">
                <FaUsers className="w-5 h-5 mr-3" />
                <span>Users</span>
              </Link>
              <Link to="/analysis" className="flex items-center p-3 text-black-800 bg-green-100 rounded-lg">
                <FaChartBar className="w-5 h-5 mr-3" />
                <span>Analysis</span>
              </Link>
            </nav>
            <div className="p-4 border-t border-green-600">
              <button
                onClick={handleLogout} 
                className="flex items-center w-full p-3 text-black-800 transition-colors rounded-lg hover:bg-green-100">
                <FaSignOutAlt className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-auto transition-all duration-300 ${showSidebar ? 'ml-64' : 'ml-0'}`}>
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">User Analytics</h1>
                <p className="text-gray-600">Comprehensive analysis of user data and trends</p>
              </div>
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
              >
                {showSidebar ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
              <div className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaUsers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold">{allUsers.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FaUserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Verified Users</p>
                    <p className="text-2xl font-semibold">{allUsers.filter(u => u.isVerified).length}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FaUserTimes className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Unverified Users</p>
                    <p className="text-2xl font-semibold">{allUsers.filter(u => !u.isVerified).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
              {/* Role Distribution Chart */}
              <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="mb-4 text-lg font-medium text-gray-800">User Role Distribution</h3>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-12 h-12 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  ) : chartData.roleDistribution ? (
                    <Pie 
                      data={chartData.roleDistribution}
                      options={pieChartOptions}
                    />
                  ) : null}
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="mb-4 text-lg font-medium text-gray-800">User Growth Over Time</h3>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-12 h-12 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  ) : chartData.userGrowth ? (
                    <Line 
                      data={chartData.userGrowth}
                      options={lineChartOptions}
                    />
                  ) : null}
                </div>
              </div>

              {/* Verification Status Chart */}
              <div className="p-6 bg-white shadow-md rounded-xl lg:col-span-2">
                <h3 className="mb-4 text-lg font-medium text-gray-800">User Verification Status</h3>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-12 h-12 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  ) : chartData.verificationStatus ? (
                    <Bar 
                      data={chartData.verificationStatus}
                      options={barChartOptions}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 
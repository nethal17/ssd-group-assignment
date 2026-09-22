import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { toast } from "react-hot-toast";
import { 
  FaUsers, FaUserShield, FaUserCheck, FaUserTimes, 
  FaSearch, FaFilter, FaSort, FaChartBar,
  FaHome, FaUserCog, FaCog, FaSignOutAlt,
  FaFileExport, FaFileImport, FaHistory, FaDownload,
  FaChevronDown, FaChevronUp, FaTimes, FaEye, FaDesktop,
  FaGlobe, FaUser, FaEnvelope, FaPhone, FaCalendarAlt,
  FaShieldAlt, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
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

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiService
      .get(`/api/auth/getAllUsers`)
      .then((response) => {
        setAllUsers(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUserDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    
    try {
      await apiService.delete(`/api/auth/userDelete/${selectedUser._id}`);
      setAllUsers((prevUsers) => prevUsers.filter((user) => user._id !== selectedUser._id));
      toast.success("Successfully deactivated user account");
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to deactivate user account");
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "verified" && user.isVerified) ||
                         (filterStatus === "unverified" && !user.isVerified);
    const matchesRole = filterRole === "all" ||
                          (filterRole === "farmers" && user.role === "farmer") ||
                          (filterRole === "buyers" && user.role === "buyer") ||
                          (filterRole === "drivers" && user.role === "truck_driver");     
    return matchesSearch && matchesStatus && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "lastLogin") {
      const aLastLogin = a.loginHistory && a.loginHistory.length > 0 
        ? new Date(a.loginHistory[a.loginHistory.length - 1].timestamp)
        : new Date(0);
      const bLastLogin = b.loginHistory && b.loginHistory.length > 0 
        ? new Date(b.loginHistory[b.loginHistory.length - 1].timestamp)
        : new Date(0);
      return bLastLogin - aLastLogin;
    }
    return 0;
  });

  const handleExportUsers = async () => {
    try {
      const response = await apiService.get(`/api/auth/exportUsers`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'User-Details.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (error) {
      toast.error("Failed to export users");
      console.error("Error exporting users:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleUserPreview = (user) => {
    setPreviewUser(user);
    setShowPreviewModal(true);
  };

  const formatDeviceInfo = (deviceInfo) => {
    if (!deviceInfo) return "Unknown";
    
    if (deviceInfo.includes("Windows")) return "Windows";
    if (deviceInfo.includes("Mac")) return "Mac";
    if (deviceInfo.includes("Linux")) return "Linux";
    if (deviceInfo.includes("Android")) return "Android";
    if (deviceInfo.includes("iOS")) return "iOS";
    
    return "Other";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar - Now with Green Color Scheme */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} fixed left-0 top-0 h-full bg-green-300 shadow-xl transition-all duration-300 z-20 overflow-hidden`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-green-400">
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/admin-dashboard" className="flex items-center p-3 text-black-800 transition-colors rounded-lg hover:bg-green-100">
              <FaHome className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </Link>
            <Link to="/all-users" className="flex items-center p-3 text-black-800 bg-green-100 rounded-lg">
              <FaUsers className="w-5 h-5 mr-3" />
              <span>Users</span>
            </Link>
            <Link to="/analysis" className="flex items-center p-3 text-black-800 transition-colors rounded-lg hover:bg-green-100">
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
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600">Manage and monitor all system users</p>
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

          {/* Enhanced Filters and Search */}
          <div className="p-6 mb-8 bg-white shadow-md rounded-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="farmers">Farmers</option>
                  <option value="buyers">Buyers</option>
                  <option value="drivers">Drivers</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="date">Registration Date</option>
                  <option value="lastLogin">Last Login</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden bg-white shadow-md rounded-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-800">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Found
              </h3>
              <button
                onClick={handleExportUsers}
                className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                <FaFileExport className="mr-2" />
                Export User Details
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                          <p className="mt-4 text-gray-600">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : sortedUsers.length > 0 ? (
                    sortedUsers.map((user) => (
                      <tr key={user._id} className="transition-colors hover:bg-green-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img 
                                className="object-cover w-10 h-10 border border-gray-200 rounded-full" 
                                src={user.profilePic || "https://ui-avatars.com/api/?name="+encodeURIComponent(user.name)+"&background=random"} 
                                alt={user.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold leading-5 rounded-full ${
                            user.role === "farmer" ? "bg-green-100 text-green-800" :
                            user.role === "buyer" ? "bg-blue-100 text-blue-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>
                            {user.role === "farmer" ? "Farmer" : user.role === "buyer" ? "Buyer" : "Driver"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold leading-5 rounded-full ${
                            user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {user.loginHistory && user.loginHistory.length > 0 
                            ? formatTimeAgo(user.loginHistory[user.loginHistory.length - 1].timestamp)
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleUserPreview(user)}
                              className="p-2 text-green-600 transition-colors rounded-full hover:bg-blue-50"
                              title="Preview User"
                            >
                              <FaEye className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowModal(true);
                              }}
                              className="px-3 py-1 text-sm text-red-600 transition-colors border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FaUsers className="w-12 h-12 mb-4 text-gray-400" />
                          <p className="text-gray-600">No users found matching your criteria</p>
                          <button 
                            onClick={() => {
                              setSearchTerm("");
                              setFilterRole("all");
                              setFilterStatus("all");
                            }}
                            className="mt-4 text-green-600 hover:text-green-800"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Preview Modal */}
      {showPreviewModal && previewUser && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm pb-8">
          <div className="w-full max-w-2xl overflow-hidden transition-all duration-300 ease-in-out transform bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center space-x-2">
                <FaUser className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">User Profile</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-white transition-colors rounded-full hover:bg-green-800"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Profile Section */}
                <div className="flex flex-col items-center p-4 shadow-sm bg-gradient-to-b from-green-50 to-white rounded-xl">
                  <div className="relative">
                    <img 
                      className="object-cover w-24 h-24 border-4 border-green-500 rounded-full shadow-lg" 
                      src={previewUser.profilePic || "https://ui-avatars.com/api/?name="+encodeURIComponent(previewUser.name)+"&background=random"} 
                      alt={previewUser.name} 
                    />
                    <div className="absolute bottom-0 right-0 p-1.5 text-white bg-green-500 rounded-full shadow-md">
                      {previewUser.isVerified ? (
                        <FaCheckCircle className="w-4 h-4" />
                      ) : (
                        <FaTimesCircle className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-gray-800">{previewUser.name}</h2>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      previewUser.role === "farmer" ? "bg-green-100 text-green-800" :
                      previewUser.role === "buyer" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {previewUser.role === "farmer" ? "Farmer" : previewUser.role === "buyer" ? "Buyer" : "Driver"}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      previewUser.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {previewUser.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>

                {/* User Information Section */}
                <div className="p-4 bg-white border border-green-100 shadow-sm rounded-xl">
                  <div className="flex items-center mb-3">
                    <h3 className="text-base font-bold text-green-600">User Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                      <FaUser className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Full Name</p>
                        <p className="text-sm font-semibold text-gray-800">{previewUser.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                      <FaEnvelope className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-800">{previewUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                      <FaPhone className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-800">{previewUser.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Created</p>
                        <p className="text-sm font-semibold text-gray-800">{formatTimeAgo(previewUser.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                      <FaShieldAlt className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Account Status</p>
                        <p className="text-sm font-semibold text-gray-800">{previewUser.isVerified ? "Verified" : "Unverified"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login History Section */}
                <div className="p-4 bg-white border border-green-100 shadow-sm rounded-xl">
                  <div className="flex items-center mb-3">
                    <h3 className="text-base font-bold text-green-600">Login Information</h3>
                  </div>
                  {previewUser.loginHistory && previewUser.loginHistory.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Last Login</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {formatTimeAgo(previewUser.loginHistory[previewUser.loginHistory.length - 1].timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center p-2 transition-colors rounded-lg hover:bg-green-50">
                        <FaDesktop className="w-4 h-4 mr-2 text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Device</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {formatDeviceInfo(previewUser.loginHistory[previewUser.loginHistory.length - 1].deviceInfo)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center">
                      <p className="text-sm text-gray-500">No login history available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-3 border-t border-green-100">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-3 py-1.5 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-xl">
            <div className="p-6 bg-gradient-to-r from-red-600 to-red-700">
              <div className="flex items-center">
                <FaUserShield className="w-6 h-6 mr-3 text-white" />
                <h3 className="text-xl font-semibold text-white">Confirm Deactivation</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-6 text-gray-700">
                Are you sure you want to deactivate <span className="font-bold">{selectedUser.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUserDelete}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Confirm Deactivation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
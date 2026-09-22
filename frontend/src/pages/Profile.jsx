import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { apiService, API_URL } from "../utils/api";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaTruck, 
  FaShoppingCart, FaUserShield, FaLock, FaHistory, FaChartLine, 
  FaCheckCircle, FaTimesCircle, FaTimes, FaDesktop, FaGlobe
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineSecurity } from "react-icons/md";

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading2FA, setLoading2FA] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showUpdateDetailsModal, setShowUpdateDetailsModal] = useState(false);
  const [updateDetails, setUpdateDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [lastSecurityUpdate, setLastSecurityUpdate] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found, please login again.");
        navigate("/login");
        return;
      }

      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData._id) {
        toast.error("User data not found, please login again.");
        navigate("/login");
        return;
      }

      const userId = userData._id;
      const response = await apiService.get(`/api/auth/searchUser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUser(response.data);
        setIs2FAEnabled(response.data.twoFactorEnabled);
        setLastSecurityUpdate(response.data.lastSecurityUpdate);
        
        // Fetch login history
        try {
          const historyResponse = await apiService.get("/api/auth/login-history", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLoginHistory(historyResponse.data.loginHistory || []);
        } catch (historyError) {
          console.error("Error fetching login history:", historyError);
          toast.error("Failed to fetch login history");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data. Please try again.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  const fetchListings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !userData?._id) {
        setListings([]);
        toast.error("Please login to view your listings");
        return;
      }
      
      const response = await apiService.get(
        `${API_URL}/api/marketplace/farmer-listings/${userData._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListings(response.data);
    } catch (error) {
      console.error(error);
      if (user.role === "farmer") {
        console.error('Error fetching listings:', error);
        toast.error("Failed to fetch your listings");
        setListings([]); 
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const fetchAllProducts = async () => {
    try {
      const response = await apiService.get("/api/marketplace/listings");
      setAllProducts(response.data);
      
    } catch (error) {
      console.error(error);
     
      console.error('Error fetching all products:', error);
      toast.error("Failed to fetch all products");
      setAllProducts([]); 
      
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !userData?._id) {
        setReviews([]);
        toast.error("Please login to view reviews");
        return;
      }

      const response = await apiService.get(
        `${API_URL}/api/reviews/farmer-reviews/${userData._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviews(response.data);
    } catch (error) {
      console.error(error);
      if (user.role === "farmer") {
        console.error('Error fetching reviews:', error);
        toast.error("Failed to fetch reviews");
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const fetchOrders = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData._id;

    if (!userId) {
      toast.error("Please login to view your orders");
      return;
    } 
  
    try {
      const response = await apiService.get(`/api/order-history/user/${userId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
    } catch (error) {
      console.error(error);
      console.error("Failed to fetch order history", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Always fetch basic user data for all roles
        await fetchUserData();

        // Fetch all users
        try {
          const response = await apiService.get(`/api/auth/getAllUsers`);
          setAllUsers(response.data.data);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to fetch users");
        }
  
        // Role-specific data fetching
        if (user?.role === "admin") {
          await Promise.all([
            fetchAllProducts()
          ]);
        } else if (user?.role === "farmer") {
          await Promise.all([
            fetchListings(),
            fetchReviews()
          ]);
        } else if (user?.role === "buyer") {
          await Promise.all([
            fetchOrders()
          ]);
        } else if (user?.role === "truck_driver") {
          // Add truck driver-specific fetches here if needed
        }
  
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, user?.role, fetchUserData, fetchListings, fetchReviews]);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image || !user) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("profilePic", image);
    try {
      const response = await apiService.post(
        `${API_URL}/api/photo/upload-profile-pic/${user._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUser((prevUser) => ({ ...prevUser, profilePic: response.data.profilePic }));
      toast.success("Profile picture updated successfully!");
      setImagePreview(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const toggle2FA = async () => {
    try {
      setLoading2FA(true);
      const token = localStorage.getItem("token");
      const response = await apiService.post(
        `${API_URL}/api/auth/toggle-2fa`,
        { enable: !is2FAEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIs2FAEnabled(!is2FAEnabled);
      toast.success(response.data.msg);

      // Fetch updated user data to get new security timestamp
      const userData = JSON.parse(localStorage.getItem("user"));
      const updatedUserResponse = await apiService.get(`/api/auth/searchUser/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastSecurityUpdate(updatedUserResponse.data.lastSecurityUpdate);

      // Refresh login history after toggling 2FA
      try {
        const historyResponse = await apiService.get("/api/auth/login-history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoginHistory(historyResponse.data.loginHistory || []);
      } catch (historyError) {
        console.error("Error fetching login history:", historyError);
        toast.error("Failed to fetch login history");
      }
    } catch (error) {
      console.error(error);
      console.error("Error toggling 2FA:", error);
      toast.error("Failed to update 2FA settings");
    } finally {
      setLoading2FA(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDeviceInfo = (userAgent) => {
    // Simple device detection
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Windows")) return "Windows";
    return "Unknown Device";
  };

  const formatIPAddress = (ip) => {
    if (ip === "::1") {
      return "127.0.0.1";
    }
    return ip;
  };

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

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData._id;

      const response = await apiService.put(
        `${API_URL}/api/auth/change-password/${userId}`,
        {
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === "Password changed successfully") {
        toast.success("Password changed successfully");
        setShowPasswordChangeModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        
        // Fetch updated user data to get new security timestamp
        const updatedUserResponse = await apiService.get(`/api/auth/searchUser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLastSecurityUpdate(updatedUserResponse.data.lastSecurityUpdate);
      }
    } catch (error) {
      console.error(error);
      console.error("Error changing password:", error);
      setPasswordError(error.response?.data?.message || "Failed to change password");
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    
    if (!updateDetails.name || !updateDetails.email || !updateDetails.phone) {
      toast.error("All fields are required.");
      return;
    }

    const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
    const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

    if (!validateEmail(updateDetails.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(updateDetails.phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    try {
      setIsUpdatingDetails(true);
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData._id;

      const response = await apiService.put(
        `${API_URL}/api/auth/updateUser/${userId}`,
        updateDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setUser(response.data);
        toast.success("Profile updated successfully!");
        setShowUpdateDetailsModal(false);
      }
    } catch (error) {
      console.error(error);
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">No user data found</h2>
          <p className="mt-2 text-gray-500">Please try logging in again</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Card - Left Side */}
            <div className="space-y-8 lg:col-span-1">
              {/* Profile Info Card */}
              <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        className="object-cover w-32 h-32 border-4 border-green-500 rounded-full"
                        src={imagePreview || user.profilePic || "https://via.placeholder.com/150"}
                        alt="Profile"
                      />
                      <label className="absolute bottom-0 right-0 p-2 text-white transition-colors bg-green-500 rounded-full cursor-pointer hover:bg-green-600">
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="hidden"
                          accept="image/*"
                        />
                        <FaEdit />
                      </label>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">{user.name}</h2>
                    <span className="px-3 py-1 mt-2 text-sm font-semibold text-green-600 bg-green-100 rounded-full">
                      {user.role === "admin" ? "SYSTEM ADMIN" : user.role === "buyer" ? "Buyer" : user.role === "farmer" ? "Farmer"  : "Truck Driver"}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="w-5 h-5 mr-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="w-5 h-5 mr-3" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="w-5 h-5 mr-3" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full px-4 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Save Profile Picture"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Profile Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  
                  {user.role === "farmer" && (
                    <div className="p-4 rounded-lg bg-green-50">
                      <div className="flex items-center">
                        <FaShoppingCart className="w-6 h-6 mr-2 text-green-500" />
                        <span className="text-2xl font-bold text-gray-800">{listings.length}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">Active Listings</p>
                    </div>
                  )}
                  {user.role === "buyer" && (
                    <div className="p-4 rounded-lg bg-green-50">
                      <div className="flex items-center">
                        <FaShoppingCart className="w-6 h-6 mr-2 text-green-500" />
                        <span className="text-2xl font-bold text-gray-800">{orders.length}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">Total Orders</p>
                    </div>
                  )}
                  {user.role === "truck_driver" && (
                    <div className="p-4 rounded-lg bg-green-50">
                      <div className="flex items-center">
                        <FaTruck className="w-6 h-6 mr-2 text-green-500" />

                        <span className="text-2xl font-bold text-gray-800">5</span>

                        <span className="text-2xl font-bold text-gray-800">25</span>

                      </div>
                      <p className="mt-1 text-sm text-gray-600">Completed Pickups</p>
                    </div>
                  )}
                  {(user.role === "farmer")  && (
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="flex items-center">
                      <FaChartLine className="w-6 h-6 mr-2 text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">{reviews.length}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Rating</p>
                  </div>
                  )}
                  {(user.role === "admin")  && (
                  <>
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="flex items-center">
                      <FaUser className="w-6 h-6 mr-2 text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">{allUsers.length}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Total Users</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="flex items-center">
                      <FaShoppingCart className="w-6 h-6 mr-2 text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">{allProducts.length}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">Total Listings</p>
                  </div>
                  </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content - Right Side */}
            <div className="space-y-8 lg:col-span-2">
              {/* Account Settings Card */}
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
                  <button
                    onClick={() => {
                      setUpdateDetails({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                      });
                      setShowUpdateDetailsModal(true);
                    }}
                    className="flex items-center px-4 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                </div>

                {/* 2FA Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <FaUserShield className="mr-3 text-green-500 h-7 w-7" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button
                      onClick={toggle2FA}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        is2FAEnabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          is2FAEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Role-Specific Actions */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                  {user.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin-dashboard")}
                      className="flex items-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <BiSolidDashboard className="mr-3 text-green-500 h-7 w-7" />
                      <span className="font-medium">Admin Dashboard</span>
                    </button>
                  )}

                  {user.role === "farmer" && (
                    <>
                      <button
                        onClick={() => navigate("/farmer-listings")}
                        className="flex items-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <FaShoppingCart className="mr-3 text-green-500 h-7 w-7" />
                        <span className="font-medium">My Listings</span>
                      </button>
                      <button
                        onClick={() => navigate("/Delivery")}
                        className="flex items-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <FaTruck className="mr-3 text-green-500 h-7 w-7" />
                        <span className="font-medium">Add Pickup Request</span>
                      </button>
                    </>
                  )}

                  {user.role === "buyer" && (
                    <button
                      onClick={() => navigate("/order-history")}
                      className="flex items-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <FaShoppingCart className="mr-3 text-green-500 h-7 w-7" />
                      <span className="font-medium">My Orders</span>
                    </button>
                  )}

                  {user.role === "truck_driver" && (
                    <>
                      <button
                        onClick={() => navigate("/delivery-history")}
                        className="flex items-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <FaTruck className="mr-3 text-green-500 h-7 w-7" />
                        <span className="font-medium">My Pickups</span>
                      </button>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => navigate("/vehicle-registration")}
                          className="flex items-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <FaTruck className="mr-3 text-green-500 h-7 w-7" />
                          <span className="font-medium">+ Add Vehicle</span>
                        </button>
                        <button
                          onClick={() => navigate("/vehicle-list")}
                          className="ml-4 text-green-500 hover:underline font-medium"
                          style={{ minWidth: '48px' }}
                        >
                          View
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Security Card */}
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <FaLock className="w-6 h-6 mr-3 text-green-500" />
                      <div>
                        <h4 className="font-medium text-gray-800">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                    </div>
                    <button 
                      className="text-green-500 hover:text-green-600"
                      onClick={() => setShowPasswordChangeModal(true)}>
                      Change
                    </button>
                  </div>
                  
                  {/* Login History Section */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <FaHistory className="w-6 h-6 mr-3 text-green-500" />
                      <div>
                        <h4 className="font-medium text-gray-800">Login History</h4>
                        <p className="text-sm text-gray-600">View your recent login activity</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowLoginHistoryModal(true)}
                      className="text-green-500 hover:text-green-600"
                    >
                      View
                    </button>
                  </div>

                  {/* Security Settings Update Section */}
                  <div className="flex items-center p-4 rounded-lg bg-gray-50">
                    <MdOutlineSecurity className="mr-3 text-green-500 h-7 w-7" />
                    <div>
                      <p className="font-medium text-gray-800">Security settings updated</p>
                      <p className="text-sm text-gray-600">
                        {lastSecurityUpdate ? formatTimeAgo(lastSecurityUpdate) : 'No recent updates'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login History Modal */}
      {showLoginHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b">
                <div className="flex items-center space-x-3">
                  <FaHistory className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-800">Recent Login History</h3>
                </div>
                <button 
                  onClick={() => setShowLoginHistoryModal(false)}
                  className="text-gray-500 transition-colors duration-200 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {loginHistory.length > 0 ? (
                  loginHistory.slice(0, 5).map((login, index) => (
                    <div 
                      key={index} 
                      className="p-4 transition-shadow duration-200 border rounded-lg hover:shadow-md bg-gradient-to-r from-gray-50 to-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${login.status === "success" ? "bg-green-100" : "bg-red-100"}`}>
                            {login.status === "success" ? (
                              <FaCheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <FaTimesCircle className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {login.action || (login.status === "success" ? "Successful Login" : "Failed Login Attempt")}
                            </p>
                            <p className="text-sm text-gray-600">{formatDate(login.timestamp)}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <FaDesktop className="w-4 h-4 text-gray-400" />
                            <p>{getDeviceInfo(login.deviceInfo)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaGlobe className="w-4 h-4 text-gray-400" />
                            <p>IP: {formatIPAddress(login.ipAddress)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                      <FaHistory className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-500">No login history available</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t">
                <button
                  onClick={() => setShowLoginHistoryModal(false)}
                  className="flex items-center px-6 py-2 space-x-2 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md transition-all duration-300 ease-in-out transform bg-white shadow-2xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b">
                <div className="flex items-center space-x-3">
                  <FaLock className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowPasswordChangeModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="text-gray-500 transition-colors duration-200 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <FaLock className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <FaLock className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <FaLock className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                  </div>
                </div>
                
                {passwordError && (
                  <div className="flex items-center p-3 space-x-2 border border-red-200 rounded-lg bg-red-50">
                    <FaTimesCircle className="text-red-500" />
                    <p className="text-sm text-red-600">{passwordError}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-6 space-x-3 border-t">
                <button
                  onClick={() => {
                    setShowPasswordChangeModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="flex items-center px-6 py-2 space-x-2 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="flex items-center px-6 py-2 space-x-2 text-white transition-colors duration-200 bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <FaLock className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Details Modal */}
      {showUpdateDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md transition-all duration-300 ease-in-out transform bg-white shadow-2xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b">
                <div className="flex items-center space-x-3">
                  <FaUser className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-800">Update Profile Details</h3>
                </div>
                <button 
                  onClick={() => setShowUpdateDetailsModal(false)}
                  className="text-gray-500 transition-colors duration-200 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateDetails}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={updateDetails.name}
                        onChange={(e) => setUpdateDetails({ ...updateDetails, name: e.target.value })}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                      <FaUser className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={updateDetails.email}
                        onChange={(e) => setUpdateDetails({ ...updateDetails, email: e.target.value })}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                        placeholder="Enter your email"
                        readOnly
                      />
                      <FaEnvelope className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={updateDetails.phone}
                        onChange={(e) => setUpdateDetails({ ...updateDetails, phone: e.target.value })}
                        className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                      <FaPhone className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 mt-6 space-x-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowUpdateDetailsModal(false)}
                    className="flex items-center px-6 py-2 space-x-2 text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingDetails}
                    className="flex items-center px-6 py-2 space-x-2 text-white transition-colors duration-200 bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {isUpdatingDetails ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FaEdit className="w-4 h-4" />
                        <span>Update Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
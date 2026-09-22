import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, API_URL } from "../utils/api";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";

export const UpdateDetails = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No token found, please login again.");
          return;
        }

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData._id;

        const response = await apiService.get(
          `${API_URL}/api/auth/searchUser/${userId}`
        );

        setUser({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          password: "", 
          confirmPassword: "",
        });

      } catch (error) {
        toast.error("Failed to fetch user data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone); 
  const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.phone) {
      toast.error("All fields are required.");
      return;
    }

    if (!validateEmail(user.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(user.phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (user.password && user.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData._id;

      const updatePayload = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        ...(user.password && { password: user.password }), // Only send password if user entered a new one
      };

      await apiService.put(
        `${API_URL}/api/auth/updateUser/${userId}`,
        updatePayload
      );

      toast.success("User details updated successfully!");
      navigate("/profile"); // Redirect after update

    } catch (error) {
      toast.error("Failed to update details.");
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} /> {/* Toast container */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-zinc-900">Update Details</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Full name"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-6">
              <input
                type="telephone"
                placeholder="Phone Number"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={user.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={user.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xl text-white bg-green-600 rounded-2xl hover:bg-green-700"
              >
                {loading ? "Updating details..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

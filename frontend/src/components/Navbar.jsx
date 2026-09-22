import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { RiArrowDropDownLine, RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { FaRegCircleUser } from "react-icons/fa6";
import toast from "react-hot-toast";
import { apiService } from "../utils/api";

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        }
    }, []);

    return isAuthenticated;
}

export const Navbar = () => {
    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({}); 
    const [loading, setLoading] = useState(true);

    const serviceDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);
    const sidebarRef = useRef(null);
    const isAuthenticated = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("No token found, please login again.");
                    return;
                }
                
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = userData?._id;  // ✅ Use optional chaining to prevent errors
                
                if (!userId) {
                    toast.error("User not found, please login again.");
                    return;
                }

                const response = await apiService.get(`/api/auth/searchUser/${userId}`);
                setUser(response.data);
            } catch (error) {
                toast.error("Failed to fetch user data.");
                console.error("User data fetch error:", error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUserData();
        }

        function handleClickOutside(event) {
            if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
                setServiceDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [isAuthenticated]);

    return (
    <>
  {/* Main Navbar */}
  <nav className="fixed top-0 z-50 flex items-center justify-between w-full p-4 text-lg bg-white shadow-lg">
    {/* Logo */}
    <Link to="/" className="flex text-2xl font-bold cursor-pointer">
      <div className="text-zinc-900">Waste</div>
      <span className="text-green-600">2Wealth</span>
    </Link>
    

    {/* Mobile Menu Button */}
    <button 
      id="menu-button"
      className="z-50 block md:hidden"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label={sidebarOpen ? "Close menu" : "Open menu"}
    >
      {sidebarOpen ? (
        <RiCloseLine size={28} className="text-zinc-900" />
      ) : (
        <RiMenu3Line size={28} className="text-zinc-900" />
      )}
    </button>

    {/* Desktop Navigation Links */}
    <div className="items-center hidden space-x-6 md:flex text-zinc-900">
      <Link to="/" className="hover:text-green-600">Home</Link>

      {/* Services Dropdown - Desktop */}
      <div className="relative" ref={serviceDropdownRef}>
        <button
          onClick={() => {
            setServiceDropdownOpen(!serviceDropdownOpen);
            setUserDropdownOpen(false); // Close user dropdown if open
          }}
          className="hover:text-green-600 focus:outline-none"
        >
          <div className="flex flex-row items-center hover:text-green-600">
            Our Services
            <RiArrowDropDownLine size={30} />
          </div>
        </button>

        {serviceDropdownOpen && (
          <div className="absolute left-0 w-48 bg-white border rounded-lg shadow-lg top-8">
            <ul className="flex flex-col p-2">
              <li>
                <Link to="/organic-waste" className="block px-4 py-2 hover:bg-gray-100">
                  Buy Products
                </Link>
              </li>
              <li>
                <Link to="/product-listing-form" className="block px-4 py-2 hover:bg-gray-100">
                  List Products
                </Link>
              </li>
              <li>
                <Link to="/transport-service" className="block px-4 py-2 hover:bg-gray-100">
                  Transport Service
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      <Link to="/contactus" className="hover:text-green-600">Contact Us</Link>
      <Link to="/about-us" className="hover:text-green-600">About Us</Link>
    </div>

    {/* Desktop Auth Buttons / User Profile */}
    <div className="hidden space-x-3 md:flex">
      {isAuthenticated ? (
        <div className="relative flex items-center" ref={userDropdownRef}>
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setServiceDropdownOpen(false);
            }}
            className="flex items-center cursor-pointer hover:text-green-600 focus:outline-none"
          > 
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline">{loading ? "Loading..." : user?.email || "No Email"}</span>
              <img
                className="object-cover w-[40px] h-[40px] border-2 border-green-600 rounded-full shadow-md"
                src={user.profilePic || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"}
                alt="Profile"
              />
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 w-48 bg-white border rounded-md shadow-lg top-14">
              <ul className="flex flex-col p-2">
                <li className="px-4 py-2 rounded-md cursor-pointer hover:bg-green-100">
                  <Link to="/profile">Profile Settings</Link>
                </li>
                <li
                  className="px-4 py-2 rounded-md cursor-pointer hover:bg-green-100"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link to="/login">
            <button className="px-4 py-2 text-green-600 bg-white border border-green-600 rounded-lg cursor-pointer hover:bg-gray-100/50">Sign in</button>
          </Link>
          <Link to="/register">
            <button className="px-4 py-2 text-white bg-green-600 rounded-lg cursor-pointer hover:bg-green-700">Sign up</button>
          </Link>
        </>
      )}
    </div>
  </nav>

  {/* Mobile Sidebar */}
  <div 
    ref={sidebarRef}
    className={`fixed top-0 right-0 z-40 h-full w-[80%] max-w-[300px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
      sidebarOpen ? "translate-x-0" : "translate-x-full"
    } md:hidden`}
  >
    <div className="flex flex-col h-full pt-20 pb-6 overflow-y-auto">
      {/* Mobile User Profile Section */}
      {isAuthenticated ? (
        <div className="flex flex-col items-center p-4 mb-4 border-b">
          <img
            className="object-cover w-[60px] h-[60px] border-2 border-green-600 rounded-full shadow-md mb-2"
            src={user.profilePic || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"}
            alt="Profile"
          />
          <span className="text-sm font-medium text-zinc-900">
            {loading ? "Loading..." : user?.email || "No Email"}
          </span>
          <div className="flex mt-3 space-x-2">
            <Link to="/profile" onClick={() => setSidebarOpen(false)}>
              <button className="px-3 py-1 text-sm text-green-800 border border-green-800 rounded-lg">
                Profile
              </button>
            </Link>
            <button 
              className="px-3 py-1 text-sm text-white bg-green-600 rounded-lg"
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center p-4 mb-4 space-x-3 border-b">
          <Link to="/login" onClick={() => setSidebarOpen(false)}>
            <button className="px-4 py-2 text-green-800 border border-green-800 rounded-lg">
              Sign in
            </button>
          </Link>
          <Link to="/register" onClick={() => setSidebarOpen(false)}>
            <button className="px-4 py-2 text-white bg-green-600 rounded-lg">
              Sign up
            </button>
          </Link>
        </div>
      )}

      {/* Mobile Navigation Links */}
      <div className="flex flex-col px-4">
        <Link 
          to="/" 
          className="py-3 border-b border-gray-200 text-zinc-900 hover:text-green-600"
          onClick={() => setSidebarOpen(false)}
        >
          Home
        </Link>
        
        {/* Mobile Services Dropdown */}
        <div className="py-3 border-b border-gray-200">
          <button
            onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
            className="flex items-center justify-between w-full text-zinc-900 hover:text-green-600 focus:outline-none"
          >
            <span>Our Services</span>
            <RiArrowDropDownLine 
              size={30} 
              className={`transform transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {serviceDropdownOpen && (
            <div className="mt-2 ml-4">
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link 
                    to="/organic-waste" 
                    className="block py-2 text-zinc-700 hover:text-green-600"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Buy Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/product-listing-form" 
                    className="block py-2 text-zinc-700 hover:text-green-600"
                    onClick={() => setSidebarOpen(false)}
                  >
                    List Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/transport-service" 
                    className="block py-2 text-zinc-700 hover:text-green-600"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Transport Service
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <Link 
          to="/contactus" 
          className="py-3 border-b border-gray-200 text-zinc-900 hover:text-green-600"
          onClick={() => setSidebarOpen(false)}
        >
          Contact Us
        </Link>
        
        <Link 
          to="/about" 
          className="py-3 border-b border-gray-200 text-zinc-900 hover:text-green-600"
          onClick={() => setSidebarOpen(false)}
        >
          About Us
        </Link>
      </div>
    </div>
  </div>

  {/* Overlay for mobile sidebar */}
  {sidebarOpen && (
    <div 
      className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}

  {/* Spacer to push content below navbar */}
  <div className="h-20"></div>
    </>
    );
};

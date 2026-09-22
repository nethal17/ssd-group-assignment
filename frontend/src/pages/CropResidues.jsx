/*import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiService, API_URL } from "../utils/api";
import { Navbar } from "../components/Navbar";
import { toast } from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

export const CropResidues = () => {
  const { waste_type } = useParams(); 
  const [wasteData, setWasteData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);


  // Fetch waste data
  useEffect(() => {
    
    const fetchWasteData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/agri-waste/waste/${encodeURIComponent(waste_type)}`
        );
        setWasteData(response.data);
      } catch (error) {
        toast.error("Failed to load data. Please try again.");
        console.error("Error fetching crop residues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWasteData();
  }, [waste_type]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.error("No token found, please login again.");
          return;
        }
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData._id;
        const response = await apiService.get(`/api/auth/searchUser/${userId}`);
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleAddToCart = async (waste) => {
    
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    if(user.role !== "buyer"){
      toast.error("Only buyers can add items to cart");
      return;
    }
    
    setAddingToCart(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/api/cart/add`,
        {
          userId : user._id, // Assuming your auth context provides user._id
          wasteId: waste._id,
          description: waste.description,
          price: waste.price,
          deliveryCost: 300, // You can calculate this dynamically if needed
          quantity: 1 // Default quantity, can be made adjustable
        }
      );
      
      toast.success("Item added to cart successfully!");
      
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
      
    }
  };

  if (loading) return <p>Loading...</p>;
  

  return (
    <>
      <Navbar />

      <Link to="/cart">
      <div className="justify-center justify place-items-end mt-[35px] px-[50px]">
      <FaShoppingCart size={35} className="text-green-600 cursor-pointer"
      />
      </div>
      </Link>

      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-center">Waste Materials</h1>
        <div className="grid grid-cols-1 gap-5 mt-4">
          {wasteData.length > 0 ? (
            wasteData.map((waste) => (
              <div key={waste._id} className="flex items-center justify-between p-4 border rounded shadow">
                <div>
                  <h2 className="text-xl font-semibold">{waste.description}</h2>
                  <p>District: {waste.district}</p>
                  <p>Quantity: {waste.quantity}</p>
                  <p>Price: {waste.price}</p>
                  <p>Expire Date: {new Date(waste.expire_date).toLocaleDateString()}</p>
                </div>
                <button 
                  className={`px-4 py-2 text-white rounded ${addingToCart ? 'bg-gray-500' : 'bg-green-600 : hover:bg-green-700' }`}
                  onClick={() => handleAddToCart(waste)}
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Adding...' : 'Add To Cart'}
                </button>
              </div>
            ))
          ) : (
            <p>No Crop Residues found.</p>
          )}
        </div>
      </div>
    </>
  );
};*/
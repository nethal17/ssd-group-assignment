import { apiService } from "../utils/api";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const MetalWaste = () => {
  const { waste_type } = useParams(); // Extract waste type from URL params
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        const response = await apiService.get(
          `/api/agri-waste/waste/${encodeURIComponent(waste_type)}`
        );
        setWasteData(response.data);
      } catch (error) {
        console.error("Error fetching crop residues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWasteData();
  }, [waste_type]);

  const handleAddToCart = (waste) => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || []; // Get existing cart
    cartItems.push(waste); // Add new item
    localStorage.setItem("cart", JSON.stringify(cartItems)); // Save updated cart
    alert(`${waste.description} added to cart!`); // Show confirmation message
  };

  if (loading) return <p>Loading...</p>;

   return (
        <>
          <Navbar />
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">Metal Waste</h1>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {wasteData.length > 0 ? (
                wasteData.map((waste) => (
                  <div key={waste._id} className="border p-4 rounded shadow flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{waste.description}</h2>
                      <p>District: {waste.district}</p>
                      <p>Quantity: {waste.quantity}</p>
                      <p>Price: {waste.price}</p>
                      <p>Expire Date: {new Date(waste.expire_date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                      onClick={() => handleAddToCart(waste)} // Call function on click
                    >
                      Add To Cart
                    </button>
                  </div>
                ))
              ) : (
                <p>No Metal Waste found.</p>
              )}
            </div>
          </div>
        </>
      );
    };
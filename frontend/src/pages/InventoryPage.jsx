import { useState, useEffect } from "react";
import { FiBell, FiSearch } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";

const WASTE_TYPES = {
  'Crop Residues': ['Wheat straw', 'Rice husk', 'Corn stalks', 'Lentil husks', 'Chickpea stalks', 'Pea pods','Mustard stalks', 'Sunflower husks', 'Groundnut shells'],
  'Fruit & Vegetable Waste': ['Banana peels', 'Orange pulp', 'Mango peels', 'Tomato skins', 'Potato peels', 'Carrot tops','Rotten tomatoes', 'Overripe bananas'],
  'Plantation Waste': ['Tea leaves', 'Coffee husk', 'Coffee pulp', 'Bagasse', 'Molasses', 'Cane tops','Coconut husks', 'Shells', 'Leaves'],
  'Nut & Seed Waste': ['Peanut Shells', 'Almond & Cashew Husks','Sesame & Flaxseed Waste'],
  'Livestock & Dairy Waste': ['Cow dung', 'Poultry droppings', 'Goat manure', 'Abattoir Waste (Bones, Blood, Skin leftovers)','Whey', 'Spoiled milk', 'Butter residue'],
  'Forestry Waste': ['Sawdust & Wood Chips', 'Bamboo Waste', 'Leaf & Bark Residue'],
  'Chemical Waste': ['Expired Pesticides & Herbicides','Fertilizer Residues','Disinfectants & Cleaning Agents'],
  'Plastic Waste': ['Pesticide & Fertilizer Packaging (Plastic bags, bottles, sachets)','Mulching Films & Plastic Sheets','Drip Irrigation Pipes & Tubes','Greenhouse Plastic Covers'],
  'Metal Waste': ['Rusty Farm Equipment & Tools (Plows, Harrows, Blades)','Wire Fencing & Metal Posts','Discarded Machinery Parts (Tractor parts, Gears, Bearings)'],
  'Fabric & Textile Waste': ['Burlap Sacks & Jute Bags','Tarpaulins & Netting Materials','Old Protective Gear (Gloves, Aprons, Coveralls)'],
  'Glass & Ceramic Waste': ['Chemical Containers','Pesticide Bottles','Damaged Ceramic Pots & Storage Jars'],
  'Rubber Waste': ['Used Tires from Tractors & Farm Vehicles','Rubber Seals & Hoses','Discarded Conveyor Belts']
};

const getWasteType = (wasteItem) => {
  if (!wasteItem) return null;
  for (const [wasteType, items] of Object.entries(WASTE_TYPES)) {
    if (items.some(item => wasteItem.toLowerCase() === item.toLowerCase())) {
      return wasteType;
    }
  }
  return null;
};

export const InventoryPage = () => {
  const navigate = useNavigate();
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view this page");
      navigate("/login");
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      toast.error("Only Admin can view this page");
      navigate("/");
    }

    fetchMarketplaceListings();
  }, [navigate]);

  const fetchMarketplaceListings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/listings`);
      if (!response.ok) throw new Error("Failed to fetch marketplace listings.");
      const data = await response.json();
      
      const listingsWithTypes = data.map(listing => ({
        ...listing,
        wasteType: getWasteType(listing.wasteItem),
        expireDate: new Date(listing.expireDate) // Convert to Date object for sorting
      })).filter(listing => listing.wasteType !== null);
      
      // Sort by expiration date (nearest first)
      const sortedListings = listingsWithTypes.sort((a, b) => a.expireDate - b.expireDate);
      setMarketplaceListings(sortedListings);
    } catch (error) {
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = marketplaceListings
    .filter(listing => {
      const searchLower = searchTerm.toLowerCase();
      return listing.wasteItem.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => a.expireDate - b.expireDate); 

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-green-400 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-green-300 rounded"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchMarketplaceListings}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search and Notification */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search waste items..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Inventory Items</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredListings.length} of {marketplaceListings.length} items
              {filteredListings.length > 0 && " (Sorted by nearest expiry)"}
            </p>
          </div>
          
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left text-gray-700 font-semibold">Waste Type</th>
                  <th className="p-3 text-left text-gray-700 font-semibold">Item</th>
                  <th className="p-3 text-left text-gray-700 font-semibold">Quantity (KG)</th>
                  <th className="p-3 text-left text-gray-700 font-semibold">Price</th>
                  <th className="p-3 text-left text-gray-700 font-semibold">Location</th>
                  <th className="p-3 text-left text-gray-700 font-semibold">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr 
                    key={listing._id} 
                    className="border-b border-gray-100 hover:bg-green-50 transition-all duration-150"
                  >
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {listing.wasteType}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-800">{listing.wasteItem}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{listing.description}</div>
                    </td>
                    <td className="p-3 font-medium text-gray-700">
                      {listing.quantity} KG
                    </td>
                    <td className="p-3 font-semibold text-green-600">Rs.{listing.price}</td>
                    <td className="p-3 text-gray-700">{listing.district}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        new Date(listing.expireDate) < new Date() 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {listing.expireDate.toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No items found matching your search</div>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
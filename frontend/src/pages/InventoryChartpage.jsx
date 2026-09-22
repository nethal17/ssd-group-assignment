import { useState, useEffect } from "react";
import { FiBell, FiSearch, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { API_URL } from "../utils/api";

Chart.register(...registerables);

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

export const InventoryChartpage = () => {
  const navigate = useNavigate();
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view this page");
      navigate("/login");
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = userData.role;

    if (userRole !== "admin") {
      toast.error("Only Admin can view this page");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchMarketplaceListings();
  }, []);

  const fetchMarketplaceListings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/listings`);
      if (!response.ok) {
        throw new Error("Failed to fetch marketplace listings.");
      }
      const data = await response.json();
      
      const listingsWithTypes = data.map(listing => ({
        ...listing,
        wasteType: getWasteType(listing.wasteItem)
      })).filter(listing => listing.wasteType !== null);
      
      setMarketplaceListings(listingsWithTypes);
    } catch (error) {
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate waste type statistics
  const calculateWasteStats = () => {
    return marketplaceListings.reduce((acc, listing) => {
      if (!listing.wasteType) return acc;
      
      if (!acc[listing.wasteType]) {
        acc[listing.wasteType] = {
          count: 0,
          totalQuantity: 0
        };
      }
      acc[listing.wasteType].count += 1;
      acc[listing.wasteType].totalQuantity += listing.quantity;
      return acc;
    }, {});
  };

  // Get top 5 stocked items
  const getTopStockedItems = () => {
    return [...marketplaceListings]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(item => ({
        name: item.wasteItem.length > 20 ? `${item.wasteItem.substring(0, 20)}...` : item.wasteItem,
        quantity: item.quantity,
        fullName: item.wasteItem
      }));
  };

  // Get low stock items
  const getLowStockItems = () => {
    return marketplaceListings
      .filter(item => item.quantity < 10)
      .map(item => ({
        name: item.wasteItem,
        current: item.quantity,
        threshold: 10
      }));
  };

  // Generate stock movement data (mock for now)
  const generateStockMovementData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseStock = marketplaceListings.reduce((sum, item) => sum + item.quantity, 0) / 6;
    
    return {
      labels: months,
      stockIn: months.map(() => Math.floor(baseStock * (0.8 + Math.random() * 0.4))),
      stockOut: months.map(() => Math.floor(baseStock * (0.5 + Math.random() * 0.3))),
    };
  };

  // Get chart data
  const wasteTypeStats = calculateWasteStats();
  const existingWasteTypes = Object.keys(wasteTypeStats).filter(type => wasteTypeStats[type].count > 0);
  const topStockedItems = getTopStockedItems();
  const lowStockItems = getLowStockItems();
  // eslint-disable-next-line no-unused-vars
  const stockMovementData = generateStockMovementData();

  // Chart configurations
  const pieData = {
    labels: existingWasteTypes,
    datasets: [{
      data: existingWasteTypes.map(type => wasteTypeStats[type].totalQuantity),
      backgroundColor: [
        "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
        "#EC4899", "#14B8A6", "#F97316", "#64748B", "#06B6D4",
        "#84CC16", "#D946EF" 
      ].slice(0, existingWasteTypes.length),
      borderWidth: 0,
    }],
  };

  const barChartData = {
    labels: topStockedItems.map(item => item.name),
    datasets: [{
      label: 'Quantity (KG)',
      data: topStockedItems.map(item => item.quantity),
      backgroundColor: '#4F46E5',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-xl text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Analytics Dashboard</h1>
            <p className="text-gray-600">Visual insights into agricultural waste recycling</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
              <FiBell className="text-gray-600" />
            </button>
          </div>
        </div>

        

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Waste Types</p>
            <p className="text-2xl font-bold text-gray-800">{existingWasteTypes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-2xl font-bold text-gray-800">{marketplaceListings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Quantity</p>
            <p className="text-2xl font-bold text-indigo-600">
              {marketplaceListings.reduce((sum, item) => sum + item.quantity, 0)} KG
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Avg. Quantity</p>
            <p className="text-2xl font-bold text-green-600">
              {marketplaceListings.length > 0 
                ? Math.round(marketplaceListings.reduce((sum, item) => sum + item.quantity, 0) / marketplaceListings.length)
                : 0} KG
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Waste Distribution</h2>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        By Quantity
                    </span>
                </div>
                <div className="h-96"> {/* Increased height from h-80 to h-96 */}
                    <Pie 
                        data={pieData}
                        options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                            usePointStyle: true,
                            padding: 16,
                            boxWidth: 10,
                            font: {
                                size: 10 // Smaller font for legend
                            }
                            }
                        },
                        tooltip: {
                            callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.raw} KG (${Math.round(context.parsed * 100 / context.dataset.data.reduce((a, b) => a + b, 0))}%)`;
                            }
                            }
                        }
                        },
                        layout: {
                        padding: {
                            right: 20 // Add some padding to prevent legend cutoff
                        }
                        }
                    }}
                />
            </div>
        </div>

          {/* Top Stocked Items Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Top Stocked Items</h2>
              <div className="flex items-center text-green-600 text-sm">
                <FiTrendingUp className="mr-1" />
                <span>High Volume</span>
              </div>
            </div>
            <div className="h-80">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        title: (context) => {
                          const index = context[0].dataIndex;
                          return topStockedItems[index].fullName;
                        },
                        label: (context) => {
                          return `Quantity: ${context.raw} KG`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false
                      }
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false
                      },
                      ticks: {
                        callback: (value) => `${value} KG`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          

          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h2>
              {lowStockItems.length > 0 ? (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {lowStockItems.length} Alert{lowStockItems.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  All Good
                </span>
              )}
            </div>

            {lowStockItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    item.current < 5 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">
                        {item.name.length > 24 ? `${item.name.substring(0, 24)}...` : item.name}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        item.current < 5 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {item.current < 5 ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-medium">{item.current}kg</span> / 10kg threshold
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.current < 5 ? 'bg-red-500' : 'bg-yellow-500'
                        }`} 
                        style={{ width: `${(item.current / item.threshold) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {item.current < 5 ? 'Restock immediately' : 'Consider restocking'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-green-50 rounded-lg">
                <div className="text-green-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800">No low stock items</h3>
                <p className="text-gray-600">All items are above the minimum threshold</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
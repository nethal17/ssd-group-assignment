"use client"

import { useState, useEffect } from "react"
import { Navbar } from "../components/Navbar"
import { Link, useParams, useNavigate } from "react-router-dom"
import { apiService, API_URL } from "../utils/api"
import { toast } from "react-hot-toast"
import { MapPin, Calendar, User, ShoppingCart, ArrowLeft, Search, ImageIcon } from "lucide-react"

const nonOrganics = [
  { name: "Chemical Waste", image: "/images/Chemical_Waste.jpg", value: "Chemical Waste" },
  { name: "Plastic Waste", image: "/images/Plastic_Waste.jpg", value: "Plastic Waste" },
  { name: "Metal Waste", image: "/images/Metal_Waste.jpg", value: "Metal Waste" },
  { name: "Fabric & Textile", image: "/images/Fabric_Textile_Waste.jpg", value: "Fabric & Textile" },
  { name: "Glass & Ceramic", image: "/images/Glass_Ceramic_Waste.jpg", value: "Glass & Ceramic" },
  { name: "Rubber Waste", image: "/images/Rubber_Waste.jpg", value: "Rubber Waste" },
]

const wasteItemsByType = {
  "Chemical Waste": ["Expired Pesticides & Herbicides", "Fertilizer Residues", "Disinfectants & Cleaning Agents"],
  "Plastic Waste": [
    "Pesticide & Fertilizer Packaging (Plastic bags, bottles, sachets)",
    "Mulching Films & Plastic Sheets",
    "Drip Irrigation Pipes & Tubes",
    "Greenhouse Plastic Covers",
  ],
  "Metal Waste": [
    "Rusty Farm Equipment & Tools (Plows, Harrows, Blades)",
    "Wire Fencing & Metal Posts",
    "Discarded Machinery Parts (Tractor parts, Gears, Bearings)",
  ],
  "Fabric & Textile Waste": [
    "Burlap Sacks & Jute Bags",
    "Tarpaulins & Netting Materials",
    "Old Protective Gear (Gloves, Aprons, Coveralls)",
  ],
  "Glass & Ceramic Waste": ["Chemical Containers", "Pesticide Bottles", "Damaged Ceramic Pots & Storage Jars"],
  "Rubber Waste": ["Used Tires from Tractors & Farm Vehicles", "Rubber Seals & Hoses", "Discarded Conveyor Belts"],
}

const CartButton = ({ itemCount }) => {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate("/cart")} className="relative group">
      <div className="p-3 transition-all duration-300 transform bg-white rounded-full shadow-md group-hover:shadow-lg group-hover:bg-green-50">
        <div className="relative">
          <ShoppingCart className="w-6 h-6 text-green-600 transition-colors group-hover:text-green-700" />
          {itemCount > 0 && (
            <div className="absolute transition-all transform -top-2 -right-2">
              <div className="relative">
                <div className="absolute w-full h-full bg-green-500 rounded-full opacity-75 animate-ping"></div>
                <div className="relative flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600 rounded-full">
                  {itemCount}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="absolute px-2 py-1 text-xs font-medium text-white transition-all duration-300 transform -translate-x-1/2 bg-green-700 rounded-md opacity-0 -bottom-8 left-1/2 group-hover:opacity-100 whitespace-nowrap">
        View Cart
      </div>
    </button>
  )
}

// Component to display products for a specific category
const CategoryProducts = () => {
  const { waste_type } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedWasteItem, setSelectedWasteItem] = useState("all")
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log("Fetching products for waste type:", waste_type)

        const response = await apiService.get(
          `${API_URL}/api/marketplace/waste-type/${encodeURIComponent(waste_type)}`,
        )

        if (!response.data.success) {
          throw new Error(response.data.message || "No products found in this category")
        }

        console.log("API Response:", response.data)
        setProducts(response.data.data)
        setError(null)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(`Failed to fetch products: ${error.message}`)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [waste_type])

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        const userId = userData._id

        if (userId) {
          const response = await apiService.get(`/api/cart/${userId}`)
          if (response.data) {
            setCartItemsCount(response.data.items.length)
          }
        }
      } catch (error) {
        console.error("Error fetching cart count:", error)
      }
    }

    fetchCartCount()
  }, [])

  const handleAddToCart = async (product) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    const userId = userData._id

    try {
      if (!userId) {
        toast.error("Please login to add items to cart")
        navigate("/login")
        return
      }

      console.log("Farmer ID:", product.farmerId._id)
      const cartItem = {
        userId,
        wasteId: product._id,
        farmerId: product.farmerId._id, // Add the farmerId property
        description: product.wasteItem,
        price: product.price,
        quantity: product.quantity,
        deliveryCost: 1000, // You can modify this based on your requirements
        productImage: product.image || "", // Add the image URL to the cart item
      }

      const response = await apiService.post("/api/cart/add", cartItem)

      if (response.data) {
        setCartItemsCount((prevCount) => prevCount + 1)
        toast.success(`${product.wasteItem} added to cart!`)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart")
    }
  }

  const wasteItems = wasteItemsByType[waste_type] || []

  const filteredProducts =
    selectedWasteItem === "all" ? products : products.filter((product) => product.wasteItem === selectedWasteItem)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-16 h-16 border-t-4 border-b-4 border-green-600 rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-green-700">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-8 mx-auto">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-red-500 bg-red-100 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate("/non-organic")}
              className="px-4 py-2 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Return to Categories
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Link
                to="/non-organic"
                className="inline-flex items-center px-3 py-1.5 mr-3 text-sm font-medium text-green-700 transition-all duration-300 bg-green-100 rounded-full hover:bg-green-200"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{waste_type}</h1>
            </div>
            <p className="text-gray-600">Browse sustainable {waste_type.toLowerCase()} products for recycling</p>
          </div>
          <CartButton itemCount={cartItemsCount} />
        </div>

        {/* Waste Items Filter */}
        {wasteItems.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-700">Filter by Waste Type</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedWasteItem("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedWasteItem === "all"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-200"
                }`}
              >
                All Items
              </button>
              {wasteItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedWasteItem(item)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedWasteItem === item
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-green-500 bg-green-100 rounded-full">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-800">No Products Found</h3>
            <p className="max-w-md mx-auto mb-6 text-gray-600">
              {selectedWasteItem === "all"
                ? "No products are currently available in this category."
                : `No products are currently available for ${selectedWasteItem}.`}
            </p>
            <button
              onClick={() => setSelectedWasteItem("all")}
              className="px-6 py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col h-full overflow-hidden transition-all duration-300 transform bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.wasteItem}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/images/no-image.png" // Fallback image
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 px-3 py-1.5 m-3 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm">
                    {product.quantity} kg
                  </div>
                </div>
                <div className="flex flex-col flex-grow p-6">
                  <div className="flex-grow">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-green-700">
                      {product.wasteItem}
                    </h3>
                    <p className="mb-4 text-gray-600 line-clamp-2 min-h-[3rem]">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">Rs. {product.price}</span>
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        {waste_type}
                      </span>
                    </div>
                    <div className="space-y-2.5 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="flex-shrink-0 w-4 h-4 text-green-500" />
                        <span className="truncate">
                          {product.farmer?.name || product.farmerId?.name || "Unknown Farmer"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="flex-shrink-0 w-4 h-4 text-green-500" />
                        <span className="truncate">
                          {product.location?.city || product.city}, {product.location?.district || product.district}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="flex-shrink-0 w-4 h-4 text-green-500" />
                        <span className="truncate">Expires: {new Date(product.expireDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center justify-center w-full px-4 py-3 mt-6 space-x-2 text-white transition-all duration-300 bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const NonOrganicWaste = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [cartItemsCount, setCartItemsCount] = useState(0)

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        const userId = userData._id

        if (userId) {
          const response = await apiService.get(`/api/cart/${userId}`)
          if (response.data) {
            setCartItemsCount(response.data.items.length)
          }
        }
      } catch (error) {
        console.error("Error fetching cart count:", error)
      }
    }

    fetchCartCount()
  }, [])

  const filteredWaste = nonOrganics.filter((waste) => waste.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-green-800">Non-Organic Waste Marketplace</h1>
          <p className="max-w-2xl mx-auto text-gray-600">
            Browse sustainable non-organic agricultural waste products for recycling and reuse. Help reduce waste and
            support eco-friendly practices.
          </p>
        </div>

        <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link to="/organic-waste">
              <button className="px-5 py-2.5 font-medium text-green-700 transition-all duration-300 bg-white border-2 border-green-600 rounded-lg shadow-sm hover:bg-green-50 hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none">
                Organic Waste
              </button>
            </Link>
            <Link to="/non-organic">
              <button className="px-5 py-2.5 font-medium text-white transition-all duration-300 bg-green-600 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none">
                Non-Organic Waste
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                placeholder="Search Agri-Waste"
                className="w-full p-3 pl-12 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
            </div>
            <CartButton itemCount={cartItemsCount} />
          </div>
        </div>

        {filteredWaste.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-green-500 bg-green-100 rounded-full">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-800">No Categories Found</h3>
            <p className="max-w-md mx-auto mb-6 text-gray-600">
              No waste categories match your search term "{searchTerm}".
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-6 py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWaste.map((waste, index) => (
              <div
                key={index}
                className="relative overflow-hidden transition-all duration-500 transform shadow-md cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1"
                onClick={() => navigate(`/non-organic/${waste.value}`)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={waste.image || "/placeholder.svg"}
                    alt={waste.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-opacity bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">{waste.name}</h3>
                  <div className="w-16 h-1 my-3 bg-green-500 rounded-full"></div>
                  <span className="px-4 py-1.5 mt-2 text-sm font-medium text-white bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                    Browse Products
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { CategoryProducts }

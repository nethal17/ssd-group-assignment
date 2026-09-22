"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Navbar } from "../components/Navbar"
import { apiService } from "../utils/api"
import { ShoppingCart, ArrowLeft, Trash2, ShoppingBag, Truck, CreditCard } from "lucide-react"

export const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const userData = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = userData._id

  const fetchCartItems = useCallback(async () => {
    try {
      if (!userId) {
        toast.error("Please login to view your cart")
        navigate("/login")
        return
      }
      const response = await apiService.get(`/api/cart/${userId}`)
      
      if (response.data) {
        setCartItems(response.data.items)
      }
    } catch (error) {
      console.error("Error fetching cart items:", error.response?.data?.message || error.message)
      toast.error("Failed to load cart items")
    } finally {
      setLoading(false)
    }
  }, [userId, navigate])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  // updateQuantity function is prepared for future quantity update feature
  // eslint-disable-next-line no-unused-vars
  const updateQuantity = async (wasteId, change) => {
    try {
      if (!userId) {
        toast.error("Please login to update cart")
        navigate("/login")
        return
      }

      const item = cartItems.find((item) => item.wasteId === wasteId)
      if (!item) return

      const newQuantity = item.quantity + change
      if (newQuantity < 1) {
        await removeItem(wasteId)
        return
      }

      const response = await apiService.put("/api/cart/update", {
        userId,
        wasteId,
        quantity: newQuantity,
      })

      if (response.data) {
        setCartItems((prevItems) =>
          prevItems.map((item) => (item.wasteId === wasteId ? { ...item, quantity: newQuantity } : item)),
        )
        toast.success("Cart updated successfully")
      }
    } catch (error) {
      console.error("Error updating quantity:", error.response?.data?.message || error.message)
      toast.error("Failed to update cart")
    }
  }

  const removeItem = async (wasteId) => {
    try {
      if (!userId) {
        toast.error("Please login to remove items")
        navigate("/login")
        return
      }

      const response = await apiService.delete("/api/cart/remove", {
        data: { userId, wasteId },
      })

      if (response.data) {
        setCartItems((prevItems) => prevItems.filter((item) => item.wasteId !== wasteId))
        toast.success("Item removed from cart")
      }
    } catch (error) {
      console.error("Error removing item:", error.response?.data?.message || error.message)
      toast.error("Failed to remove item")
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity + item.deliveryCost)
    }, 0)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  const calculateDelivery = () => {
    return cartItems.reduce((total, item) => {
      return total + item.deliveryCost
    }, 0)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
          <div className="container max-w-6xl px-4 py-16 mx-auto">
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
              <div className="w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-lg font-medium text-green-700">Loading your cart...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-green-40 to-white">
        <div className="container max-w-6xl px-4 py-12 mx-auto">
          <div className="flex items-center mb-8 space-x-2">
            <button
              onClick={() => navigate("/organic-waste")}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 transition-all duration-300 bg-green-100 rounded-full hover:bg-green-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Continue Shopping
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="overflow-hidden bg-white shadow-md rounded-2xl">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
                      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.wasteId} className="p-6 transition-all duration-300 hover:bg-green-50">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="flex-shrink-0">
                            <div className="relative w-24 h-24 overflow-hidden bg-gray-100 sm:h-28 sm:w-28 rounded-xl">
                              {item.productImage ? (
                                <img
                                  className="object-cover w-full h-full"
                                  src={item.productImage || "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fimage&psig=AOvVaw0EpofGXa2hnQAqEatLDhnU&ust=1746074298883000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJD26rT4_owDFQAAAAAdAAAAABAI"}
                                  alt={"Product Image"}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col justify-between flex-grow">
                            <div>
                              <div className="flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">{item.wasteItem}</h3>
                                <div className="text-lg font-bold text-green-600">
                                  Rs. {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            </div>

                            <div className="flex flex-wrap items-end justify-between mt-4 gap-y-3">
                              <div className="flex items-center">
                                <span className="px-3 py-1 font-medium text-gray-700 rounded-lg bg-gray-50">
                                  Quantity: {item.quantity}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Truck className="w-4 h-4 mr-1 text-green-500" />
                                  <span>Delivery: Rs. {item.deliveryCost.toFixed(2)}</span>
                                </div>
                                <button
                                  onClick={() => removeItem(item.wasteId)}
                                  className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 transition-colors bg-red-50 rounded-lg hover:bg-red-100"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="p-6 bg-white shadow-md rounded-2xl">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Order Summary</h2>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">Rs. {calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className="font-medium">Rs. {calculateDelivery().toFixed(2)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-gray-200 border-dashed">
                        <div className="flex justify-between text-lg font-bold text-gray-800">
                          <span>Total</span>
                          <span className="text-green-600">Rs. {calculateTotal().toFixed(2)}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Taxes included where applicable</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/buyer-address-form")
                        toast.success("Proceeding to checkout...")
                      }}
                      className="flex items-center justify-center w-full px-6 py-3.5 mt-6 space-x-2 text-white transition-all duration-300 bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Proceed to Checkout</span>
                    </button>

                    <button
                      onClick={() => navigate("/organic-waste")}
                      className="flex items-center justify-center w-full px-6 py-3 mt-3 space-x-2 text-green-700 transition-all duration-300 bg-white border border-green-600 rounded-lg hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Continue Shopping</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white shadow-md rounded-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-green-500 bg-green-100 rounded-full">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-gray-800">Your cart is empty</h3>
              <p className="max-w-md mx-auto mb-8 text-gray-600">
                Looks like you haven't added any items to your cart yet. Start exploring our sustainable waste products!
              </p>
              <button
                onClick={() => navigate("/organic-waste")}
                className="inline-flex items-center px-6 py-3 font-medium text-white transition-all duration-300 bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { Navbar } from "../components/Navbar"
import { 
  Users, 
  Package, 
  DollarSign, 
  Truck, 
  Boxes, 
  Star, 
  ChevronRight 
} from "lucide-react"
import { Link } from "react-router-dom"

export const AdminDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Main Content */}
        <main className="container px-4 py-12 mx-auto">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-bold text-zinc-900">Admin Dashboard</h1>
            <p className="text-lg text-zinc-600">Manage your system more efficiently</p>
          </div>

          {/* Management Options Grid */}
          <div className="grid grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-3 max-w-7xl">
            <Link to="/all-users" className="group">
              <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-800">User Management</h2>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors text-zinc-400 group-hover:text-green-600" />
                </div>
              </div>
            </Link>

            <Link to="/order-dashboard" className="group">
              <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-800">Order Management</h2>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors text-zinc-400 group-hover:text-blue-600" />
                </div>
              </div>
            </Link>

            <Link to="/final-summary" className="group">
              <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-800">Financial Management</h2>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors text-zinc-400 group-hover:text-purple-600" />
                </div>
              </div>
            </Link>

            <div className="group">
              <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-800">Transport Management</h2>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors text-zinc-400 group-hover:text-orange-600" />
                </div>
              </div>
            </div>

            <Link to="/inventory-management" className="group">
              <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Boxes className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-800">Inventory Management</h2>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors text-zinc-400 group-hover:text-red-600" />
                </div>
              </div>
            </Link>

            <Link to="/review-manager" className="group">
              <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-800">Review Management</h2>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors text-zinc-400 group-hover:text-yellow-600" />
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
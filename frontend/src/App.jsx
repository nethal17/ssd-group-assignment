import React from 'react';
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { UpdateDetails } from './pages/UpdateDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { AllUsers } from './components/AllUsers';
import { DisplayAllUsers } from './pages/DisplayAllUsers';
import { DisplayAllFarmers } from './pages/DisplayAllFarmers';
import { DisplayAllBuyers } from './pages/DisplayAllBuyers';
import { DisplayAllDrivers } from './pages/DisplayAllDrivers';
import { ContactUs } from './pages/ContactUs';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from "./pages/ResetPassword";
import { StartList } from './pages/StartList';
import { TwoStepVerification } from './components/TwoStepVerification';
import Charts from './pages/Charts';
import PaymentDashboard from './pages/PaymentDashboard';
import EmailVerificationSuccess from './pages/EmailVerificationSuccess';
import VehicleList from './pages/VehicleList';

import { OrganicWaste, CategoryProducts } from './pages/OrganicWaste';
import { NonOrganicWaste, CategoryProducts as NonOrganicCategoryProducts } from './pages/NonOrganicWaste';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { BuyerAddressForm } from './pages/BuyerAddressForm';
import { AboutUs } from './pages/AboutUs';
import { OrderDashboard } from './pages/OrderDashboard';

import Success from './pages/Success';


import DriverList from './components/DriverList';
import DriverForm from './components/DriverForm';
import PaymentDetails from './components/PaymentDetails';
import StripePayment from './components/StripePayment';
import PayHistory from './components/PayHistory';
import HighPayments from './components/HighPayments';
import Final from './components/Final';
import FarmerList from './components/FarmerList';
import FarmerPaymentNew from './components/FarmerPaymentNew';

import { AddOrderPage } from './pages/AddOrderPage';
import { AddReviewPage } from './pages/AddReviewPage';
import { InventoryManagerDashboard } from './pages/InventoryManagerDashboard';
import { InventoryPage } from './pages/InventoryPage';
import InventoryManagement from './pages/InventoryManagement';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ReviewManagerDashboard } from './pages/ReviewManagerDashboard';
import { ProductListingForm } from './pages/ProductListingForm';
import { DisplayFarmerListings } from './pages/DisplayFarmerListings';
import { DisplayFarmerReviews } from './pages/DisplayFarmerReviews';
import { InventoryChartpage } from './pages/InventoryChartpage';
import { InventoryCategoryPage } from './pages/InventoryCategoryPage';

import HomeTesting from './pages/HomeTesting';
import Delivery from './pages/Delivery';
import TruckDriverDashboard from './pages/TruckDriverDashboard';
import FarmerReqForm from './pages/FarmerReqForm';
import Refund from './components/refund';
import VehicleRegPage from './pages/VehicleReg';
import DeliveryHistoryDashboard from './pages/DeliveryHistoryDashboard';
import { Analysis } from "./components/Analysis";


function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomeTesting />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/update-details" element={< UpdateDetails />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/all" element={<AllUsers />} />
      <Route path="/all-users" element={<DisplayAllUsers />} />
      <Route path="/all-buyers" element={<DisplayAllBuyers />} />
      <Route path="/all-farmers" element={<DisplayAllFarmers />} />
      <Route path="/all-drivers" element={<DisplayAllDrivers />} />
      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/two-step" element={<TwoStepVerification />} />
      <Route path="/start-listing" element={<StartList />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/payment-dashboard" element={<PaymentDashboard />} />
      <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />

      <Route path="/organic-waste" element={<OrganicWaste />} />
      <Route path="/non-organic" element={<NonOrganicWaste />} />
      <Route path="/organic/:category" element={<CategoryProducts />} />
      <Route path="/non-organic/:waste_type" element={<NonOrganicCategoryProducts />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/buyer-address-form" element={<BuyerAddressForm />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/order-dashboard" element={<OrderDashboard />} />

      <Route path="/driver" element={<DriverList />} />
      <Route path="/farmer-list" element={<FarmerList />} />
      <Route path="/farmer/:id/payment" element={<FarmerPaymentNew />} />
      <Route path="/create" element={<DriverForm />} />
      <Route path="/driver/:id/payment" element={<PaymentDetails />} />
      <Route path="/payment" element={<StripePayment />} /> 
      <Route path="/success" element={<Success />} /> 
      <Route path="/pay-history" element={<PayHistory />} />
      <Route path="/high-payments" element={<HighPayments />} />
      <Route path="/final-summary" element={<Final />} />

      <Route path="/add-order" element={<AddOrderPage />} />
      <Route path="/add-review" element={<AddReviewPage />} />
      <Route path="/inventory-dashboard" element={<InventoryManagerDashboard />}/>
      <Route path="/inventory-management" element={<InventoryManagement />} />
      <Route path="/inventory-chart" element={<InventoryChartpage />} />
      <Route path="/inventory-category" element={<InventoryCategoryPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/order-history" element={<OrderHistoryPage />} />
      <Route path="/review-manager" element={<ReviewManagerDashboard />} />
      
      <Route path='/Delivery' element={<Delivery/>} />
      <Route path='/truck-dashboard' element={<TruckDriverDashboard/>} />
      <Route path='/farmer-ReqForm' element={<FarmerReqForm/>} />

      <Route path="/product-listing-form" element={<ProductListingForm />} />
      <Route path="/farmer-listings" element={<DisplayFarmerListings />} /> 
      <Route path="/farmer-reviews" element={<DisplayFarmerReviews />} /> 
      <Route path="/refunds" element={<Refund />} />

      <Route path="/home-testing" element={<HomeTesting />} />
      <Route path="/vehicle-registration" element={<VehicleRegPage />} />
      <Route path="/vehicle-list" element={<VehicleList />} />

      <Route path="/delivery-history" element={<DeliveryHistoryDashboard />} />
      <Route path="/analysis" element={<Analysis />} />
    </Routes>
    </ErrorBoundary>
  )
}

export default App;
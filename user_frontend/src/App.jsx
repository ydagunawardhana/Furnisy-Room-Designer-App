import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import CartDrawer from "./components/CartDrawer";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import DesignIdeas from "./pages/DesignIdeas";
import BuildRoom from "./components/BuildRoom";
import RoomDesigner from "./components/RoomDesigner";
import { Toaster } from "react-hot-toast";
import Profile from "./pages/Profile";

function App() {
  const location = useLocation();
  const hideLayoutRoutes = ["/build-room", "/room-designer"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 95,
        }}
      />
      <div className="min-h-screen bg-white">
        <ScrollToTop />
        {!shouldHideLayout && <Navbar />}
        {!shouldHideLayout && <CartDrawer />}

        <Routes>
          {/* Home Page*/}
          <Route path="/" element={<Home />} />

          {/* Register Page */}
          <Route path="/register" element={<Register />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Shop Page */}
          <Route path="/shop" element={<Shop />} />

          {/* Product Details Page */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Cart Page */}
          <Route path="/cart" element={<Cart />} />

          {/* Checkout Page */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Wishlist Page */}
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Compare Page */}
          <Route path="/compare" element={<Compare />} />

          {/* DesignIdeas Page */}
          <Route path="/designideas" element={<DesignIdeas />} />

          {/* Bulid Room Page */}
          <Route path="/build-room" element={<BuildRoom />} />

          {/* Room Design Page */}
          <Route path="/room-designer" element={<RoomDesigner />} />

          {/* My Profile Page */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </>
  );
}

export default App;

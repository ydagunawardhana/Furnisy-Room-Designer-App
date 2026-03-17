import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaInstagram, FaTrash, FaEdit } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import HeaderImage from "../assets/header_img.png";
import emptyCartImage from "../assets/empty_cart.png";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { auth } from "../firebase";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    deleteAddress,
  } = useCart();

  const [shippingMethod, setShippingMethod] = useState("free");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Cart Empty In Case
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white">
        {/* --- Page Banner Section --- */}
        <div
          className="w-full h-[250px] relative flex flex-col items-center justify-center text-white mb-10 md:mb-16"
          style={{
            backgroundImage: `url(${HeaderImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 flex flex-col items-center gap-3 mt-4">
            <h1 className="text-3xl md:text-[36.4px] font-light capitalize tracking-wide">
              View Cart
            </h1>

            <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
              <Link
                to="/"
                className="hover:text-white transition-colors cursor-pointer hover:underline"
              >
                Home
              </Link>
              <span className="text-gray-400 text-sm">&gt;</span>
              <Link
                to="/shop"
                className="hover:text-white transition-colors cursor-pointer hover:underline"
              >
                Shop
              </Link>
              <span className="text-gray-400 text-sm">&gt;</span>
              <span className="text-white">View Cart</span>
            </div>
          </div>
        </div>

        {/* --- Empty Cart Message --- */}
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-14">
          <img
            src={emptyCartImage}
            alt="Empty Cart"
            className="w-[350px] h-[150px] opacity-100"
          />
        </div>
        <h2 className="text-[28px] font-medium text-gray-900 mb-2">
          Your cart is currently empty.
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-md font-light">
          Looks like you haven't added anything to your cart yet. Browse our
          store to find something you'll love!
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="px-8 py-3 rounded-lg font-medium  border-black bg-[#111] text-white  text-[16px]  hover:bg-white hover:text-black 
                transition-colors duration-500  shadow-md border-2 "
        >
          Return to Shop
        </button>

        {/* --- Newsletter Subscription Section --- */}
        <div className="w-full bg-[#f2f2f2] py-20 px-8 md:px-16 lg:px-24 font-inter  border-gray-200 mt-14">
          <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="w-full lg:w-[55%] text-center lg:text-left">
              <h2 className="text-[38px] md:text-[48px] lg:text-[52.4px] font-semibold text-gray-900 leading-[1.1] mb-5 tracking-tight">
                Subscribe to our newsletter <br className="hidden md:block" />
                and Grab 30% OFF
              </h2>
              <p className="text-[15px] text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-extralight">
                We believe in keeping you at the forefront of innovation
                information, and inspiration. That's why we invite you to.
              </p>
            </div>

            <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[550px] bg-white rounded-full border border-gray-900 p-2 flex items-center shadow-sm focus-within:border-black 
            focus-within:ring-1 focus-within:ring-black transition-all duration-300"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-transparent outline-none px-6 text-[15px] text-gray-800 placeholder-gray-400"
                />

                <button
                  className="bg-[#1a1a19] text-white hover:text-[#1a1a19] border-2 border-[#1a1a19] font-semibold px-1 md:px-8 py-3 rounded-full
               hover:bg-transparent transition-all active:scale-95 whitespace-nowrap shadow-md cursor-pointer"
                >
                  Subscribe now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Furniture Gallery Section --- */}
        <div className="w-full py-16 px-8 md:px-16 lg:px-24 bg-white font-inter">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl md:text-[34px] font-medium text-gray-900 tracking-tight">
                Furniture Gallery
              </h2>

              {/* Follow Button */}
              <button
                className="flex items-center gap-2.5 bg-gray-900 text-white px-6 py-3 rounded-[10px] bg-[#1a1a19] hover:bg-transparent
            hover:text-[#1a1a19] border-2 border-[#1a1a19] active:scale-95 shadow-md group cursor-pointer"
              >
                <FaInstagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[16px] md:text-[16px] font-medium">
                  Follow
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  id: 1,
                  img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-1.webp&w=1920&q=75",
                },
                {
                  id: 2,
                  img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-2.webp&w=1920&q=75",
                },
                {
                  id: 3,
                  img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-3.webp&w=1920&q=75",
                },
                {
                  id: 4,
                  img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-4.webp&w=1920&q=75",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="relative w-full aspect-square md:aspect-[4/5] rounded-[15px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.img}
                    alt={`Gallery Image ${item.id}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center 
                opacity-0 group-hover:opacity-100"
                  >
                    <FaInstagram className="text-white text-4xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Footer Section --- */}
        <Footer />
      </div>
    );
  }

  // Cart Products Available In Case
  return (
    <div className="w-full bg-white">
      {/* --- Page Banner Section --- */}
      <div
        className="w-full h-[250px] relative flex flex-col items-center justify-center text-white mb-10 md:mb-16"
        style={{
          backgroundImage: `url(${HeaderImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 flex flex-col items-center gap-3 mt-4">
          <h1 className="text-3xl md:text-[36.4px] font-light capitalize tracking-wide">
            View Cart
          </h1>

          <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
            <Link
              to="/"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <Link
              to="/shop"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Shop
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <span className="text-white">View Cart</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 xl:px-20 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 ">
          {/* --- Cart Items Table --- */}
          <div className="w-full lg:w-[65%] xl:w-[75%] ">
            <div className="w-full border-2 border-zinc-300 rounded-[10px] overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 border-b-2 border-zinc-300 p-5 text-[18px] font-semibold text-gray-900">
                <div className="col-span-6">Products</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y-2 divide-zinc-300">
                {cartItems.map((item, index) => {
                  const itemPrice = parseFloat(item.price.replace("$", ""));
                  const itemSubtotal = itemPrice * item.quantity;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 relative group"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                        <div className="relative w-[80px] h-[80px] bg-gray-100 rounded-md overflow-hidden shrink-0">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover bg-gray-50 rounded-md shadow-md hover:scale-105 transition-transform border-2 border-zinc-300"
                          />
                        </div>
                        <div className="flex flex-col">
                          <h3
                            className="text-[17px] font-medium text-gray-900 capitalize cursor-pointer hover:text-gray-600 transition-colors"
                            onClick={() => navigate("/product/" + item.id)}
                          >
                            {item.name}
                          </h3>
                          <span className="text-[14px] text-black mt-1 font-light">
                            Color: {item.color} | Material: {item.material}
                          </span>

                          <div className="md:hidden text-[17px] font-medium text-gray-900 mt-2">
                            {item.price}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="hidden md:block col-span-2 text-center text-[16px] font-medium text-gray-600">
                        {item.price}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                        <div className="flex items-center border-2 border-zinc-300 rounded overflow-hidden h-[40px] w-[80px]">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.material,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            className="flex-1 w-full h-full hover:bg-gray-100 text-black transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            readOnly
                            className="w-10 text-center text-[15px] outline-none font-medium bg-transparent"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.material,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            className="flex-1 w-full h-full hover:bg-gray-100 text-black transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="hidden md:flex col-span-2 items-center justify-end gap-8">
                        <span className="text-[16px] font-medium text-gray-900">
                          ${itemSubtotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.material, item.color)
                          }
                          className="w-9 h-9 rounded-full flex items-center justify-center text-black hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.material, item.color)
                        }
                        className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <button
                onClick={() => navigate("/shop")}
                className="w-full sm:w-auto h-[50px] border-2 border-gray-300 text-gray-700 px-8 hover:border-gray-900 hover:text-gray-900 border-zinc-400
                 text-black font-semibold text-[16px] rounded-lg hover:bg-black hover:text-white transition-colors duration-500 "
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* --- Cart Totals --- */}
          <div className="w-full lg:w-[35%] xl:w-[35%]">
            <div className="border-2 border-zinc-300 border-dashed shadow-md rounded-[10px] p-6 lg:p-8 bg-white sticky top-28">
              <h2 className="text-[24px] font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-zinc-300">
                Cart Totals
              </h2>

              <div className="flex justify-between items-center mb-5 text-[17px]">
                <span className="text-black font-medium">Subtotal</span>
                <span className="font-medium text-black">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="py-5 border-t-2 border-b-2 border-zinc-300 mb-5">
                <span className="block text-[17px] font-medium text-gray-900 mb-4">
                  Shipping
                </span>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "free"}
                      onChange={() => setShippingMethod("free")}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[15px] text-gray-600 group-hover:text-black">
                      Free Shipping
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "flat"}
                      onChange={() => setShippingMethod("flat")}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[15px] text-gray-600 group-hover:text-black">
                      Flat Rate: <span className="font-medium">$10.00</span>
                    </span>
                  </label>
                </div>

                <div className="mt-5 text-[15px] font-light">
                  <p className="text-gray-500 mb-3">
                    Shipping to{" "}
                    <span className="text-gray-900 font-medium">
                      {selectedAddress
                        ? `${selectedAddress.country}, ${selectedAddress.city}`
                        : "No address selected"}
                    </span>
                  </p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="group text-black hover:text-zinc-700 transition-colors font-medium shadow-lg rounded-lg w-full py-2 text-center border-2 
                  border-dashed border-zinc-400"
                  >
                    <span className="relative inline-block ">
                      Change address
                      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center -mb-0.5"></span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 text-[20px]">
                <span className="font-semibold text-gray-900">Total</span>

                <span className="font-bold text-gray-900">
                  $
                  {(shippingMethod === "free"
                    ? subtotal
                    : subtotal + 10
                  ).toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (!auth.currentUser) {
                    toast.custom(
                      (t) => (
                        <div
                          className={`${
                            t.visible ? "toast-enter" : "toast-exit"
                          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                        >
                          <ErrorIcon size={20} className="text-red-400" />
                          <span className="text-[14px] font-medium">
                            Please login to proceed to checkout!
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 3000 }
                    );
                   
                    return;
                  }

                  navigate("/checkout");
                }}
                className="w-full py-3  shadow-[0_4px_14px_rgba(0,0,0,0.1)] border-2 border-black bg-[#111] 
                text-white font-medium text-[17px] rounded-lg hover:bg-white hover:text-black hover:border-black transition-colors duration-500 "
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Related Products --- */}
      <RelatedProducts />

      {/* --- Newsletter Subscription Section --- */}
      <div className="w-full bg-[#f2f2f2] py-20 px-8 md:px-16 lg:px-24 font-inter  border-gray-200">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-[55%] text-center lg:text-left">
            <h2 className="text-[38px] md:text-[48px] lg:text-[52.4px] font-semibold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              Subscribe to our newsletter <br className="hidden md:block" />
              and Grab 30% OFF
            </h2>
            <p className="text-[15px] text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-extralight">
              We believe in keeping you at the forefront of innovation
              information, and inspiration. That's why we invite you to.
            </p>
          </div>

          <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
            <div
              className="relative w-full max-w-[550px] bg-white rounded-full border border-gray-900 p-2 flex items-center shadow-sm focus-within:border-black 
            focus-within:ring-1 focus-within:ring-black transition-all duration-300"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent outline-none px-6 text-[15px] text-gray-800 placeholder-gray-400"
              />

              <button
                className="bg-[#1a1a19] text-white hover:text-[#1a1a19] border-2 border-[#1a1a19] font-semibold px-1 md:px-8 py-3 rounded-full
               hover:bg-transparent transition-all active:scale-95 whitespace-nowrap shadow-md cursor-pointer"
              >
                Subscribe now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Furniture Gallery Section --- */}
      <div className="w-full py-16 px-8 md:px-16 lg:px-24 bg-white font-inter">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl md:text-[34px] font-medium text-gray-900 tracking-tight">
              Furniture Gallery
            </h2>

            {/* Follow Button */}
            <button
              className="flex items-center gap-2.5 bg-gray-900 text-white px-6 py-3 rounded-[10px] bg-[#1a1a19] hover:bg-transparent
            hover:text-[#1a1a19] border-2 border-[#1a1a19] active:scale-95 shadow-md group cursor-pointer"
            >
              <FaInstagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[16px] md:text-[16px] font-medium">
                Follow
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                id: 1,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-1.webp&w=1920&q=75",
              },
              {
                id: 2,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-2.webp&w=1920&q=75",
              },
              {
                id: 3,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-3.webp&w=1920&q=75",
              },
              {
                id: 4,
                img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-4.webp&w=1920&q=75",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="relative w-full aspect-square md:aspect-[4/5] rounded-[15px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-shadow"
              >
                <img
                  src={item.img}
                  alt={`Gallery Image ${item.id}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center 
                opacity-0 group-hover:opacity-100"
                >
                  <FaInstagram className="text-white text-4xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Footer Section --- */}
      <Footer />

      {/* --- Change Address Modal --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[10px] w-full max-w-md p-6 shadow-2xl animation-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[20px] font-semibold text-gray-900">
                Select Shipping Address
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-600 transition-colors text-[17px] hover:bg-zinc-300 rounded-full w-8 h-8 flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setIsAddressModalOpen(false);
                    toast.custom(
                      (t) => (
                        <div
                          className={`${
                            t.visible ? "toast-enter" : "toast-exit"
                          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                        >
                          <CheckmarkIcon size={20} className="text-green-400" />
                          <span className="text-[14px] font-medium">
                            Address changed successfully!
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 2000 }
                    );
                  }}
                  className={`p-5 border rounded-md cursor-pointer relative hover:shadow-md hover:border-black transition-colors ${
                    selectedAddress?.id === addr.id
                      ? "border-black border-2 bg-gray-50 shadow-md"
                      : "border-2 border-zinc-400 hover:border-gray-450 "
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900 text-[16px]">
                      {addr.type}
                    </span>
                    {selectedAddress?.id === addr.id && (
                      <span className="text-[12px] bg-black text-white px-2 py-1 rounded-lg font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-zinc-600 leading-relaxed font-medium">
                    {addr.street}, {addr.city}, {addr.country} {addr.zip}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (!auth.currentUser) {
                  setIsAddressModalOpen(false);
                  toast.custom(
                    (t) => (
                      <div
                        className={`${
                          t.visible ? "toast-enter" : "toast-exit"
                        } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                      >
                        <ErrorIcon size={20} className="text-red-400" />
                        <span className="text-[14px] font-medium">
                          Please login to add a new address!
                        </span>
                      </div>
                    ),
                    { position: "top-right", duration: 3000 }
                  );
                  return;
                }

                setSelectedAddress(null);
                setIsAddressModalOpen(false);
                navigate("/checkout");
              }}
              className="w-full mt-5 py-3 border-2 border-dashed border-zinc-400 text-gray-700 rounded-md font-medium text-[16px] hover:border-black hover:text-black 
              transition-colors hover:bg-zinc-100"
            >
              + Add New Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

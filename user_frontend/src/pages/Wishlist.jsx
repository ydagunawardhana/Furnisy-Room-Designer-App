import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaShoppingCart, FaInstagram } from "react-icons/fa";
import HeaderImage from "../assets/header_img.png";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import emptywishlistImage from "../assets/empty_wishlist.png";
import Footer from "../components/Footer";
import RelatedProducts from "../components/RelatedProducts";

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Wishlist remove
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const moveToCart = (item) => {
    addToCart(item, 1, item.size || "m", item.color || "#000");
    removeFromWishlist(item.id);
  };

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
            Wishlist
          </h1>
          <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
            <Link
              to="/"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <span className="text-white">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 xl:px-20 max-w-[1400px]">
        {/* Wishlist Empty Message */}
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <img
                src={emptywishlistImage}
                alt="Empty Wishlist"
                className="w-[350px] h-[150px] mb-4 opacity-100"
              />
            </div>
            <h2 className="text-[28px] font-medium text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 text-center max-w-md font-light">
              You haven't added any products to your wishlist yet. Explore our
              store and find something you love!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-8 py-3 rounded-lg font-medium  border-black bg-[#111] text-white  text-[16px]  hover:bg-white hover:text-black 
                transition-colors duration-500  shadow-md border-2"
            >
              Explore Products
            </button>
          </div>
        ) : (
          /* Wishlist Table  */
          <div className="w-full border-2 border-zinc-300 rounded-[10px] overflow-hidden shadow-md mb-14">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 border-b-2 border-zinc-300 p-5 text-[18px] font-semibold text-gray-900">
              <div className="col-span-5">Product Name</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Stock Status</div>
              <div className="col-span-3 text-center">Actions</div>
            </div>

            {/* List of Items */}
            <div className="divide-y-2 divide-zinc-300">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 relative group hover:bg-gray-50/50 transition-colors"
                >
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                    <div
                      className="relative w-[80px] h-[80px] bg-gray-100 rounded-md overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => navigate("/product/" + item.id)}
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover mix-blend-multiply p-1 bg-gray-50 rounded-md shadow-md hover:scale-105 transition-transform border-2
                         border-zinc-300"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3
                        className="text-[16px] font-medium text-gray-900 capitalize cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={() => navigate("/product/" + item.id)}
                      >
                        {item.name}
                      </h3>

                      <span className="text-[14px] text-black mt-1 font-light">
                        {item.selectedColor && (
                          <p>Color: {item.selectedColor}</p>
                        )}
                        {item.selectedMaterial && (
                          <p>Material: {item.selectedMaterial}</p>
                        )}
                      </span>

                      <div className="md:hidden flex items-center gap-3 mt-2">
                        <span className="text-[16px] font-medium text-gray-900">
                          {item.price}
                        </span>
                        <span
                          className={`text-[13px] font-medium ${
                            item.inStock ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price*/}
                  <div className="hidden md:flex col-span-2 flex-col items-center justify-center text-[17px]">
                    {item.oldPrice && (
                      <span className="text-gray-400 line-through text-[14px]">
                        {item.oldPrice}
                      </span>
                    )}
                    <span className="font-medium text-black">{item.price}</span>
                  </div>

                  {/* Stock Status*/}
                  <div className="hidden md:block col-span-2 text-center">
                    <span
                      className={`text-[16px] font-medium ${
                        item.inStock ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Actions (Add to Cart & Remove) */}
                  <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center gap-4 md:gap-6 mt-4 md:mt-0">
                    <button
                      onClick={() => moveToCart(item)}
                      disabled={!item.inStock}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-[14px] transition-all duration-500 ${
                        item.inStock
                          ? "shadow-md border-2 border-black bg-[#111] text-white font-medium text-[15px] rounded-lg hover:bg-white hover:text-black transition-colors duration-500"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaShoppingCart size={14} />
                      Add To Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-zinc-300 transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0"
                      title="Remove from wishlist"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
    </div>
  );
};

export default Wishlist;

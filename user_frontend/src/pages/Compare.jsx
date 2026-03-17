import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaShoppingCart, FaRegEye, FaInstagram } from "react-icons/fa";
import HeaderImage from "../assets/header_img.png";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import ProductModal from "../components/ProductModal";
import Footer from "../components/Footer";
import emptycompareImage from "../assets/compare_empty.png";

const Compare = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { compareItems, removeFromCompare } = useCompare();

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const moveToCart = (item) => {
    const materialToCart = item.selectedMaterial || "Standard Wood";
    const colorToCart = item.selectedColor || "Black";

    addToCart(item, 1, materialToCart, colorToCart);
    removeFromCompare(item.id);
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
            Compare
          </h1>
          <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
            <Link
              to="/"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <span className="text-white">Compare</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 xl:px-20 max-w-[1510px]">
        {/* Compare Empty page */}
        {compareItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
            <div className="w-32 h-28 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <img
                src={emptycompareImage}
                alt="Empty Compare"
                className="w-[350px] h-[150px] opacity-100"
              />
            </div>
            <h2 className="text-[28px] font-medium text-gray-900 mb-2">
              Compare list is empty
            </h2>
            <p className="text-gray-500 mb-8 text-center max-w-md font-light">
              You haven't added any products to compare yet. Add products to see
              their differences side-by-side.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-8 py-3 rounded-lg font-medium  border-black bg-[#111] text-white  text-[16px]  hover:bg-white hover:text-black 
                transition-colors duration-500  shadow-md border-2 "
            >
              Back to Shop
            </button>
          </div>
        ) : (
          /* Compare Table (Responsive Horizontal Scroll) */
          <div className="w-full overflow-x-auto hide-scrollbar border-2 border-zinc-200 border-dashed rounded-[10px] shadow-md mb-14">
            <div className="min-w-max flex flex-col w-full">
              {/* Products Row (Images & Names) */}
              <div className="flex border-b-2 border-zinc-300 bg-white">
                <div className="w-[160px] md:w-[220px] shrink-0 p-5 flex items-top text-[14px] md:text-[18px] font-semibold text-black bg-gray-50/50 border-r-2 border-zinc-300">
                  Products
                </div>

                {[0, 1, 2, 3].map((index) => {
                  const item = compareItems[index];
                  return (
                    <div
                      key={`prod-${index}`}
                      className="flex-1 w-[250px] md:w-[200px] shrink-0 p-5 flex flex-col relative group justify-center items-center"
                    >
                      {item ? (
                        <>
                          <button
                            onClick={() => removeFromCompare(item.id)}
                            className="absolute top-6 right-8 flex items-center gap-1 text-[15px] text-gray-400 hover:text-red-500 transition-colors z-10 hover:bg-zinc-300 rounded-full p-1"
                          >
                            <FaTimes />
                          </button>
                          <div
                            className="w-full aspect-[4/3] bg-gray-50 rounded-md mb-2 overflow-hidden flex items-center justify-center cursor-pointer"
                            onClick={() => navigate("/product/" + item.id)}
                          >
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-[150px] h-[150px] object-cover bg-gray-50 rounded-md shadow-md hover:scale-105 transition-transform border-2 border-zinc-300"
                            />
                          </div>
                          <h3
                            className="text-[16px] font-medium text-gray-900 capitalize ml-4 cursor-pointer hover:text-zinc-500 transition-colors justify-center w-full flex items-center"
                            onClick={() => navigate("/product/" + item.id)}
                          >
                            {item.name}
                          </h3>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black text-[14px] font-bold">
                          No Product
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Price Row */}
              <div className="flex border-b-2 border-zinc-300 bg-white hover:bg-gray-50/30 transition-colors">
                <div className="w-[160px] md:w-[220px] shrink-0 p-5 flex items-center text-[15px] md:text-[18px] font-semibold text-gray-900 bg-gray-50/50 border-r-2 border-zinc-300">
                  Price
                </div>
                {[0, 1, 2, 3].map((index) => {
                  const item = compareItems[index];
                  return (
                    <div
                      key={`price-${index}`}
                      className="flex-1 w-[250px] md:w-[200px] shrink-0 p-5 flex items-center gap-2 justify-center"
                    >
                      {item ? (
                        <>
                          {item.oldPrice && (
                            <span className="text-[14px] text-gray-400 line-through">
                              {item.oldPrice}
                            </span>
                          )}
                          <span className="text-[17px] font-medium text-black">
                            {item.price}
                          </span>
                        </>
                      ) : (
                        <div className="text-gray-400 justify-center w-full flex items-center text-[18px] font-bold">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Color Row */}
              <div className="flex border-b-2 border-zinc-300 bg-white hover:bg-gray-50/30 transition-colors">
                <div className="w-[160px] md:w-[220px] shrink-0 p-5 flex items-center text-[15px] md:text-[18px] font-semibold text-gray-900 bg-gray-50/50 border-r-2 border-zinc-300">
                  Color
                </div>
                {[0, 1, 2, 3].map((index) => {
                  const item = compareItems[index];
                  return (
                    <div
                      key={`color-${index}`}
                      className="flex-1 w-[240px] md:w-[280px] shrink-0 p-5 flex items-center gap-3 justify-center"
                    >
                      {item ? (
                        <>
                          <span className="text-[15px] text-gray-600 capitalize font-medium">
                            {item.selectedColor || "Black"}
                          </span>
                        </>
                      ) : (
                        <div className="text-gray-400 justify-center w-full flex items-center text-[18px] font-bold">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Material Row */}
              <div className="flex border-b-2 border-zinc-300 bg-white hover:bg-gray-50/30 transition-colors">
                <div className="w-[160px] md:w-[220px] shrink-0 p-5 flex items-center text-[15px] md:text-[18px] font-semibold text-gray-900 bg-gray-50/50 border-r-2 border-zinc-300">
                  Material
                </div>
                {[0, 1, 2, 3].map((index) => {
                  const item = compareItems[index];
                  return (
                    <div
                      key={`material-${index}`}
                      className="flex-1 w-[240px] md:w-[280px] shrink-0 p-5 flex items-center justify-center"
                    >
                      {item ? (
                        <span className="px-3 py-1 bg-gray-100 text-black text-[15px] font-medium rounded capitalize">
                          {item.selectedMaterial || "Standard Wood"}
                        </span>
                      ) : (
                        <div className="text-gray-400 justify-center w-full flex items-center text-[18px] font-bold">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Availability Row */}
              <div className="flex border-b-2 border-zinc-300 bg-white hover:bg-gray-50/30 transition-colors">
                <div className="w-[160px] md:w-[220px] shrink-0 p-5 flex items-center text-[15px] md:text-[18px] font-semibold text-gray-900 bg-gray-50/50 border-r-2 border-zinc-300">
                  Availability
                </div>
                {[0, 1, 2, 3].map((index) => {
                  const item = compareItems[index];
                  return (
                    <div
                      key={`stock-${index}`}
                      className="flex-1 w-[240px] md:w-[280px] shrink-0 p-5 flex items-center justify-center"
                    >
                      {item ? (
                        <span
                          className={`text-[16px] font-bold ${
                            item.inStock ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      ) : (
                        <div className="text-gray-400 justify-center w-full flex items-center text-[18px] font-bold">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Row */}
              <div className="flex bg-white">
                <div className="w-[160px] md:w-[220px] shrink-0 p-5 flex items-center text-[15px] md:text-[16px] font-semibold text-gray-900 bg-gray-50/50 border-r-2 border-zinc-300">
                  Action
                </div>
                {[0, 1, 2, 3].map((index) => {
                  const item = compareItems[index];
                  return (
                    <div
                      key={`action-${index}`}
                      className="flex-1 w-[240px] md:w-[280px] shrink-0 p-5 flex items-center justify-center"
                    >
                      {item ? (
                        <div className="w-full flex items-center gap-3 sm:w-max">
                          <button
                            onClick={() => moveToCart(item)}
                            disabled={!item.inStock}
                            className={`flex items-center justify-center gap-3 px-6 py-2 rounded-md font-medium text-[14.5px] transition-all duration-300 w-full sm:w-max ${
                              item.inStock
                                ? "shadow-md border-2 border-black bg-[#111] text-white font-medium text-[15px] rounded-lg hover:bg-white hover:text-black transition-colors duration-500"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <FaShoppingCart size={14} /> Add To Cart
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewProduct(item);
                            }}
                            className="absoluteflex items-center text-[20px] text-gray-400 hover:text-red-500 transition-colors z-10 hover:bg-zinc-200 rounded-full w-8 h-8 flex justify-center"
                          >
                            <FaRegEye />
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 justify-center w-full flex items-center text-[18px] font-bold">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

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

      {/* --- Quick View Modal Component --- */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Compare;

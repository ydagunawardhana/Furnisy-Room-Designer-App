import React, { useEffect, useState } from "react";
import { FiHeart, FiShare, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { MdDarkMode, MdOutlineShoppingCart } from "react-icons/md";
import { FaSun, FaTimes } from "react-icons/fa";
import ModelViewer from "./ModelViewer";
import { useCart } from "../context/CartContext";

const Product3DModal = ({ isOpen, onClose, product }) => {
  const getColorName = (hexCode) => {
    const code = hexCode?.toLowerCase();
    const colorNames = {
      "#ff7f50": "Coral",
      "#d1d5db": "Light Gray",
      "#deb887": "Burlywood",
      "#8b4513": "Saddle Brown",
      "#1a1a19": "Black",
      "#e5e7eb": "Off White",
      "#a0522d": "Sienna Brown",
      "#9ca3af": "Gray",
      "#f4a460": "Sandy Orange",
      "#ffdead": "Navajo White",
      "#faebd7": "Antique White",
      "#000000": "Black",
    };
    return colorNames[code] || hexCode;
  };

  const [isRoomPlannerOpen, setIsRoomPlannerOpen] = useState(true);
  const [isAROpen, setIsAROpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { addToCart } = useCart();

  const colors = product?.colors || [
    "#E5E7EB",
    "#d1d5db",
    "#deb887",
    "#8b4513",
    "#1a1a19",
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);

      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !product) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all duration-500 ${
        animate
          ? "bg-black/50 backdrop-blur-sm opacity-100 pointer-events-auto"
          : "bg-transparent opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white w-full max-w-[1500px] h-[90vh] md:h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-md transition-all duration-500 
        ease-out transform ${
          animate
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-95"
        }`}
      >
        {/* 3D Viewer Section */}
        <div className="flex-1 bg-[#f1f1f1] relative flex flex-col overflow-hidden">
          {/* Top Right Menu (Save & Share) */}
          <div className="absolute top-5 right-6 z-20 flex flex-col items-end">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-zinc-200 transition-colors border-2 border-zinc-400"
            >
              <BsThreeDots size={20} className="text-black" />
            </button>

            {/* Dropdown */}
            {isMenuOpen && (
              <div className="mt-1 bg-white rounded-xl shadow-md p-1 flex flex-col w-[240px] border-2 border-zinc-300 animate-fade-in">
                <button className="flex items-center gap-3 text-[13px] font-semibold text-black hover:bg-zinc-200 hover:text-black px-3 py-2 rounded-md transition-colors">
                  <FiHeart size={18} /> Save to favorites
                </button>
                <button className="flex items-center gap-3 text-[13px] font-semibold text-black hover:bg-zinc-200 hover:text-black px-3 py-2 rounded-md transition-colors">
                  <FiShare size={18} /> Share this configuration
                </button>
              </div>
            )}
          </div>

          {/* 3D Model (ModelViewer) */}
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <ModelViewer
              modelPath={
                product.modelPath || "/models/Modern Tolik Chair_texture.glb"
              }
              isDarkMode={isDarkMode}
              selectedColor={selectedColor}
            />
          </div>

          {/* Bottom Left Darkmode Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute bottom-5 left-6 w-11 h-11 bg-white rounded-full hover:bg-zinc-200  shadow-md flex items-center justify-center hover:bg-gray-50 
            transition-colors border-2 border-zinc-400 z-20
            ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-black hover:bg-gray-700"
                : "bg-white border-gray-100 text-gray-800 hover:bg-gray-50"
            }`}
          >
            {isDarkMode ? <FaSun size={23} /> : <MdDarkMode size={24} />}
          </button>
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-[420px] bg-white flex flex-col h-full shadow-md z-10">
          {/* Header & Close Button */}
          <div className="p-6 pb-4  flex justify-between items-start">
            <h2 className="text-[21px] font-bold text-gray-900 leading-tight pr-4 tracking-wide uppercase mt-1">
              {product.name}
            </h2>
            <button
              onClick={() => {
                if (onClose) onClose();
              }}
              className="text-black hover:text-black hover:bg-zinc-200 transition-colors rounded-full"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Color Selection */}
          <div className="px-6 pb-5 mt-2 border-b-2 border-zinc-300">
            <p className="text-[15px] font-semibold text-gray-800 mb-3">
              Color
            </p>
            <div className="flex gap-4">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-[34px] h-[34px] rounded-full transition-all duration-300 relative ${
                    selectedColor === color
                      ? "scale-110 shadow-md"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <span className="absolute inset-[-4px] border-2 border-black rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Middle Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {/* Accordion 1: Preview in AR */}
            <div
              className={`border-2 rounded-lg p-5 transition-colors ${
                isAROpen
                  ? "border-zinc-300 bg-white shadow-md"
                  : "border-zinc-300 bg-[#fdfdfd] hover:border-gray-300 cursor-pointer shadow-md"
              }`}
            >
              <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => {
                  setIsAROpen(!isAROpen);
                  if (!isAROpen) setIsRoomPlannerOpen(false);
                }}
              >
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                    Preview in AR
                  </h3>

                  {isAROpen ? (
                    <p className="text-[13px] text-black leading-relaxed mt-2 pr-4 font-light">
                      Point your phone's camera at the QR code to view this item
                      in your space.
                    </p>
                  ) : (
                    <p className="text-[13px] text-black leading-snug font-light">
                      Scan this QR code to view in your home
                    </p>
                  )}
                </div>

                {isAROpen ? (
                  <FiChevronUp size={28} className="text-black" />
                ) : (
                  <FiChevronDown size={21} className="text-black mt-1" />
                )}
              </div>

              {isAROpen && (
                <div className="mt-5 flex flex-col items-center justify-center pt-5 border-t border-zinc-200 animate-fade-in">
                  <div className="p-3 bg-white border-2 border-zinc-200 rounded-xl shadow-sm mb-3 hover:border-black transition-colors">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://furnisy.com/ar-view/modern-tolik-chair"
                      alt="AR QR Code"
                      className="w-[130px] h-[130px] object-contain"
                    />
                  </div>
                  <button className="text-[13px] font-bold text-black underline hover:text-gray-600 transition-colors">
                    Don't have a phone right now?
                  </button>
                </div>
              )}
            </div>
            {/* Accordion 2: Room Planner */}
            <div
              className={`border rounded-lg p-5 transition-colors ${
                isRoomPlannerOpen
                  ? "border-2 border-zinc-300 bg-white shadow-md"
                  : "border-2 border-zinc-300 bg-[#fdfdfd] hover:border-gray-300 cursor-pointer shadow-md"
              }`}
            >
              <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => {
                  setIsRoomPlannerOpen(!isRoomPlannerOpen);
                  if (!isRoomPlannerOpen) setIsAROpen(false);
                }}
              >
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                    Try Modern Design & Ideas in a room
                  </h3>
                  {isRoomPlannerOpen ? (
                    <p className="text-[13px] text-black leading-relaxed mt-2 pr-4 font-light">
                      Get ideas in showrooms, design your space, and plan a room
                      in 3D.
                    </p>
                  ) : (
                    <p className="text-[13px] text-black leading-relaxed mt-2 pr-4 font-light">
                      Get ideas in showrooms, design your space, and plan a room
                      in 3D.
                    </p>
                  )}
                </div>
                {isRoomPlannerOpen ? (
                  <FiChevronUp size={28} className="text-black " />
                ) : (
                  <FiChevronDown size={28} className="text-black" />
                )}
              </div>

              {/* Button inside Accordion */}
              {isRoomPlannerOpen && (
                <button
                  className="mt-6 px-5 py-2 border-2 border-zinc-300 rounded-full text-[14px] font-semibold text-black hover:bg-black hover:text-white 
                transition-all"
                >
                  Launch 3D Room Planner
                </button>
              )}
            </div>
          </div>

          {/* Sticky Bottom Footer (Price & Add to Cart) */}
          <div className="p-6 border-t-2 border-zinc-300 flex justify-between items-center bg-white">
            <div className="text-[27px] font-bold text-black tracking-tight">
              {product.price || "$99.00"}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => {
                const colorName = getColorName(selectedColor);
                addToCart(product, 1, "M", colorName);

                alert(`${product.name} added to Cart!`);
              }}
              className="bg-black hover:bg-white hover:text-black text-white px-7 py-3.5 rounded-full font-bold text-[14px] transition-transform active:scale-95 
            flex items-center gap-2 shadow-md border-2 border-zinc-200"
            >
              <MdOutlineShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product3DModal;

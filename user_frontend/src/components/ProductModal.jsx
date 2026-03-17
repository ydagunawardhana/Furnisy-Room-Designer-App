import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaStar,
  FaRegHeart,
  FaExchangeAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaCube,
  FaHeart,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { TiArrowShuffle } from "react-icons/ti";
import Product3DModal from "./Product3DModal";
import toast, { ErrorIcon } from "react-hot-toast";

const ProductModal = ({ product, onClose, onOpen3D }) => {
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

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [customMaterial, setCustomMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else {
      setSelectedColor("#f1f1f1");
    }
    if (product && product.materials && product.materials.length > 0) {
      setSelectedMaterial(product.materials[0]);
    } else {
      setSelectedMaterial("Standard Wood");
    }
  }, [product]);

  const productColors = product?.colors || ["#1a1a19", "#d1d5db", "#deb887"];
  const productMaterials = product?.materials || ["Teak", "Oak", "Mahogany"];

  const { toggleWishlist, wishlistItems } = useWishlist();
  const isInWishlist = wishlistItems.some((item) => item?.id == product?.id);

  const { toggleCompare, compareItems } = useCompare();
  const isInCompare = compareItems.some((item) => item?.id == product?.id);

  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
      style={{ animation: "fadeInBg 0.3s ease-out" }}
    >
      {/* --- Premium Animation --- */}
      <style>{`
        @keyframes fadeInBg {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes popUpBox {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="relative w-full max-w-[1100px] max-h-[100vh] bg-white rounded-[15px] shadow-2xl overflow-y-auto flex flex-col md:flex-row"
        style={{ animation: "popUpBox 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-zinc-300 rounded-full text-gray-600 transition-colors"
        >
          <FaTimes size={18} />
        </button>

        <div className="relative w-full md:w-1/2 bg-[#f8f9fa] p-12 flex flex-col items-center justify-center">
          <button
            onClick={() => {
              setIs3DModalOpen(true);
              if (onOpen3D) onOpen3D();
            }}
            className="absolute top-16 right-16 z-10 w-[42px] h-[42px] bg-white hover:bg-zinc-300  rounded-[10px] shadow-md flex items-center justify-center text-gray-700
             hover:text-black hover:scale-105 transition-all cursor-pointer border-2"
            title="View in 3D"
          >
            <FaCube size={20} />
          </button>

          {/* Image */}
          <img
            src={product.img}
            alt={product.name}
            className="w-full max-w-[450px] h-auto object-contain mix-blend-multiply cursor-pointer hover:scale-105 transition-transform duration-300 rounded-md"
          />
          <button
            onClick={() => {
              onClose();
              setTimeout(() => {
                navigate(`/product/${product.id}`);
              }, 300);
            }}
            className="w-full text-[15px] font-medium py-3 hover:bg-black transition-colors duration-400 cursor-pointer rounded-md mt-3
           text-white  bg-[#1a1a19] hover:bg-transparent hover:text-[#1a1a19] border-2 border-[#1a1a19]"
          >
            View Details
          </button>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-[30px] md:text-[32px] font-medium text-gray-900 mb-2 capitalize leading-tight">
            {product.name}
          </h2>

          <div className="flex items-center gap-7 mb-4">
            <div className="flex text-[#f7c603de] text-[15px]">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar className="text-gray-300" />
              <span className="text-gray-500 ml-3">(3)</span>
            </div>
            <div className="text-[16px] text-gray-500">
              Stock:{" "}
              <span className="text-green-600 font-medium">In stock</span>
            </div>
          </div>

          <div className="text-[26px] font-medium text-gray-900 mb-6">
            {product.price}
          </div>

          <p className="text-[15px] text-gray-400 leading-relaxed mb-8 font-light">
            The {product.name} features sleek, clean lines and a refined
            silhouette that makes it a standout piece in any room.
          </p>

          {/* Color Options */}
          <div className="mb-6">
            <span className="block text-[18px] font-medium text-gray-900 mb-3">
              Color:
              <span className="text-gray-500 text-[15px] font-semibold ml-2">
                {getColorName(selectedColor)}
              </span>
            </span>
            <div className="flex gap-2.5">
              {productColors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-200 
                    ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-black scale-110"
                        : ""
                    }`}
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>

          {/* Material Options */}
          <div className="mb-6">
            <span className="block text-[18px] font-medium text-gray-900 mb-3">
              Material:{" "}
              <span className="text-gray-500 text-[15px] ml-2 font-semibold">
                {selectedMaterial === "Other"
                  ? customMaterial || "Custom Material"
                  : selectedMaterial}
              </span>
            </span>
            <div className="flex flex-wrap gap-3">
              {[...productMaterials, "Other"].map((mat, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedMaterial(mat);
                    if (mat !== "Other") setCustomMaterial("");
                  }}
                  className={`px-5 py-2 border-[1.5px] border-dashed border-zinc-500 rounded-[8px] text-[14px] font-medium transition-all duration-200 
                    ${
                      selectedMaterial === mat
                        ? "border-black bg-black text-white shadow-md"
                        : "border-gray-300 text-gray-700 hover:border-black hover:text-black"
                    }`}
                >
                  {mat}
                </button>
              ))}
            </div>

            <div
              className={`w-full md:w-[78%] overflow-hidden transition-all duration-700 ease-in-out
                ${
                  selectedMaterial === "Other"
                    ? "max-h-[150px] opacity-100 mt-2"
                    : "max-h-0 opacity-0 mt-0"
                }
              `}
            >
              <input
                type="text"
                placeholder="Enter your preferred material (e.g. Pine Wood)"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                className="w-full border-2 border-zinc-300 rounded-[8px] py-2 px-6 text-[14px] text-gray-800 mt-2
                  focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 transition-colors"
              />
              <p className="text-[12px] text-gray-400 mt-1.5">
                * Custom materials may affect the final price and delivery time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-gray-200 pb-8">
            {/* Quantity Selector */}
            <div className="flex items-center border-2 border-zinc-300 rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-[18px] font-semibold"
              >
                -
              </button>

              <input
                type="text"
                value={quantity}
                readOnly
                className="w-10 text-center text-[16px] outline-none font-medium text-gray-900 bg-transparent"
              />

              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-[18px] font-semibold"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                if (
                  selectedMaterial === "Other" &&
                  customMaterial.trim() === ""
                ) {
                  toast.custom(
                    (t) => (
                      <div
                        className={`${
                          t.visible ? "toast-enter" : "toast-exit"
                        } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                      >
                        <ErrorIcon size={20} className="text-red-400" />
                        <span className="text-[14px] font-medium">
                          Please enter your preferred custom material!
                        </span>
                      </div>
                    ),
                    { position: "top-right", duration: 2000 }
                  );
                  return;
                }

                const finalMaterial =
                  selectedMaterial === "Other"
                    ? `${customMaterial}`
                    : selectedMaterial;
                const colorName = getColorName
                  ? getColorName(selectedColor)
                  : selectedColor;

                addToCart(product, quantity, finalMaterial, colorName);
              }}
              className="flex-grow md:w-40 text-white  bg-[#1a1a19] hover:bg-transparent hover:text-[#1a1a19] border-2 border-[#1a1a19] 
            px-6 py-2.5 rounded-md hover:bg-gray-800 transition-colors duration-400 text-[15px] font-medium"
            >
              Add To Cart
            </button>
          </div>

          {/* Wishlist & Compare*/}
          <div className="flex items-center gap-8 mb-2 mt-2 text-[16px] text-gray-500 font-medium">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const colorName = getColorName
                  ? getColorName(selectedColor)
                  : selectedColor;
                const finalMaterial =
                  selectedMaterial === "Other"
                    ? `: ${customMaterial}`
                    : selectedMaterial;

                const productWithVariants = {
                  ...product,
                  selectedColor: colorName,
                  selectedMaterial: finalMaterial,
                };
                toggleWishlist(productWithVariants);
              }}
              className={`flex items-center gap-2 hover:text-zinc-500 transition-colors cursor-pointer ${
                isInWishlist ? "text-red-500" : ""
              }`}
            >
              {isInWishlist ? (
                <FaHeart className="text-[20px]" />
              ) : (
                <FaRegHeart className="text-[20px]" />
              )}
              {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const colorName = getColorName
                  ? getColorName(selectedColor)
                  : selectedColor;
                const finalMaterial =
                  selectedMaterial === "Other"
                    ? `: ${customMaterial}`
                    : selectedMaterial;

                const productWithVariants = {
                  ...product,
                  selectedColor: colorName,
                  selectedMaterial: finalMaterial,
                };
                toggleCompare(productWithVariants);
              }}
              className={`flex items-center gap-2 hover:text-zinc-500 transition-colors cursor-pointer ${
                isInCompare ? "text-red-500" : ""
              }`}
            >
              {isInCompare ? (
                <TiArrowShuffle className="text-red-500 w-6 h-6 font-medium" />
              ) : (
                <FaExchangeAlt />
              )}
              {isInCompare ? "Remove from compare" : "Add to compare"}
            </button>
          </div>

          <div className="flex flex-col gap-3.5 text-[15px] text-gray-600  border-gray-200 pt-6">
            {/* Social Share Icons */}
            <div className="flex items-center gap-3 ">
              <span className="text-gray-900 font-light">Share:</span>
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  className="w-[30px] h-[30px] rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-600
                   hover:border-black hover:text-black transition-all"
                >
                  <FaFacebookF size={12} />
                </a>
                <a
                  href="#"
                  className="w-[30px] h-[30px] rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-600
                   hover:border-black hover:text-black transition-all"
                >
                  <FaTwitter size={12} />
                </a>
                <a
                  href="#"
                  className="w-[30px] h-[30px] rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-600
                   hover:border-black hover:text-black transition-all"
                >
                  <FaLinkedinIn size={12} />
                </a>
                <a
                  href="#"
                  className="w-[30px] h-[30px] rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-600
                   hover:border-black hover:text-black transition-all"
                >
                  <FaInstagram size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product 3D Modal Popup */}
      <Product3DModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductModal;

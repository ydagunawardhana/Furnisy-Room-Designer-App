import React, { useRef, useState } from "react";
import {
  FaShoppingCart,
  FaRegHeart,
  FaExchangeAlt,
  FaRegEye,
  FaHeart,
} from "react-icons/fa";
import ProductModal from "./ProductModal";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { TiArrowShuffle } from "react-icons/ti";
import { useCompare } from "../context/CompareContext";
import Product3DModal from "./Product3DModal";

const RelatedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleCompare, compareItems } = useCompare();

  const { toggleWishlist, wishlistItems } = useWishlist();

  const relatedProducts = useRef(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [view3DProduct, setView3DProduct] = useState(null);

  const scrollTCLeft = () => {
    if (relatedProducts.current) {
      relatedProducts.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollTCRight = () => {
    if (relatedProducts.current) {
      relatedProducts.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-16 px-8 md:px-16 lg:px-52 bg-[#f2f2f2] font-inter">
      {/* --- Related Products Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-gray-200 gap-4">
        <div>
          <h2 className="text-3xl md:text-[32px] font-medium text-gray-800 mb-2">
            Related Products
          </h2>
          <p className="text-gray-700 text-[16.5px]">
            Explore the best of Furnisy Related Products.
          </p>
        </div>
      </div>

      {/* Products Slider Area */}
      <div className="relative w-full group/slider">
        <button
          onClick={scrollTCLeft}
          className="absolute left-0 top-[40%] -translate-y-1/2 -ml-5 z-10 bg-white shadow-md hover:bg-black hover:text-white rounded-full 
          p-3 text-gray-600 transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>

        <button
          onClick={scrollTCRight}
          className="absolute right-0 top-[40%] -translate-y-1/2 -mr-5 z-10 bg-white shadow-md hover:bg-black hover:text-white rounded-full 
          p-3 text-gray-600 transition-all opacity-0 group-hover/slider:opacity-100 focus:outline-none hidden md:block"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>

        <div
          ref={relatedProducts}
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {[
            {
              id: 1,
              name: "Modern Dark Wood Chair",
              price: "$180.00",
              oldPrice: "$300.00",
              badge: "-40%",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Ftop-collections%2Fimg-1.webp&w=1920&q=75",
              modelPath: "/models/Modern Dark Wood Chair_texture.glb",
              colors: ["#9CA3AF", "#A0522D", "#1a1a19", "#FFDEAD"],
            },
            {
              id: 5,
              name: "Black Storage Platform Bed",
              price: "$180.00",
              oldPrice: null,
              badge: null,
              img: "https://www.ikea.com/us/en/images/products/brimnes-bed-frame-with-storage-headboard-black-luroey__1102026_pe866850_s5.jpg?f=xl",
              modelPath: "/models/Black Storage Platform Bed_texture.glb",
              colors: ["#D1D5DB", "#E5E7EB", "#000000", "#F4A460"],
            },
            {
              id: 2,
              name: "Modern Tolik Chair",
              price: "$180.00",
              oldPrice: "$300.00",
              badge: "-40%",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Ftop-collections%2Fimg-3.webp&w=1920&q=75",
              modelPath: "/models/Modern Tolik Chair_texture.glb",
              colors: ["#D1D5DB", "#E5E7EB", "#A0522D", "#000000"],
            },
            {
              id: 6,
              name: "Ergonomic Cabinet",
              price: "$180.00",
              oldPrice: null,
              badge: null,
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Ftop-collections%2Fimg-4.webp&w=1920&q=75",
              modelPath: "/models/Ergonomic Cabinet_texture.glb",
              colors: ["#D1D5DB", "#E5E7EB", "#000000", "#F4A460", "#9CA3AF"],
            },
            {
              id: 3,
              name: "Modern Accent Chair",
              price: "$180.00",
              oldPrice: "$199.00",
              badge: "-40%",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Ffeatured-products%2Fimg-6.webp&w=1920&q=75",
              modelPath: "/models/Modern Accent Chair_texture.glb",
              colors: ["#D1D5DB", "#E5E7EB", "#000000", "#FFDEAD"],
            },
          ].map((product) => {
            const isInWishlist = wishlistItems.some(
              (item) => item.id == product.id
            );

            const isInCompare = compareItems.some(
              (item) => item.id == product.id
            );
            return (
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                key={product.id}
                className="flex-none w-[260px] lg:w-[300px] snap-start flex flex-col group/card cursor-pointer bg-[#f1f1f1]  rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-full aspect-[4/5] bg-[#f8f8f8] rounded-lg overflow-hidden mb-5">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />

                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-black text-white text-[13px] font-medium px-3 py-1 rounded">
                      {product.badge}
                    </div>
                  )}

                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-500 
                translate-y-4 group-hover/card:translate-y-0"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        addToCart(product, 1, "Standard Wood", "Coral");

                        alert("Item added to Cart!");
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      <FaShoppingCart />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      {isInWishlist ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      {isInCompare ? (
                        <TiArrowShuffle className="text-red-500 w-6 h-6 font-medium" />
                      ) : (
                        <FaExchangeAlt />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setView3DProduct(null);
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white shadow-md transition-colors"
                    >
                      <FaRegEye />
                    </button>
                  </div>
                </div>

                <div className="px-1 pb-2">
                  <h3 className="text-[16px] text-gray-900 font-medium mb-1 capitalize">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[15.5px]">
                    {product.oldPrice && (
                      <span className="text-gray-400 line-through">
                        {product.oldPrice}
                      </span>
                    )}
                    <span className="text-gray-700 font-light">
                      {product.price}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Quick View Modal Component --- */}
      {quickViewProduct && (
        <ProductModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpen3D={() => {
            setView3DProduct(quickViewProduct);
            setQuickViewProduct(null);
          }}
        />
      )}

      {/* --- 3D View Modal --- */}
      {view3DProduct && (
        <Product3DModal
          product={view3DProduct}
          isOpen={true}
          onClose={() => setView3DProduct(null)}
        />
      )}
    </div>
  );
};

export default RelatedProducts;

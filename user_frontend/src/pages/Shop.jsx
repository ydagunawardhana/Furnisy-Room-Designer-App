import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HeaderImage from "../assets/header_img.png";
import {
  FaSearch,
  FaTh,
  FaList,
  FaChevronDown,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaRegEye,
  FaRegHeart,
  FaExchangeAlt,
  FaInstagram,
  FaHeart,
} from "react-icons/fa";
import Footer from "../components/Footer";
import ProductModal from "../components/ProductModal";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { TiArrowShuffle } from "react-icons/ti";
import Product3DModal from "../components/Product3DModal";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const productSectionRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("Default sorting");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const [appliedPriceRange, setAppliedPriceRange] = useState({
    min: null,
    max: null,
  });

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [view3DProduct, setView3DProduct] = useState(null);

  const { toggleWishlist, wishlistItems } = useWishlist();
  const { toggleCompare, compareItems } = useCompare();

  const [productsList, setProductsList] = useState([]);

  // Firebase
  useEffect(() => {
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetchedProducts = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setProductsList(fetchedProducts);
    });

    return () => unsubscribe();
  }, []);

  // Sorting Options
  const sortedProducts = useMemo(() => {
    let filtered = productsList.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const catString = Array.isArray(product.category)
        ? product.category.join(" ").toLowerCase()
        : (product.category || "").toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        catString.includes(selectedCategory.toLowerCase());

      // Price Range
      const productPrice = parseFloat(product.price.replace("$", ""));
      let matchesPrice = true;

      if (
        appliedPriceRange.min !== null &&
        productPrice < appliedPriceRange.min
      ) {
        matchesPrice = false;
      }
      if (
        appliedPriceRange.max !== null &&
        productPrice > appliedPriceRange.max
      ) {
        matchesPrice = false;
      }

      const matchesColor =
        !selectedColor ||
        (product.colors && product.colors.includes(selectedColor));

      return matchesSearch && matchesCategory && matchesPrice && matchesColor;
    });

    switch (sortOption) {
      case "Price: Low to High":
        filtered.sort((a, b) => {
          const priceA = parseFloat(
            String(a.price || "0").replace(/[^0-9.-]+/g, "")
          );
          const priceB = parseFloat(
            String(b.price || "0").replace(/[^0-9.-]+/g, "")
          );
          return priceA - priceB;
        });
        break;
      case "Price: High to Low":
        filtered.sort((a, b) => {
          const priceA = parseFloat(
            String(a.price || "0").replace(/[^0-9.-]+/g, "")
          );
          const priceB = parseFloat(
            String(b.price || "0").replace(/[^0-9.-]+/g, "")
          );
          return priceB - priceA;
        });
        break;
      case "Newest Arrivals":
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      default:
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
    }
    return filtered;
  }, [
    sortOption,
    searchQuery,
    selectedCategory,
    appliedPriceRange,
    selectedColor,
    productsList,
  ]);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null) {
      setSearchQuery(urlSearch);
      setTimeout(() => {
        if (productSectionRef.current) {
          productSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 500);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white font-inter w-full">
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
      {/* --- Page Banner Section --- */}
      <div
        className="w-full h-[250px] relative flex flex-col items-center justify-center text-white"
        style={{
          backgroundImage: `url(${HeaderImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 flex flex-col items-center gap-3 mt-4">
          <h1 className="text-3xl md:text-[36.4px] font-light capitalize tracking-wide">
            Shop
          </h1>

          <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
            <Link
              to="/"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <span className="text-white">Shop</span>
          </div>
        </div>
      </div>
      {/* --- 1. Top Categories Row --- */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-8 pt-12 pb-8 overflow-x-auto hide-scrollbar">
        <div className="flex items-center justify-start lg:justify-center gap-8 md:gap-12 min-w-max">
          {[
            {
              name: "All Furniture",
              filterName: "All",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fcategory%2Fimg-1.webp&w=256&q=75",
            },
            {
              name: "Decor",
              filterName: "Decoration",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fcategory%2Fimg-3.webp&w=256&q=75",
            },
            {
              name: "Office",
              filterName: "Office",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fcategory%2Fimg-2.webp&w=256&q=75",
            },
            {
              name: "Bed Room",
              filterName: "Bed Room",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fcategory%2Fimg-4.webp&w=256&q=75",
            },
            {
              name: "Living Room",
              filterName: "Living Room",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fcategory%2Fimg-5.webp&w=256&q=75",
            },
            {
              name: "Accessories",
              filterName: "Accessories",
              img: "https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fcategory%2Fimg-6.webp&w=256&q=75",
            },
          ].map((cat, index) => {
            const count =
              cat.filterName === "All"
                ? productsList.length
                : productsList.filter(
                    (p) => p.category && p.category.includes(cat.filterName)
                  ).length;

            return (
              <div
                key={index}
                onClick={() => setSelectedCategory(cat.filterName)}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div
                  className={
                    `w-24 h-24 md:w-[140px] md:h-[140px] rounded-full overflow-hidden bg-gray-100 transition-all ` +
                    (selectedCategory === cat.filterName
                      ? "ring-2 ring-zinc-500 ring-offset-2 shadow-lg scale-105 group-hover:shadow-md"
                      : "shadow-sm group-hover:shadow-md")
                  }
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className={
                      "w-full h-full object-cover transition-transform duration-500 " +
                      (selectedCategory === cat.filterName
                        ? "scale-110"
                        : "group-hover:scale-110")
                    }
                  />
                </div>
                <div className="text-center">
                  <h3
                    className={
                      `text-[16px] md:text-[19px] capitalize relative group mb-1 transition-colors ` +
                      (selectedCategory === cat.filterName
                        ? "text-black font-bold"
                        : "font-medium text-gray-900 group-hover:text-black")
                    }
                  >
                    {cat.name}
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
                  </h3>
                  <p className="text-[13px] md:text-[15px] text-gray-500 font-light">
                    {count} Products
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* --- 2. Main Content Area (Sidebar + Grid) --- */}
      <div ref={productSectionRef} className="container mx-auto px-4 py-8 ">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-8 mt-4 flex flex-col lg:flex-row gap-14">
          {/* --- Left Sidebar (Filters) --- */}
          <div className="sticky w-full lg:w-[23%] flex flex-col gap-8 mt-2">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-zinc-300 rounded-[8px] py-3 pl-4 pr-10 text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black-200"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Categories Filter */}
            <div className="border-b-2 border-zinc-400 pb-6">
              <h3 className="text-[21px] font-medium uppercase text-gray-900 mb-5 tracking-wide">
                Categories
              </h3>
              <ul className="flex flex-col gap-3 text-[16px] text-black font-light">
                {[
                  "All",
                  "Furniture",
                  "Living Room",
                  "Decoration",
                  "Office",
                  "Accessories",
                ].map((cat) => {
                  const count =
                    cat === "All"
                      ? productsList.length
                      : productsList.filter(
                          (p) => p.category && p.category.includes(cat)
                        ).length;

                  return (
                    <li
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`cursor-pointer transition-colors relative group flex justify-between
                      ${
                        selectedCategory === cat
                          ? "text-black font-semibold"
                          : "hover:text-black"
                      }
                    `}
                    >
                      <span>
                        {cat} ({count})
                      </span>
                      <span
                        className={`absolute left-0 bottom-0 w-full h-[1px] bg-black transition-transform duration-300 origin-center
                        ${
                          selectedCategory === cat
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }
                      `}
                      ></span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="border-b-2 border-zinc-400 pb-8">
              <h3 className="text-[21px] font-medium uppercase text-gray-900 mb-6 tracking-wide">
                Filter by Price ($)
              </h3>

              {/* Min & Max Input  */}
              <div className="flex items-center gap-3 mb-5">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E")
                      e.preventDefault();
                  }}
                  className="w-full border-2 border-zinc-300 rounded-[5px] py-2 px-2 text-center text-[15.5px] text-gray-800 focus:outline-none 
                focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
                <span className="text-gray-500 font-medium">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E")
                      e.preventDefault();
                  }}
                  className="w-full border-2 border-zinc-300 rounded-[5px] py-2 px-2 text-center text-[15.5px] text-gray-800 focus:outline-none
                 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>

              <button
                onClick={() => {
                  setAppliedPriceRange({
                    min: minPriceInput ? parseFloat(minPriceInput) : null,
                    max: maxPriceInput ? parseFloat(maxPriceInput) : null,
                  });
                }}
                className="w-full  text-white px-6 py-1 rounded-[10px] bg-[#1a1a19] hover:bg-transparent
            hover:text-[#1a1a19] border-2 border-[#1a1a19] text-[15px] font-medium  hover:bg-gray-800 transition-all 
            active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Filter
              </button>
            </div>

            {/* Color Filter */}
            <div className="border-b-2 border-zinc-400 pb-6">
              <h3 className="text-[21px] font-medium uppercase text-gray-900 mb-5 tracking-wide">
                Filter by Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  "#D1D5DB",
                  "#E5E7EB",
                  "#A0522D",
                  "#9CA3AF",
                  "#F4A460",
                  "#FFDEAD",
                  "#000000",
                ].map((color, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setSelectedColor((prevColor) =>
                        prevColor === color ? null : color
                      )
                    }
                    className={`w-8 h-8 rounded-full border border-gray-200 cursor-pointer shadow-sm transition-all duration-200 hover:scale-110 
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

            {/* Tags Section */}
            <div className="pt-1">
              <h3 className="text-[21px] font-medium uppercase text-gray-900 mb-3 tracking-wide">
                Tags
              </h3>

              {/* Tags ටික Flex-wrap දාලා හැදුවා */}
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {[
                  "Furniture",
                  "Bed Room",
                  "Living Room",
                  "Office",
                  "Decoration",
                  "Lighting",
                  "Accessories",
                ].map((tag, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-[15px] text-gray-600 underline underline-offset-4 decoration-gray-300 hover:text-black
                   hover:bg-gray-800 transition-colors capitalize cursor-pointer"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Content (Toolbar + Product Grid) --- */}
          <div className="w-full lg:w-[75%] flex flex-col">
            {/* Toolbar (Grid view & Sorting) */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4 bg-white p-3 rounded-[10px] shadow-md border-gray-100">
              <div className="flex items-center gap-5 sm:gap-4">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "text-black"
                      : "text-gray-400 hover:text-zinc-500 shadow-md"
                  }`}
                >
                  <FaTh size={20} />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "text-black"
                      : "text-gray-400 hover:text-zinc-500 shadow-md"
                  }`}
                >
                  <FaList size={22} />
                </button>
              </div>

              {/* Showing Results Text */}
              <p className="text-[14px] sm:text-[14px] text-gray-500 font-medium whitespace-nowrap">
                Showing 1 – {sortedProducts.length} of {productsList.length}{" "}
                results
              </p>

              {/* --- Sorting Dropdown --- */}
              <div className="relative">
                <div
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-transparent py-1 px-2 cursor-pointer select-none group"
                >
                  <span className="text-[15px] text-gray-800 font-medium group-hover:text-black transition-colors">
                    {sortOption}
                  </span>

                  <FaChevronDown
                    className={`text-[12px] text-gray-500 transition-transform duration-300 ${
                      isSortOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown Menu */}
                {isSortOpen && (
                  <div
                    className="absolute right-0 top-[120%] w-48 bg-white rounded-[10px] shadow-xl border-2 border-zinc-100 overflow-hidden z-50 
                animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <ul className="flex flex-col py-1.5">
                      {[
                        "Default sorting",
                        "Price: Low to High",
                        "Price: High to Low",
                        "Newest Arrivals",
                        "Popularity",
                      ].map((option, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setSortOption(option);
                            setIsSortOpen(false);
                          }}
                          className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors
                          ${
                            sortOption === option
                              ? "bg-gray-50 text-black font-semibold"
                              : "text-gray-600 hover:bg-gray-100 hover:text-black"
                          }
                        `}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Product Grid / List View */}
            <div
              key={sortOption + viewMode + searchQuery}
              className={
                sortedProducts.length === 0
                  ? "flex flex-col items-center justify-center w-full py-20 text-center"
                  : viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
                  : "flex flex-col gap-8"
              }
            >
              {sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full animate-fade-up">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <FaSearch size={32} />
                  </div>
                  <h3 className="text-[22px] font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-[15px] text-gray-500 max-w-md">
                    We couldn't find anything matching{" "}
                    <span className="font-semibold text-black">
                      "{searchQuery}"
                    </span>
                    . Try adjusting your search or filters.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-6 px-6 py-2.5 bg-black text-white rounded-full text-[14px] font-medium hover:bg-white hover:text-black border-2 border-zinc-400 
                  transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                sortedProducts.map((product, index) => {
                  const isInWishlist = wishlistItems.some(
                    (item) => item.id == product.id
                  );

                  const isInCompare = compareItems.some(
                    (item) => item.id == product.id
                  );
                  return viewMode === "grid" ? (
                    /* --- GRID VIEW CARD --- */
                    <div
                      onClick={() => navigate(`/product/${product.id}`)}
                      key={product.id}
                      className="group flex flex-col bg-white animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative w-full aspect-[4/5] rounded-[15px] overflow-hidden bg-gray-100 mb-4 cursor-pointer">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {product.badge && (
                          <div
                            className={`absolute top-4 left-4 ${product.badge.color} text-white text-[13px] font-semibold px-3 py-1 rounded-md`}
                          >
                            {product.badge.text}
                          </div>
                        )}

                        <div
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all 
                    duration-500 translate-y-4 group-hover:translate-y-0"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              addToCart(product, 1, "Standard Wood", "Coral");
                            }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black 
                      hover:text-white shadow-md transition-colors"
                          >
                            <FaShoppingCart />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              let defaultColor = "Black";
                              if (product.colors && product.colors.length > 0) {
                                defaultColor =
                                  typeof product.colors[0] === "Default"
                                    ? product.colors[0].name
                                    : product.colors[0];
                              }

                              const defaultMaterial =
                                product.materials &&
                                product.materials.length > 0
                                  ? product.materials[0]
                                  : "Standard Wood";

                              const productWithDefaults = {
                                ...product,
                                selectedColor: defaultColor,
                                selectedMaterial: defaultMaterial,
                              };

                              toggleWishlist(productWithDefaults);
                            }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black 
                      hover:text-white shadow-md transition-colors"
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
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black 
                      hover:text-white shadow-md transition-colors"
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
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black 
                      hover:text-white shadow-md transition-colors"
                          >
                            <FaRegEye />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-[17px] font-medium text-gray-900 capitalize mb-1 hover:text-gray-600 cursor-pointer transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.oldPrice && (
                          <span className="text-[15px] text-gray-400 line-through">
                            {product.oldPrice}
                          </span>
                        )}
                        <span className="text-[17px] text-gray-600 font-light">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* --- LIST VIEW CARD --- */
                    <div
                      onClick={() => navigate(`/product/${product.id}`)}
                      key={product.id}
                      className="flex flex-col md:flex-row gap-6 md:gap-10 bg-white p-5 rounded-[20px] border-gray-100 hover:shadow-lg transition-shadow duration-300 animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-full md:w-[320px] aspect-square rounded-[15px] bg-gray-50 overflow-hidden shrink-0 relative cursor-pointer group">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {product.badge && (
                          <div
                            className={`absolute top-4 left-4 ${product.badge.color} text-white text-[13px] font-semibold px-3 py-1 uppercase rounded-md`}
                          >
                            {product.badge.text}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-grow py-2">
                        <h2 className="text-[22px] md:text-[26px] font-medium text-gray-900 mb-3 capitalize">
                          {product.name}
                        </h2>
                        <p className="text-[15px] text-gray-300 mb-6 leading-relaxed max-w-2xl font-light">
                          Elevate your dining experience with the {product.name}
                          , a perfect blend of modern elegance and timeless
                          craftsmanship.
                        </p>
                        <div className="flex items-center gap-3 mb-8">
                          {product.oldPrice && (
                            <span className="text-[18px] text-gray-400 line-through">
                              {product.oldPrice}
                            </span>
                          )}
                          <span className="text-[20px] font-medium text-gray-900">
                            {product.price}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              addToCart(product, 1, "Standard Wood", "Coral");
                            }}
                            className="text-white  bg-[#1a1a19] hover:bg-transparent hover:text-[#1a1a19] border-2 border-[#1a1a19] 
                      text-[14px] font-medium px-8 py-3 rounded-[6px] hover:bg-gray-800 transition-colors active:scale-[1]"
                          >
                            Add To Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              let defaultColor = "Black";
                              if (product.colors && product.colors.length > 0) {
                                defaultColor =
                                  typeof product.colors[0] === "object"
                                    ? product.colors[0].name
                                    : product.colors[0];
                              }

                              const defaultMaterial =
                                product.materials &&
                                product.materials.length > 0
                                  ? product.materials[0]
                                  : "Standard Wood";

                              const productWithDefaults = {
                                ...product,
                                selectedColor: defaultColor,
                                selectedMaterial: defaultMaterial,
                              };

                              toggleWishlist(productWithDefaults);
                            }}
                            className="w-11 h-11 flex items-center justify-center border-2 border-zinc-300 rounded-full text-gray-600 hover:text-black 
                      hover:border-black transition-colors cursor-pointer"
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
                              setQuickViewProduct(product);
                              setView3DProduct(null);
                            }}
                            className="w-11 h-11 flex items-center justify-center border-2 border-zinc-300 rounded-full text-gray-600 hover:text-black 
                      hover:border-black transition-colors cursor-pointer"
                          >
                            <FaRegEye />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product);
                            }}
                            className="w-11 h-11 flex items-center justify-center border-2 border-zinc-300 rounded-full text-gray-600 hover:text-black 
                      hover:border-black transition-colors cursor-pointer"
                          >
                            {isInCompare ? (
                              <TiArrowShuffle className="text-red-500 w-6 h-6 font-medium" />
                            ) : (
                              <FaExchangeAlt />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-16 mb-14">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <FaChevronLeft size={14} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-black font-medium shadow-md">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                3
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                4
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
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

export default Shop;

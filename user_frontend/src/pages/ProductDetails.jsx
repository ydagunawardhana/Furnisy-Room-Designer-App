import React, { useEffect, useRef, useState } from "react";
import {
  FaChevronRight,
  FaStar,
  FaRegHeart,
  FaExchangeAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaCube,
  FaChevronUp,
  FaChevronDown,
  FaHeart,
} from "react-icons/fa";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { TiArrowShuffle } from "react-icons/ti";
import Product3DModal from "../components/Product3DModal";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast, { ErrorIcon } from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ---  State Management ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("id", "==", Number(id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);

          setActiveImg(data.img || (data.images && data.images[0]) || "");
          if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
          if (data.materials?.length > 0)
            setSelectedMaterial(data.materials[0]);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Error loading product details");
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const getColorName = (hexCode) => {
    if (!hexCode) return "";
    const code = typeof hexCode === "string" ? hexCode.toLowerCase() : hexCode;

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

  // ---  State Management ---
  const [activeImg, setActiveImg] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [customMaterial, setCustomMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [userRating, setUserRating] = useState(4);
  const sliderRef = useRef(null);

  const { toggleWishlist, wishlistItems } = useWishlist();
  const isInWishlist = wishlistItems.some((item) => item?.id == product?.id);

  const { toggleCompare, compareItems } = useCompare();
  const isInCompare = compareItems.some((item) => item?.id == product?.id);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-inter">
        <h2 className="text-3xl font-medium text-gray-900 mb-4">
          Product Not Found
        </h2>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-2 bg-black text-white rounded-full"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const productGallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.img];

  const productMaterials = product.materials || ["Teak", "Oak", "Mahogany"];

  return (
    <div className="w-full bg-white font-inter">
      {/* --- Breadcrumb --- */}
      <div className="w-full py-12 border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 xl:px-20">
          <div className="flex items-center gap-2 text-[18px] text-gray-500 font-medium">
            <Link
              to="/"
              className="hover:text-black hover:underline transition-colors font-light"
            >
              Home
            </Link>
            <FaChevronRight className="text-[10px]" />
            <Link
              to="/shop"
              className="hover:text-black hover:underline transition-colors font-light"
            >
              Shop
            </Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-gray-600 capitalize">{product.name}</span>
          </div>
        </div>
      </div>

      {/* --- Main Product Section --- */}
      <div className="container mx-auto px-4 sm:px-6 xl:px-20 pt-5 md:pt-1">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-[55%] flex flex-col-reverse md:flex-row gap-4 md:gap-6">
            <div className="flex md:flex-col items-center gap-2 shrink-0 mr-5">
              {/* Up Arrow */}
              <button
                onClick={() =>
                  sliderRef.current?.scrollBy({ top: -150, behavior: "smooth" })
                }
                className="hidden md:flex w-full h-6 items-center justify-center text-gray-400 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                <FaChevronUp />
              </button>

              <div
                ref={sliderRef}
                className="flex md:flex-col gap-1 overflow-x-auto md:overflow-y-hidden md:w-[100px] shrink-0 h-auto md:h-[480px] [&::-webkit-scrollbar]:hidden 
                [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {productGallery.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    className={`w-[80px] md:w-full aspect-[4/5] bg-[#f8f9fa] rounded-[10px] overflow-hidden cursor-pointer border-2 border-dashed 
                     transition-all duration-300 shrink-0 
                      ${
                        activeImg === img
                          ? "border-zinc-400  shadow-[0_4px_10px_rgba(0,0,0,0.1)] scale-95"
                          : "border-transparent hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      className="w-full h-full object-contain mix-blend-multiply p-2"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  sliderRef.current?.scrollBy({ top: 150, behavior: "smooth" })
                }
                className="hidden md:flex w-full h-6 items-center justify-center text-gray-400 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                <FaChevronDown />
              </button>
            </div>

            {/* Main Large Image */}
            <div className="relative md:h-[600px] rounded-3xl flex items-center justify-center overflow-hidden group">
              {/* 3D Button */}
              <button
                onClick={() => setIs3DModalOpen(true)}
                className="absolute top-3 right-4 z-10 w-[42px] h-[42px] bg-zinc-200 hover:bg-zinc-300  rounded-[10px] shadow-md flex items-center 
                justify-center text-gray-700 hover:text-black hover:scale-105 transition-all cursor-pointer border-2"
                title="View in 3D"
              >
                <FaCube size={20} />
              </button>

              <img
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-[35%] flex flex-col">
            <h1 className="text-[30px] md:text-[32px] font-medium text-gray-900 mb-2 capitalize leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-8 mb-4 mt-2">
              <div className="flex text-[#f7c603c9] text-[15px]">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar className="text-gray-300" />
                <span className="text-gray-100 ml-3 font-medium">(3)</span>
              </div>
              <div className="text-[16px] text-gray-500 font-medium">
                Stock:{" "}
                <span className="text-green-600 font-semibold">In stock</span>
              </div>
            </div>

            <div className="text-[33px] font-medium text-gray-700 mb-6">
              {product.price}
            </div>

            <p className="text-[16px] text-gray-900  mb-5 max-w-[120%] font-light">
              {product.desc || product.description}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="block text-[18px] font-medium text-gray-900 mb-3">
                  Color:
                  <span className="text-gray-500 text-[15px] font-semibold ml-2">
                    {getColorName(selectedColor)}
                  </span>
                </span>
                <div className="flex gap-2.5">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-200 
                    ${
                      selectedColor?.toLowerCase() === color?.toLowerCase()
                        ? "ring-2 ring-offset-2 ring-black scale-110"
                        : "border-gray-200 hover:scale-110"
                    }`}
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

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
                    className={`px-5 py-2 border-[1.5px] border-dashed border-zinc-500 rounded-[8px] text-[14px] font-medium transition-all duration-200 outline-none
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
                className={`w-full md:w-[77%] overflow-hidden transition-all duration-700 ease-in-out
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
                  className="w-full border-2 border-zinc-300 rounded-[8px] py-2 px-4 text-[14px] text-gray-800 mt-1.5
                  focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
                <p className="text-[12px] text-gray-400 mt-1.5">
                  * Custom materials may affect the final price and delivery
                  time.
                </p>
              </div>
            </div>

            {/* Actions (Quantity + Cart) */}
            <div className="flex items-center gap-7 mb-8">
              <div className="flex items-center border-2 border-zinc-300 rounded-md overflow-hidden">
                <button
                  onClick={() =>
                    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                  }
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-[18px] font-semibold"
                >
                  -
                </button>

                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-8 text-center text-[16px] outline-none font-medium text-gray-900 bg-transparent"
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
                      ? `: ${customMaterial}`
                      : selectedMaterial;
                  const colorName = getColorName(selectedColor);

                  addToCart(product, quantity, finalMaterial, colorName);
                }}
                className="flex-grow max-w-[250px] h-[45px] rounded-md text-white bg-[#1a1a19] hover:bg-transparent hover:text-[#1a1a19] border-2 border-[#1a1a19] 
                transition-colors duration-400 text-[16px] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] "
              >
                Add To Cart
              </button>
            </div>

            {/* Wishlist & Compare */}
            <div className="flex items-center gap-8 mb-7 text-[18px] text-gray-500 font-medium">
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
                  <TiArrowShuffle className="text-[21px]" />
                ) : (
                  <FaExchangeAlt className="text-[21px]" />
                )}
                {isInCompare ? "Remove from compare" : "Add to compare"}
              </button>
            </div>

            {/* Meta Info */}
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

      {/* --- Tabs Section (Description, Additional Info, Reviews) --- */}
      <div className="container mx-auto px-4 sm:px-6 xl:px-20 mt-20 md:mt-28 pb-12">
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16  pb-2">
          {["Description", "Additional Information", "Review (1)"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[18px] md:text-[20px] font-medium transition-colors relative pb-4 -mb-[17px]
                ${
                  activeTab === tab
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
                )}
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div className="pt-8 md:pt-10 max-w-[1400px] mx-auto">
          {activeTab === "Description" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-[12px] md:text-[17px] leading-relaxed text-gray-900 mb-5 font-light">
                Elevate your dining experience with the Tacoma Carver Dining
                Chair, a perfect blend of modern elegance and timeless
                craftsmanship. Designed to offer both comfort and style, this
                chair is an ideal addition to any dining room or living space.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                  <p className="text-[12px] md:text-[17px] leading-relaxed text-gray-600 font-light">
                    <span className="text-gray-900 font-medium">
                      Elegant Design:
                    </span>{" "}
                    The Tacoma Carver Dining Chair features a sleek,
                    contemporary design that complements a variety of interior
                    styles. Its clean lines and refined silhouette make it a
                    standout piece in any room.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                  <p className="text-[12px] md:text-[17px] leading-relaxed text-gray-600 font-light">
                    <span className="text-gray-900 font-medium">
                      Superior Comfort:
                    </span>{" "}
                    Designed with your comfort in mind, the chair boasts a
                    generously padded seat and backrest. The ergonomic design
                    supports your posture, ensuring you can enjoy long meals and
                    conversations in comfort.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                  <p className="text-[12px] md:text-[17px] leading-relaxed text-gray-600 font-light">
                    <span className="text-gray-900 font-medium">
                      High-Quality Materials:
                    </span>{" "}
                    Crafted from premium materials, the Tacoma Carver Dining
                    Chair is built to last. The solid wood frame provides sturdy
                    support, while the upholstered seat and backrest add a touch
                    of luxury.
                  </p>
                </li>
              </ul>
            </div>
          )}

          {activeTab === "Additional Information" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500  text-gray-500 font-light text-[12px] md:text-[17px] leading-relaxed">
              Elevate your dining experience with the Tacoma Carver Dining
              Chair, a perfect blend of modern elegance and timeless
              craftsmanship. Designed to offer both comfort and style, this
              chair is an ideal addition to any dining room or living space. The
              Tacoma Carver Dining Chair combines aesthetic appeal with
              practical functionality, making it a versatile and valuable
              addition to any home.
            </div>
          )}

          {activeTab === "Review (1)" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left max-w-5xl mx-auto py-4">
              {/* --- Review --- */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Jannie Schumm"
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-[16px] font-medium text-gray-900">
                      Jannie Schumm
                    </h4>
                    <div className="flex text-[#facc15] text-[13px] mt-1">
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                    </div>
                  </div>
                </div>
                <p className="text-[16px] text-gray-500 leading-relaxed font-light">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Varius massa id ut mattis. Facilisis vitae gravida egestas ac
                  account. consectetur adipiscing elit. Varius massa id ut
                  mattis. Facilisis vitae gravida egestas ac account.
                </p>
              </div>

              <div>
                <h3 className="text-[20px] font-medium text-gray-900 mb-6">
                  Write a Review for this product
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[15px] text-gray-600 font-medium">
                    Your Rating
                  </span>
                  <div className="flex gap-1 text-[20px] cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`transition-colors hover:scale-110 ${
                          star <= userRating
                            ? "text-[#facc15]"
                            : "text-gray-300"
                        }`}
                        onClick={() => setUserRating(star)}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Textbox*/}
                <div className="mb-6">
                  <label className="block text-[15px] text-gray-200 mb-2 font-medium">
                    Your Review
                  </label>
                  <textarea
                    rows="5"
                    className="w-full border border-gray-300 rounded-md p-4 text-[13px] text-gray-700 outline-none focus:border-gray-500 transition-colors resize-y"
                    placeholder="Write your review here..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  className="text-white bg-[#1a1a19] hover:bg-transparent hover:text-[#1a1a19] border-2 border-[#1a1a19] 
                transition-colors duration-400 px-8 py-2 rounded-md font-medium text-[15.5px] hover:bg-black  shadow-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
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

      {/* Product 3D Modal Popup */}
      <Product3DModal
        product={product}
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
      />
    </div>
  );
};

export default ProductDetails;

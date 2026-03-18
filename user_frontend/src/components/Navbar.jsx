import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.svg";
import downArrow from "../assets/down-arrow.svg";
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { RiHeart3Line } from "react-icons/ri";
import { MdShoppingCartCheckout } from "react-icons/md";
import { FaExchangeAlt, FaRegBell } from "react-icons/fa";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { LuSearchX } from "react-icons/lu";

import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { RiSave3Line } from "react-icons/ri";
import { HiOutlineLogout } from "react-icons/hi";

const Navbar = () => {
  // Navbar State
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [forceCloseMenu, setForceCloseMenu] = useState(false);

  const handleMegaMenuClick = () => {
    setForceCloseMenu(true);
    setTimeout(() => setForceCloseMenu(false), 400);
  };

  // Outside Click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    const handleScrollClose = () => {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollClose);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollClose);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Logout Function (Toast)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              Logged out successfully!
            </span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );

      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const { compareItems } = useCompare();
  const compareCount = compareItems.length;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== "") {
      navigate(`/shop?search=${encodeURIComponent(searchInput)}`);
      setIsSearchOpen(false);
      setSearchInput("");
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [isSearchOpen]);

  if (location.pathname === "/build-room") {
    return null;
  }

  return (
    <>
      <div className="h-[70px] md:h-[90px] w-full"></div>
      <nav
        className={`fixed w-full top-0 z-50 transition-transform duration-500 ease-in-out ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        } bg-white h-[90px] flex items-center justify-between px-8 md:px-16 lg:px-32 shadow-md`}
      >
        <Link to="/">
          <div className="flex-shrink-0 cursor-pointer">
            {logo ? (
              <img
                src={logo}
                alt="Furnisy"
                className="h-[55px] w-auto object-contain px-12 mb-1"
              />
            ) : (
              <h1 className="text-2xl font-bold">Furnisy</h1>
            )}
          </div>
        </Link>

        {/* (Navigation Links) */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12 text-[18px] text-gray-400 font-medium">
          {/* Home */}
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-700">
              <span>Home</span>
            </div>
          </Link>

          {/* Shop */}
          <Link to="/shop">
            <div className="flex items-center gap-3 cursor-pointer hover:text-zinc-700">
              <span>Shop</span>
            </div>
          </Link>

          {/* Blog */}
          <div className="flex items-center gap-3 cursor-pointer hover:text-zinc-700">
            <span>Blog</span>
          </div>

          {/* Pages (Mega Menu) */}
          <div className="group h-[90px] flex items-center cursor-pointer">
            <div className="flex items-center gap-2 hover:text-zinc-700 transition-colors">
              <span>Pages</span>
              <img
                src={downArrow}
                alt="dropdown"
                className="w-4 h-4 opacity-100 group-hover:rotate-180 transition-transform duration-300"
              />
            </div>

            <div
              className={`absolute top-[90px] left-0 w-full px-8 md:px-16 lg:px-36 z-50 text-left cursor-default transition-all duration-500 ease-in-out origin-top ${
                forceCloseMenu
                  ? "opacity-0 invisible pointer-events-none -translate-y-2 [clip-path:inset(0_0_100%_0)]"
                  : "opacity-0 invisible pointer-events-none -translate-y-2 [clip-path:inset(0_0_100%_0)] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:[clip-path:inset(0_0_0_0)]"
              }`}
            >
              {/* Flex Container */}
              <div className="w-full bg-white shadow-md   rounded-b-[15px] flex overflow-hidden">
                {/* Left Side: Links Area */}
                <div className="flex-1 p-10 lg:p-10">
                  <div className="grid grid-cols-9 gap-5">
                    {/* Column 1: Shop Pages */}
                    <div className="col-span-2">
                      <h4 className="text-black font-bold text-[17px] mb-5">
                        Shop Pages
                      </h4>
                      <ul className="flex flex-col gap-3.5 text-[14px] font-medium text-gray-500">
                        <li>
                          <Link
                            to="/cart"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            View Cart
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/checkout"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Checkout
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/wishlist"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/compare"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Compare
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Useful Links */}
                    <div className="col-span-2">
                      <h4 className="text-black font-bold text-[17px] mb-5">
                        Useful Links
                      </h4>
                      <ul className="flex flex-col gap-3.5 text-[14px] font-medium text-gray-500">
                        <li>
                          <Link
                            to="#"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            About Us
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Contact Us
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            FAQs
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Store Location
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Privacy Policy
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: User Account */}
                    <div className="col-span-2">
                      <h4 className="text-black font-bold text-[17px] mb-5">
                        User Account
                      </h4>
                      <ul className="flex flex-col gap-3.5 text-[14px] font-medium text-gray-500">
                        <li>
                          <Link
                            to="/login"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Login
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/register"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Register
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/designideas"
                            onClick={handleMegaMenuClick}
                            className="hover:text-black hover:translate-x-1 transition-all inline-block"
                          >
                            Saved Designs
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 4: Featured Products */}
                    <div className="col-span-3">
                      <h4 className="text-black font-bold text-[17px] mb-5">
                        Featured Products
                      </h4>
                      <div className="flex flex-col gap-5">
                        {/* Product 1 */}
                        <Link
                          to="/shop"
                          onClick={handleMegaMenuClick}
                          className="flex items-center gap-4 group/item"
                        >
                          <div className="w-20 h-20 bg-[#f5f5f5] rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src="https://media.architonic.com/m-on/3105399/product/1569576/leolux-lx_lx694_702974f0.jpeg?width=1200&height=630&format=webp"
                              alt="chair"
                              className="w-[85%] object-contain mix-blend-multiply group-hover/item:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <h5 className="text-[14px] font-semibold text-gray-800 group-hover/item:text-black transition-colors leading-tight mb-1">
                              Modern Dark Wood Chair
                            </h5>
                            <span className="text-[13px] text-gray-500 font-medium">
                              $299.00
                            </span>
                          </div>
                        </Link>

                        {/* Product 2 */}
                        <Link
                          to="/shop"
                          onClick={handleMegaMenuClick}
                          className="flex items-center gap-4 group/item"
                        >
                          <div className="w-20 h-20 bg-[#f5f5f5] rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src="https://image.archify.com/catalog/product/l/5jxqc-pmazm-1609240698.jpg"
                              alt="chair"
                              className="w-[85%] object-contain mix-blend-multiply group-hover/item:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <h5 className="text-[14px] font-semibold text-gray-800 group-hover/item:text-black transition-colors leading-tight mb-1">
                              Modern Accent Chair
                            </h5>
                            <span className="text-[13px] text-gray-500 font-medium">
                              $199.00
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Offer Banner */}
                <div className="hidden lg:block w-[30%] xl:w-[28%] relative group/banner cursor-pointer overflow-hidden">
                  <img
                    src="https://furnisy.vercel.app/_next/image?url=%2Fimages%2Fhome-1%2Fgallery%2Fimg-2.webp&w=1920&q=75"
                    alt="banner"
                    className="absolute inset-0 w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-8 lg:p-10">
                    <span className="text-white/90 text-[12px] font-medium mb-1 tracking-wider uppercase">
                      Special Offer
                    </span>
                    <h3 className="text-white text-[24px] font-bold leading-tight mb-5">
                      Sale <span className="text-[#facc15]">up to 30%</span>
                      <br />
                      Only today!
                    </h3>
                    <Link
                      to="/shop"
                      onClick={handleMegaMenuClick}
                      className="bg-black hover:bg-white hover:text-black border-2 border-black text-white w-max px-6 py-2 rounded-full text-[13px] font-bold transition-colors shadow-md"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Design & Ideas */}
          <Link to="/designideas">
            <div className="flex items-center gap-3 cursor-pointer hover:text-zinc-700">
              <span>Design & Ideas</span>
            </div>
          </Link>
        </div>

        {/* (Icons Section) */}
        <div className="flex items-center gap-6">
          {/* Search Icon */}
          <div
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="cursor-pointer hover:opacity-70 flex items-center justify-center"
            title="Search"
          >
            {isSearchOpen ? (
              <LuSearchX className="w-7 h-7 text-black font-[15px]" />
            ) : (
              <FaSearch className="w-5 h-5 text-gray-700" />
            )}
          </div>

          {/* User Icon */}
          <div className="relative" ref={profileMenuRef}>
            {user ? (
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="cursor-pointer flex items-center justify-center"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-7 h-7 rounded-full border-2 border-zinc-400 shadow-sm hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1a1a19] text-white flex items-center justify-center font-bold text-[16px] shadow-sm hover:scale-110 transition-transform">
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <div className="cursor-pointer hover:opacity-70">
                  <CgProfile
                    className="w-7 h-7 text-gray-700"
                    title="Profile"
                  />
                </div>
              </Link>
            )}

            {/* Dropdown Menu */}
            {user && (
              <div
                className={`absolute right-0 top-10 mt-2 w-[200px] bg-white border-2 border-zinc-200 rounded-xl shadow-xl py-2 z-50 origin-top-right transition-all duration-300 ease-out ${
                  showProfileMenu
                    ? "opacity-100 scale-100 translate-y-0 visible"
                    : "opacity-0 scale-100 -translate-y-2 invisible pointer-events-none"
                }`}
              >
                <div className="px-4 py-2 border-b-2 border-zinc-300  bg-gray-50/50 rounded-t-xl">
                  <p className="text-[12px] text-black mb-0.5 font-normal">
                    Logged in as
                  </p>
                  <p className="text-[15px] font-bold text-gray-800 truncate">
                    {user.displayName || user.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-black hover:bg-gray-50 hover:text-black hover:bg-zinc-100 transition-colors"
                >
                  <CgProfile size={20} />
                  My Profile
                </Link>

                <Link
                  to="/profile"
                  state={{ activeTab: "designs" }}
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-black hover:bg-gray-50 hover:text-black hover:bg-zinc-100 transition-colors"
                >
                  <RiSave3Line size={20} />
                  My Saved Designs
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-[14px] text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  <HiOutlineLogout size={21} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Wishlist (Heart) Icon */}
          <Link to="/wishlist">
            <div className="relative cursor-pointer hover:opacity-70">
              <RiHeart3Line
                className="w-7 h-7 text-gray-700"
                title="Wishlist"
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-2.5 -right-3 bg-[#181818] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </div>
          </Link>

          {/* Compare Icon */}
          <Link
            to="/compare"
            className="relative cursor-pointer items-center justify-center group hidden sm:flex"
          >
            <FaExchangeAlt
              size={20}
              className="relative cursor-pointer hover:opacity-70"
              title="Compare"
            />

            {compareCount > 0 && (
              <span className="absolute -top-3.5 -right-3 bg-[#181818] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {compareCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Badge */}
          <div
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer hover:opacity-70"
          >
            <MdShoppingCartCheckout
              className="w-6 h-6 text-gray-800"
              title="Cart"
            />
            {totalItems > 0 && (
              <span className="absolute -top-3 -right-3 bg-[#181818] text-white text-[12px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </div>

          {/* Notifications Icon */}
          <div
            onClick={() =>
              toast.custom(
                (t) => (
                  <div
                    className={`${
                      t.visible ? "toast-enter" : "toast-exit"
                    } bg-[#333] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-400/30`}
                  >
                    <div className="shrink-0 bg-white/20 p-2 rounded-full flex items-center justify-center">
                      <FaRegBell
                        className="text-white w-5 h-5"
                        title="Notifications"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[14px] font-bold leading-none mb-1.5">
                        New Notifications
                      </span>
                      <span className="text-[13px] font-medium text-blue-100 leading-none">
                        You have 2 unread messages.
                      </span>
                    </div>
                  </div>
                ),
                { position: "top-right", duration: 3000 }
              )
            }
            className="relative cursor-pointer hover:opacity-70 transition-transform hover:scale-110 flex items-center justify-center p-1"
          >
            <FaRegBell className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">
              2
            </span>
          </div>
        </div>

        {/* Smooth Animation Search Box Dropdown */}
        <div
          className={`absolute top-[68px] left-0 w-full bg-white z-50 overflow-hidden transition-all duration-700 ease-in-out ${
            isSearchOpen
              ? "max-h-[200px] opacity-100 shadow-md"
              : "max-h-0 opacity-0 shadow-none border-transparent"
          }`}
        >
          <div className="container mx-auto px-8 md:px-16 lg:px-32 py-6 flex justify-center">
            <form
              onSubmit={handleSearchSubmit}
              className="relative group w-full max-w-3xl flex items-center pb-2"
            >
              <FaSearch className="text-gray-400 text-[23px] mr-3 group-focus-within:text-black transition-colors duration-300" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for furniture, categories, or materials..."
                className="w-full outline-none text-[16px] md:text-[18px] text-gray-800 bg-transparent"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                className="ml-4 bg-black text-white px-7 py-2 rounded-md font-medium hover:bg-white hover:text-black border-2 border-black transition-colors cursor-pointer"
              >
                Search
              </button>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200"></span>

              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black origin-center transform scale-x-0 transition-transform duration-700 ease-out group-focus-within:scale-x-100"></span>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

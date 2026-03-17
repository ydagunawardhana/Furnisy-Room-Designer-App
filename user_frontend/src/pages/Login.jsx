import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import HeaderImage from "../assets/header_img.png";
import sideimg from "../assets/silde_img.png";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaArrowRight, FaInstagram } from "react-icons/fa";
import Footer from "../components/Footer";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";

// Firebase Imports
import { auth, googleProvider, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Email/Password Login Function
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Please enter Email and Password!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">Login Successful!</span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Invalid Email or Password!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    }
  };

  // Google Login Function
  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "user",
        });
      }

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              Google Login Successful!
            </span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Google Login Failed!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter w-full">
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
            My Account
          </h1>

          <div className="flex items-center gap-2 text-[14px] md:text-[15px] text-gray-200 font-light">
            <Link
              to="/"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              Home
            </Link>
            <span className="text-gray-400 text-sm">&gt;</span>
            <span className="text-white">Login</span>
          </div>
        </div>
      </div>

      {/* --- Login Form & Image Section --- */}
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 lg:px-2 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-40">
        <div className="w-full lg:w-[45%] mx-auto lg:mx-0 font-inter">
          <h2 className="text-[24px] md:text-[28px] font-semibold text-gray-900 mb-8">
            Login your Account
          </h2>

          <form className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-[15px] font-medium text-gray-800 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full px-4 py-3.5 rounded-lg border-2 border-zinc-400 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all
                 bg-white text-[15px] placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-[15px] font-medium text-gray-800 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3.5 rounded-lg border-2 border-zinc-400 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all
                 bg-white text-[15px] placeholder-gray-400 [&::-ms-reveal]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[49px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={18} />}
              </button>
            </div>

            {/* Remember me & Lost password */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                />
                <label
                  htmlFor="remember"
                  className="text-[15.3px] font-medium text-gray-600 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-[15px] text-gray-400 hover:text-zinc-600  transition-colors font-medium relative group"
              >
                Lost your password?
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center -mb-0.5"></span>
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleEmailLogin}
              className="group relative w-full bg-[#1a1a19] text-white hover:text-[#1a1a19] border-2 border-[#1a1a19] text-[17px] font-medium py-4 rounded-full flex items-center 
              justify-center gap-3 hover:bg-transparent transition-all duration-300 hover:shadow-lg  active:scale-[0.98] mt-4 cursor-pointer overflow-hidden"
            >
              <span>Sign In</span>
              <FaArrowRight className="text-[15px] group-hover:translate-x-1.5 transition-transform duration-400" />
            </button>

            {/* Or Login With Divider */}
            <div className="relative flex items-center py-4 mt-2">
              <div className="flex-grow border-t-2 border-zinc-400"></div>
              <span className="flex-shrink-0 mx-4 text-gray-300 text-[15px] font-medium">
                Or Login With
              </span>
              <div className="flex-grow border-t-2 border-zinc-400"></div>
            </div>

            {/* Social Login Buttons (Google & Facebook) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 w-full border-2 border-zinc-400 rounded-[10px] py-3 text-[16px] font-semibold text-gray-700 
                hover:bg-[#ebf0f7] transition-colors cursor-pointer"
              >
                <FcGoogle className="text-red-500 text-2xl" />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full border-2 border-zinc-400 rounded-[10px] py-3 text-[16px] font-semibold text-gray-700 
                hover:bg-[#ebf0f7] transition-colors cursor-pointer"
              >
                <FaFacebook className="text-blue-600 text-2xl" />
                Facebook
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-[15px] text-gray-500 mt-8 font-light">
            New customer?{" "}
            <Link
              to="/register"
              className="relative group font-medium text-[16px] text-gray-900 hover:text-black hover:opacity-70 transition-opacity"
            >
              Sign up
              <span className="absolute left-0 bottom-0 w-full h-[3px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center -mb-1"></span>
            </Link>
          </p>
        </div>

        <div className="hidden lg:block lg:w-[55%] h-full">
          <div className="w-full h-[676px] rounded-[20px] overflow-hidden bg-gray-100 shadow-sm relative group">
            <img
              src={sideimg}
              alt="Dining Table Login"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
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

      {/* Animation Styles for Toasts */}
      <style>
        {`
          @keyframes slideInFromRight {
            0% { transform: translateX(150%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutToRight {
            0% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(150%); opacity: 0; }
          }
          .toast-enter {
            animation: slideInFromRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          .toast-exit {
            animation: slideOutToRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Login;

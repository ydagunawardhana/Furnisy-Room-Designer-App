import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import HeaderImage from "../assets/header_img.png";
import Footer from "../components/Footer";
import { FaInstagram, FaCheckCircle } from "react-icons/fa";
import stripe from "../assets/stripe.png";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import stripeLogo from "../assets/stripe.png";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51SmtBkFDot0lizJL7l78C1nxaWRDqj3UdJhcyznfQTTXP8Wj4XN1VB6Sm6gJ5W96vtVYhJvIRHOY62D8Ec6QpUEB00US12zzWT"
);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const CheckoutContent = () => {
  const navigate = useNavigate();

  const { cartItems, subtotal, selectedAddress, saveAddress, clearCart } =
    useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [shippingMethod, setShippingMethod] = useState("free");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [loading, setLoading] = useState(true);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const formRef = useRef(null);

  const total = shippingMethod === "free" ? subtotal : subtotal + 10;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "toast-enter" : "toast-exit"
              } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
            >
              <ErrorIcon size={20} className="text-red-400" />
              <span className="text-[14px] font-medium">
                Please login to access checkout!
              </span>
            </div>
          ),
          { position: "top-right", duration: 3000 }
        );

        navigate("/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Toast Animation Styles */}
      <style>
        {`
          @keyframes slideInFromRight { 0% { transform: translateX(150%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
          @keyframes slideOutToRight { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(150%); opacity: 0; } }
          .toast-enter { animation: slideInFromRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .toast-exit { animation: slideOutToRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        `}
      </style>

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
            Checkout
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
            <span className="text-white">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 xl:px-20 max-w-[1500px] pb-12">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
          {/* --- Billing Details --- */}
          <div className="w-full lg:w-[55%] xl:w-[60%]">
            {/* Login Links */}
            <div className="mb-6 text-[16px] text-gray-600 flex flex-col gap-2 font-light">
              <p>
                Returning customer?
                <button
                  onClick={() => navigate("/login")}
                  className="relative group text-black font-medium ml-2"
                >
                  Click here to login
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
                </button>
              </p>
            </div>

            <h2 className="text-[28px] font-semibold text-gray-900 mb-6">
              Billing Details
            </h2>

            <form
              className="flex flex-col gap-6"
              ref={formRef}
              key={selectedAddress?.id || "empty"}
            >
              {/* Name Fields */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] text-gray-700 font-medium">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={selectedAddress?.firstName || ""}
                    className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] text-gray-700 font-medium">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={selectedAddress?.lastName || ""}
                    className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] text-gray-700 font-medium">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedAddress?.email || ""}
                    className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] text-gray-700 font-medium">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={selectedAddress?.phone || ""}
                    className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <label className="text-[15px] text-gray-700 font-medium">
                  Country / Region <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={selectedAddress?.country?.toLowerCase() || ""}
                  name="country"
                  className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select a country...
                  </option>
                  <option value="usa">United States (USA)</option>
                  <option value="uk">United Kingdom (UK)</option>
                  <option value="sl">Sri Lanka</option>
                  <option value="aus">Australia</option>
                </select>
              </div>

              {/* Address Fields */}
              <div className="flex flex-col gap-2">
                <label className="text-[15px] text-gray-700 font-medium">
                  Street address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  defaultValue={selectedAddress?.street || ""}
                  placeholder="House number and street name"
                  className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors mb-2"
                  required
                />
                <input
                  type="text"
                  name="apartment"
                  defaultValue={selectedAddress?.apartment || ""}
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                />
              </div>

              {/* City & ZIP */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] text-gray-700 font-medium">
                    Town / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={selectedAddress?.city || ""}
                    className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] text-gray-700 font-medium">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zip"
                    defaultValue={selectedAddress?.zip || ""}
                    className="w-full h-[45px] border-2 border-zinc-300 rounded-md px-4 outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[15px] text-gray-700 font-medium">
                  Additional information (optional)
                </label>
                <textarea
                  rows="4"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  className="w-full border-2 border-zinc-300 rounded-md p-4 outline-none focus:border-black transition-colors resize-y text-[15px]"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="save_info"
                  defaultChecked
                  className="w-[18px] h-[18px] rounded border-gray-300 accent-black cursor-pointer shadow-md"
                />
                <label
                  htmlFor="save_info"
                  className="text-[15px] text-gray-900 font-medium cursor-pointer select-none"
                >
                  Save this information for next time
                </label>
              </div>
            </form>
          </div>

          {/* --- Order & Payment --- */}
          <div className="w-full lg:w-[45%] xl:w-[40%]">
            <div className="bg-gray-50 border-2 border-zinc-300 border-dashed shadow-md rounded-[10px] p-6 lg:p-8 sticky top-28">
              <h2 className="text-[25px] font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-zinc-400">
                Your Order
              </h2>

              {/* Order Items Table */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between text-[17px] font-semibold text-gray-900 pb-2 border-b-2 border-zinc-400">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>

                <div className="flex flex-col gap-4 py-2">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-[15px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20 bg-white rounded border-2 shadow-md border-zinc-300 overflow-hidden shrink-0 hover:scale-105 transition-transform">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-gray-500 text-[14px]">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-900 font-medium whitespace-nowrap ml-4">
                        $
                        {(
                          parseFloat(item.price.replace("$", "")) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col gap-4 py-5 border-t-2 border-b-2 border-zinc-400 mb-6">
                <div className="flex justify-between items-center text-[17px]">
                  <span className="text-gray-900 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-start text-[17px]">
                  <span className="text-gray-900 font-medium">Shipping</span>
                  <div className="flex flex-col gap-2 items-end">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-gray-600 group-hover:text-black text-[15px]">
                        Free Shipping
                      </span>
                      <input
                        type="radio"
                        name="checkout_shipping"
                        checked={shippingMethod === "free"}
                        onChange={() => setShippingMethod("free")}
                        className="w-4 h-4 accent-black"
                      />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-gray-600 group-hover:text-black text-[15px]">
                        Flat Rate: $10.00
                      </span>
                      <input
                        type="radio"
                        name="checkout_shipping"
                        checked={shippingMethod === "flat"}
                        onChange={() => setShippingMethod("flat")}
                        className="w-4 h-4 accent-black"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 text-[22px]">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-black">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-4 mb-8">
                {/* 1. Direct Bank Transfer */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                      className="w-4 h-4 accent-black mt-0.5"
                    />
                    <span className="text-[16px] font-medium text-gray-900">
                      Direct bank transfer
                    </span>
                  </label>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      paymentMethod === "bank"
                        ? "max-h-[200px] opacity-100 mt-2"
                        : "max-h-0 opacity-0 mt-0"
                    }`}
                  >
                    <div className=" text-[13px] text-zinc-700 leading-relaxed bg-white p-4 rounded-md border-2 border-zinc-300 relative mt-1.5 shadow-md">
                      <div className="absolute -top-[7px] left-3 w-2.5 h-2.5 bg-white border-t-2 border-l-2 border-zinc-300 transform rotate-45"></div>
                      Make your payment directly into our bank account. Please
                      use your Order ID as the payment reference. Your order
                      will not be shipped until the funds have cleared.
                    </div>
                  </div>
                </div>

                {/* 2. Cash on Delivery */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="w-4 h-4 accent-black mt-0.5"
                  />
                  <span className="text-[16px] font-medium text-gray-900 group-hover:text-black">
                    Cash on delivery
                  </span>
                </label>

                {/* 3. Stripe Payment */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      className="w-4 h-4 accent-black mt-0.5"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-medium text-gray-900 group-hover:text-black">
                        Credit Card (Stripe)
                      </span>
                      <div className="flex items-center gap-1 ml-1 opacity-80">
                        <img
                          src={stripeLogo}
                          alt="Stripe"
                          className="w-10 h-9 object-contain"
                        />
                      </div>
                    </div>
                  </label>

                  {/* Stripe Card Input Element */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      paymentMethod === "stripe"
                        ? "max-h-[200px] opacity-100 mt-2"
                        : "max-h-0 opacity-0 mt-0"
                    }`}
                  >
                    <div className="p-4 rounded-md border-2 border-zinc-300 relative mt-1.5 shadow-md bg-white">
                      <div className="absolute -top-[7px] left-3 w-2.5 h-2.5 bg-white border-t-2 border-l-2 border-zinc-300 transform rotate-45"></div>
                      <CardElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 mb-8">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 border-gray-300 accent-black cursor-pointer mt-1 shadow-md rounded-md"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-[14px] text-gray-600 font-light cursor-pointer select-none leading-relaxed"
                >
                  I have read and agree to the website{" "}
                  <a
                    href="#"
                    className="text-black font-medium hover:underline"
                  >
                    terms and conditions
                  </a>{" "}
                  <span className="text-red-500 text-[15px]">*</span>
                </label>
              </div>

              {/* Place Order Button */}
              <button
                disabled={isPlacingOrder}
                onClick={async (e) => {
                  e.preventDefault();

                  if (cartItems.length === 0) {
                    toast.custom(
                      (t) => (
                        <div
                          className={`${
                            t.visible ? "toast-enter" : "toast-exit"
                          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                        >
                          <ErrorIcon size={20} className="text-red-400" />
                          <span className="text-[14px] font-medium">
                            Your cart is empty! Please add items first.
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 3000 }
                    );
                    return;
                  }

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
                            Please login to place an order!
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 3000 }
                    );

                    return;
                  }

                  if (formRef.current && !formRef.current.checkValidity()) {
                    formRef.current.reportValidity();
                    toast.custom(
                      (t) => (
                        <div
                          className={`${
                            t.visible ? "toast-enter" : "toast-exit"
                          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                        >
                          <ErrorIcon size={20} className="text-red-400" />
                          <span className="text-[14px] font-medium">
                            Please fill in all required address fields!
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 3000 }
                    );
                    return;
                  }

                  // Start Loading Animation
                  setIsPlacingOrder(true);

                  // Stripe Payment Validation (Test Mode)
                  let paymentId = "N/A";
                  if (paymentMethod === "stripe") {
                    if (!stripe || !elements) {
                      setIsPlacingOrder(false);
                      return;
                    }

                    const cardElement = elements.getElement(CardElement);
                    const { error, paymentMethod: stripePaymentMethod } =
                      await stripe.createPaymentMethod({
                        type: "card",
                        card: cardElement,
                      });

                    if (error) {
                      console.error("[Stripe Error]", error);
                      setIsPlacingOrder(false);
                      toast.custom(
                        (t) => (
                          <div
                            className={`${
                              t.visible ? "toast-enter" : "toast-exit"
                            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                          >
                            <ErrorIcon size={20} className="text-red-400" />
                            <span className="text-[14px] font-medium">
                              {error.message}
                            </span>
                          </div>
                        ),
                        { position: "top-right", duration: 4000 }
                      );
                      return;
                    }

                    paymentId = stripePaymentMethod.id;
                  }

                  const formData = new FormData(formRef.current);
                  const isProfileDefault =
                    selectedAddress?.id === "profile_default";

                  const addressData = {
                    id: isProfileDefault
                      ? Date.now().toString()
                      : selectedAddress?.id || Date.now().toString(),
                    type: selectedAddress?.type || "Home",
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    email: formData.get("email"),
                    phone: formData.get("phone"),
                    country: formData.get("country"),
                    street: formData.get("street"),
                    apartment: formData.get("apartment") || "",
                    city: formData.get("city"),
                    zip: formData.get("zip"),
                  };

                  const saveInfo = document.getElementById("save_info").checked;
                  if (saveInfo) {
                    await saveAddress(addressData);
                  }

                  const orderData = {
                    items: JSON.parse(JSON.stringify(cartItems)),
                    subtotal: subtotal,
                    shippingFee: shippingMethod === "free" ? 0 : 10,
                    total: total,
                    shippingMethod: shippingMethod,
                    paymentMethod: paymentMethod,
                    shippingAddress: addressData,
                    status: "Processing",
                    createdAt: Date.now(),
                    dateString: new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }),
                  };

                  try {
                    await addDoc(
                      collection(db, "users", auth.currentUser.uid, "orders"),
                      orderData
                    );

                    clearCart();
                    setTimeout(() => {
                      // Stop Loading & Show Success Modal
                      setIsPlacingOrder(false);
                      setOrderSuccess(true);
                    }, 3000);
                  } catch (error) {
                    console.error("Error placing order: ", error);
                    setIsPlacingOrder(false);
                    toast.custom(
                      (t) => (
                        <div
                          className={`${
                            t.visible ? "toast-enter" : "toast-exit"
                          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                        >
                          <ErrorIcon size={20} className="text-red-400" />
                          <span className="text-[14px] font-medium">
                            Failed to place order!
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 3000 }
                    );
                  }
                }}
                className={`w-full py-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.1)] border-2 border-black bg-[#111] text-white font-medium text-[17px] rounded-lg transition-all duration-700 flex items-center justify-center ${
                  isPlacingOrder
                    ? "opacity-80 cursor-not-allowed"
                    : "hover:bg-white hover:text-black hover:border-black"
                }`}
              >
                {isPlacingOrder ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[20px] shadow-2xl p-8 md:p-10 w-full max-w-md flex flex-col items-center text-center relative animate-fade-up">
            {/* Success Icon Animation */}
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-5 animate-bounce shadow-sm">
              <FaCheckCircle size={45} />
            </div>

            <h2 className="text-[26px] font-bold text-gray-900 mb-3 tracking-tight">
              Order placed successfully!
            </h2>
            <p className="text-gray-500 text-[15px] mb-8 leading-relaxed px-2">
              Thank you for your purchase. Your order has been placed
              successfully and is now being processed.
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  toast.custom(
                    (t) => (
                      <div
                        className={`${
                          t.visible ? "toast-enter" : "toast-exit"
                        } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                      >
                        <CheckmarkIcon size={20} className="text-green-400" />
                        <span className="text-[14px] font-medium">
                          Order placed successfully!
                        </span>
                      </div>
                    ),
                    { position: "top-right", duration: 3000 }
                  );
                  navigate("/profile", { state: { activeTab: "orders" } });
                }}
                className="w-full bg-[#111] border-2 border-[#111] text-white py-3.5 rounded-full font-bold text-[15px] hover:bg-white hover:text-black transition-colors shadow-md"
              >
                View My Orders
              </button>

              <button
                onClick={() => {
                  setOrderSuccess(false);
                  toast.custom(
                    (t) => (
                      <div
                        className={`${
                          t.visible ? "toast-enter" : "toast-exit"
                        } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                      >
                        <CheckmarkIcon size={20} className="text-green-400" />
                        <span className="text-[14px] font-medium">
                          Order placed successfully!
                        </span>
                      </div>
                    ),
                    { position: "top-right", duration: 3000 }
                  );
                  navigate("/");
                }}
                className="w-full bg-white text-gray-700 border-2 border-gray-300 py-3.5 rounded-full font-bold text-[15px] hover:border-black hover:text-black hover:bg-zinc-200 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

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

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
};

export default Checkout;

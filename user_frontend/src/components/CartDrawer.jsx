import React from "react";
import { FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { RiDeleteBin2Line } from "react-icons/ri";
import emptyCartImage from "../assets/empty_cart.png";
import toast, { ErrorIcon } from "react-hot-toast";
import { auth } from "../firebase";

const CartDrawer = ({ onNavigate }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
  } = useCart();
  const navigate = useNavigate();

  const freeShippingThreshold = 1000;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const progressPercentage = Math.min(
    (subtotal / freeShippingThreshold) * 100,
    100
  );

  return (
    <>
      {/* Background Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200] transition-all duration-500 ease-in-out ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide Panel (Drawer)*/}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[250] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transform transition-transform duration-[700ms] 
        ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header එක */}
        <div className="flex items-center justify-between p-6 border-b-2 border-zinc-400 shadow-md">
          <h2 className="text-[16px] font-medium text-gray-900 tracking-wide uppercase">
            Shopping Cart ({cartItems.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-500 hover:bg-zinc-300 hover:rounded-full transition-colors cursor-pointer"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Cart Items ටික */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <img
                src={emptyCartImage}
                alt="Empty Cart"
                className="w-[150px] h-[150px] mb-4 opacity-100"
              />
              <p className="font-medium text-[16px]">Your cart is empty.</p>
              <button
                onClick={() => {
                  navigate("/shop");
                  setIsCartOpen(false);
                }}
                className="px-5 py-2 rounded-lg font-medium  border-black bg-[#111] text-white  text-[16px]  hover:bg-white hover:text-black 
                transition-colors duration-500  shadow-md border-2 mt-3"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-[100px] h-[120px] object-cover bg-gray-50 rounded shadow-md hover:scale-105 transition-transform border-2 border-zinc-400"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[16px] text-gray-900 font-semibold">
                      {item.name}
                    </h3>
                    <div className="text-[13px] text-black mt-1 font-medium">
                      Color: {item.color} | Material: {item.material}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Control */}
                    <div className="flex items-center border-2 border-zinc-400 rounded overflow-hidden h-[30px] w-[80px]">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.material,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="flex-1 hover:bg-gray-100 text-gray-600 "
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-6 text-center text-[13px] outline-none font-bold"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.material,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="flex-1 hover:bg-gray-100 text-gray-600"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[16px] text-gray-900 font-medium">
                      {item.price}
                    </span>
                  </div>
                  <RiDeleteBin2Line
                    onClick={() =>
                      removeFromCart(item.id, item.material, item.color)
                    }
                    className="text-[20px] text-gray-500 underline text-left mt-2 hover:text-red-500 w-fit"
                  ></RiDeleteBin2Line>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subtotal, Free Shipping, Buttons*/}
        {cartItems.length > 0 && (
          <div className="p-6 border-t-2 border-zinc-400 bg-gray-50 mt-auto shadow-[0_-5px_8px_-2px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[18px] font-medium text-gray-900">
                Subtotal:
              </span>
              <span className="text-[18px] font-semibold text-gray-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="mb-6">
              <p className="text-[13px] text-black mb-2">
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add{" "}
                    <span className="font-medium text-black">
                      ${remainingForFreeShipping.toFixed(2)}
                    </span>{" "}
                    to cart and get Free shipping!
                  </>
                ) : (
                  <span className="text-green-600 font-medium text-[13px]">
                    Congratulations! You've got free shipping!
                  </span>
                )}
              </p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7ed40c] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (onNavigate) {
                    onNavigate("/cart");
                  } else {
                    navigate("/cart");
                  }
                }}
                className="w-full py-2.5 border-2 border-black text-black font-medium text-[16px] rounded-lg hover:bg-black hover:text-white transition-colors
                duration-500 hover:shadow-lg"
              >
                View Cart
              </button>
              <button
                onClick={() => {
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
                            Please login to proceed to checkout!
                          </span>
                        </div>
                      ),
                      { position: "top-right", duration: 3000 }
                    );

                    return;
                  }
                  setIsCartOpen(false);
                  if (onNavigate) {
                    onNavigate("/checkout");
                  } else {
                    navigate("/checkout");
                  }
                }}
                className="w-full py-2.5 border-2 border-black bg-[#111] text-white font-medium text-[16px] rounded-lg hover:bg-white hover:text-black 
                transition-colors duration-500 hover:shadow-lg"
              >
                Check Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

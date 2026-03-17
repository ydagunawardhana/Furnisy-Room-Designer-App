import React, { createContext, useState, useContext, useEffect } from "react";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const clearCart = () => setCartItems([]);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("furnisy_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  const fetchAddresses = async (user) => {
    const q = collection(db, "users", user.uid, "addresses");
    const querySnapshot = await getDocs(q);
    const addrs = [];
    querySnapshot.forEach((doc) => addrs.push(doc.data()));

    setSavedAddresses(addrs);
    if (addrs.length > 0) {
      setSelectedAddress(addrs[0]);
    } else {
      setSelectedAddress(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAddresses(user);
      } else {
        setSavedAddresses([]);
        setSelectedAddress(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("furnisy_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Address Save / Update Function
  const saveAddress = async (addressData) => {
    if (!auth.currentUser) return;
    const addrRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "addresses",
      addressData.id.toString()
    );
    await setDoc(addrRef, addressData);
    await fetchAddresses(auth.currentUser);
  };

  // Address  Function
  const deleteAddress = async (id) => {
    if (!auth.currentUser) return;
    await deleteDoc(
      doc(db, "users", auth.currentUser.uid, "addresses", id.toString())
    );
    await fetchAddresses(auth.currentUser);
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <ErrorIcon size={20} className="text-red-400" />
          <span className="text-[14px] font-medium">Address removed!</span>
        </div>
      ),
      { position: "top-right", duration: 2000 }
    );
  };

  const addToCart = (
    product,
    quantity,
    material,
    color,
    openDrawer = true,
    showToast = true
  ) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.material === material &&
          item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
          item.material === material &&
          item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, material, color }];
    });

    if (showToast) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              Product added to Cart!
            </span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    }

    if (openDrawer) setIsCartOpen(true);
  };

  const removeFromCart = (id, material, color, showToast = true) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.material === material &&
            item.color === color
          )
      )
    );

    if (showToast) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Product removed from Cart!
            </span>
          </div>
        ),
        { position: "top-right", duration: 2000 }
      );
    }
  };

  const updateQuantity = (
    id,
    material,
    color,
    newQuantity,
    showToast = true
  ) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.material === material && item.color === color
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    if (showToast) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">Cart updated!</span>
          </div>
        ),
        { position: "top-right", duration: 1000 }
      );
    }
  };

  const totalItems = cartItems.length;
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = parseFloat(item.price.replace("$", ""));
    return total + itemPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        savedAddresses,
        setSavedAddresses,
        selectedAddress,
        setSelectedAddress,
        clearCart,
        saveAddress,
        deleteAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

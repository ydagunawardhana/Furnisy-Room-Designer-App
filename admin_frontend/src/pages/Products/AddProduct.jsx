import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon, TrashBinIcon } from "../../icons";
import { FaSpinner, FaCube } from "react-icons/fa";
import toast from "react-hot-toast";
import { TiPlus } from "react-icons/ti";

// Firebase Imports
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

const AddProduct = () => {
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    badge: "",
    category: "Living Room",
    material: "",
    desc: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [modelPreviewName, setModelPreviewName] = useState("");
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [modelToUpload, setModelToUpload] = useState(null);

  const [availableColors, setAvailableColors] = useState([
    "#000000",
    "#ffffff",
    "#8B4513",
    "#D1D5DB",
  ]);
  const [newColor, setNewColor] = useState("#ff7f50");
  const [loading, setLoading] = useState(false);

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setImagesToUpload([...imagesToUpload, ...files]);
    const previews = await Promise.all(
      files.map((file) => readFileAsDataUrl(file))
    );
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    setImagesToUpload(imagesToUpload.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (["glb", "gltf"].includes(extension)) {
      setModelToUpload(file);
      setModelPreviewName(file.name);
    } else {
      toast.error("Invalid 3D file type. Please upload a .glb or .gltf file.");
      e.target.value = null;
      setModelPreviewName("");
    }
  };

  const removeModel = () => {
    setModelToUpload(null);
    setModelPreviewName("");
  };

  const addNewColor = () => {
    if (!availableColors.includes(newColor)) {
      setAvailableColors([...availableColors, newColor]);
      toast.success("Color added!");
    } else {
      toast.error("Color already exists.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!productData.name || !productData.price || imagePreviews.length === 0) {
      toast.error("Please fill in required fields and add at least one image.");
      setLoading(false);
      return;
    }

    try {
      toast.loading("Uploading images...", { id: "uploadToast" });

      let uploadedImageUrls = [];
      const imgBBApiKey = "714ffa9ca6f167058702c8b37ac27191";
      for (const file of imagesToUpload) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgBBApiKey}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.success) {
          uploadedImageUrls.push(data.data.url);
        }
      }

      toast.loading("Saving product to database...", { id: "uploadToast" });

      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);
      let maxId = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id && typeof data.id === "number" && data.id > maxId) {
          maxId = data.id;
        }
      });
      const nextId = maxId + 1;

      await addDoc(productsRef, {
        id: nextId,
        name: productData.name,
        price: `$${productData.price}`,
        badge: productData.badge,
        category: productData.category,
        material: productData.material,
        colors: availableColors,
        desc: productData.desc,
        stockStatus: "In Stock",
        img: uploadedImageUrls[0] || "",
        images: uploadedImageUrls,
        modelPath: modelPreviewName ? `/models/${modelPreviewName}` : "",
        createdAt: new Date().getTime(),
      });

      toast.success("Product added successfully!", { id: "uploadToast" });
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Try again.", { id: "uploadToast" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add New Product
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/products"
            className="px-5 py-2 rounded-xl border-2 border-zinc-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="animate-spin size-4" />
            ) : (
              <TiPlus className="size-4" />
            )}
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image and Model Upload */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Images
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Add at least one image. The first image will be the main shop
              image.
            </p>

            <div className="flex flex-col gap-4">
              {/* Dropzone */}
              <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <TiPlus className="mb-3 size-8 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500">
                    Drop or select image(s)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 size-5 bg-white/70 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3D Model */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add 3D Model
            </h3>
            <div className="flex flex-col gap-4">
              <label className="flex h-20 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50">
                <FaCube className="size-6 text-gray-400" />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-500">
                    Select GLB/GLTF model
                  </p>
                  <p className="text-xs text-gray-400">Add to Room Designer</p>
                </div>
                <input
                  type="file"
                  accept=".glb, .gltf"
                  onChange={handleModelChange}
                  className="hidden"
                />
              </label>

              {modelPreviewName && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <FaCube className="size-5 text-zinc-500" />
                  <span className="text-xs font-mono text-zinc-800 flex-1 truncate">
                    {modelPreviewName}
                  </span>
                  <button
                    type="button"
                    onClick={removeModel}
                    className="size-5 bg-white hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center"
                  >
                    <TrashBinIcon className="size-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Text Details */}
        <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            Product Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                placeholder="E.g., Comfortable Sofa"
                required
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                placeholder="E.g., 599.00"
                required
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Badge (Optional)
              </label>
              <input
                type="text"
                name="badge"
                value={productData.badge}
                onChange={handleInputChange}
                placeholder="E.g., New, Sale, Featured"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                required
                className="input-field cursor-pointer"
              >
                <option value="Living Room">Living Room</option>
                <option value="Bed Room">Bed Room</option>
                <option value="Office">Office</option>
                <option value="Accessories">Accessories</option>
                <option value="Decoration">Decoration</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                Material (Optional)
              </label>
              <input
                type="text"
                name="material"
                value={productData.material}
                onChange={handleInputChange}
                placeholder="E.g., Wood, Fabric, Leather"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800 mb-1">
                Available Colors
              </label>
              <div className="flex items-center gap-3">
                {availableColors.map((color, index) => (
                  <div
                    key={index}
                    className="size-8 rounded-full border border-gray-200 shadow-inner"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="size-8 p-0 border-none rounded-md cursor-pointer bg-transparent"
                />
                <button
                  type="button"
                  onClick={addNewColor}
                  className="px-3 py-2 bg-gray-100 border-2 hover:bg-gray-200 text-gray-700 text-[14px] font-semibold rounded-lg flex items-center gap-2"
                >
                  <TiPlus className="size-3" /> Add color
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-800">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="desc"
                value={productData.desc}
                onChange={handleInputChange}
                rows="6"
                placeholder="Describe the product, its key features, and specifications..."
                required
                className="input-field resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background-color: #fcfcfc;
          font-size: 14px;
          color: #374151;
          outline: none;
          transition: all 0.2s ease-in-out;
        }
        .input-field:focus {
          background-color: #fff;
          border-color: #000;
          box-shadow: 0 0 0 1px #000;
        }
      `}</style>
    </div>
  );
};

export default AddProduct;

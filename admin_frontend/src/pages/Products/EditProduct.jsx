import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaSpinner, FaCube } from "react-icons/fa";
import { TiPlus } from "react-icons/ti";
import toast from "react-hot-toast";

// Firebase Imports
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Product Details State
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    badge: "",
    category: "Living Room",
    material: "",
    desc: "",
    stockStatus: "In Stock",
  });

  // Images State
  const [existingImages, setExistingImages] = useState([]);
  const [newImagesToUpload, setNewImagesToUpload] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // 3D Model State
  const [modelPreviewName, setModelPreviewName] = useState("");
  const [modelToUpload, setModelToUpload] = useState(null);

  // Colors State
  const [availableColors, setAvailableColors] = useState([]);
  const [newColor, setNewColor] = useState("#ff7f50");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("id", "==", Number(id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const product = docSnap.data();

          setDocId(docSnap.id);

          setProductData({
            name: product.name || "",
            price: product.price ? product.price.replace("$", "") : "",
            badge: product.badge || "",
            category: product.category || "Living Room",
            material:
              product.material ||
              (product.materials && product.materials[0]) ||
              "",
            desc: product.desc || product.description || "",
            stockStatus: product.stockStatus || "In Stock",
          });

          const fetchedImages =
            product.images && product.images.length > 0
              ? product.images
              : product.img
              ? [product.img]
              : [];
          setExistingImages(fetchedImages);

          setAvailableColors(product.colors || []);

          if (product.modelPath) {
            const modelName = product.modelPath.split("/").pop();
            setModelPreviewName(modelName);
          }
        } else {
          toast.error("Product not found!");
          navigate("/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details.");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate]);

  // --- Helper: Read File as Base64 ---
  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setNewImagesToUpload([...newImagesToUpload, ...files]);
    const previews = await Promise.all(
      files.map((file) => readFileAsDataUrl(file))
    );
    setNewImagePreviews([...newImagePreviews, ...previews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImagesToUpload(newImagesToUpload.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const extension = file.name.split(".").pop().toLowerCase();
    if (["glb", "gltf"].includes(extension)) {
      setModelToUpload(file);
      setModelPreviewName(file.name);
    } else {
      toast.error("Invalid 3D file type.");
      e.target.value = null;
    }
  };

  const removeModel = () => {
    setModelToUpload(null);
    setModelPreviewName("");
  };

  const addNewColor = () => {
    if (!availableColors.includes(newColor)) {
      setAvailableColors([...availableColors, newColor]);
    } else {
      toast.error("Color already exists.");
    }
  };

  const removeColor = (colorToRemove) => {
    setAvailableColors(availableColors.filter((c) => c !== colorToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docId) return;
    setLoading(true);

    if (
      !productData.name ||
      !productData.price ||
      (existingImages.length === 0 && newImagesToUpload.length === 0)
    ) {
      toast.error(
        "Please fill in required fields and ensure at least one image exists."
      );
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrls = [];

      if (newImagesToUpload.length > 0) {
        toast.loading("Uploading new images...", { id: "updateToast" });
        const imgBBApiKey = "714ffa9ca6f167058702c8b37ac27191";

        for (const file of newImagesToUpload) {
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
      }

      toast.loading("Updating product details...", { id: "updateToast" });

      const finalImagesList = [...existingImages, ...uploadedImageUrls];

      const docRef = doc(db, "products", docId);
      await updateDoc(docRef, {
        name: productData.name,
        price: `$${productData.price}`,
        badge: productData.badge,
        category: productData.category,
        material: productData.material,
        materials: [productData.material],
        colors: availableColors,
        desc: productData.desc,
        stockStatus: productData.stockStatus,
        img: finalImagesList[0] || "",
        images: finalImagesList,
        modelPath: modelPreviewName ? `/models/${modelPreviewName}` : "",
      });

      toast.success("Product updated successfully!", { id: "updateToast" });
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.", { id: "updateToast" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-3xl text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Edit Product
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
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image and Model Upload */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Images
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Manage product gallery. The first image will be the main shop
              image.
            </p>

            <div className="flex flex-col gap-4">
              {/* Dropzone */}
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="text-5xl text-gray-400 mb-1">+</span>
                  <p className="text-xs font-semibold text-gray-500">
                    Drop or select new image(s)
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

              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {existingImages.map((imgUrl, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group rounded-xl border border-gray-200 overflow-hidden aspect-square flex items-center justify-center bg-gray-50"
                    >
                      <img
                        src={imgUrl}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-br-lg">
                        Saved
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 size-5 bg-white/90 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-2xl font-bold">×</span>
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group rounded-xl border border-blue-200 overflow-hidden aspect-square flex items-center justify-center bg-blue-50/30"
                    >
                      <img
                        src={preview}
                        alt={`New Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 left-0 bg-blue-500/80 text-white text-[9px] px-1.5 py-0.5 rounded-br-lg">
                        New
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 size-5 bg-white/90 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-2xl font-bold">×</span>
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
              3D Model
            </h3>
            <div className="flex flex-col gap-4">
              <label className="flex h-20 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50">
                <FaCube className="size-6 text-gray-400" />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-500">
                    Select GLB/GLTF model
                  </p>
                  <p className="text-xs text-gray-400">
                    Update Room Designer File
                  </p>
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
                  <span className="text-xs font-mono text-zinc-800 flex-1 truncate hover:zinc-100">
                    {modelPreviewName}
                  </span>
                  <button
                    type="button"
                    onClick={removeModel}
                    className="size-5 bg-white hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-gray-200"
                  >
                    <span className="text-2xl font-bold">×</span>
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
              <label className="text-sm font-semibold text-gray-800">
                Stock Status <span className="text-red-500">*</span>
              </label>
              <select
                name="stockStatus"
                value={productData.stockStatus}
                onChange={handleInputChange}
                required
                className="input-field cursor-pointer"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2">
              <label className="text-sm font-semibold text-gray-800 mb-1">
                Available Colors
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {availableColors.map((color, index) => (
                  <div
                    key={index}
                    className="relative group size-8 rounded-full border border-gray-200 shadow-inner"
                    style={{ backgroundColor: color }}
                  >
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="absolute -top-2 -right-2 size-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[16px]"
                    >
                      ×
                    </button>
                  </div>
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
                  className="px-3 py-1.5 bg-gray-100 border-2 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg flex items-center gap-2"
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
                placeholder="Describe the product..."
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

export default EditProduct;

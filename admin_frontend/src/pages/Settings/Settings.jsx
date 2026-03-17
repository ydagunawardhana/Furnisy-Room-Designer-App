import { useState, useEffect, useRef } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

// Firebase Imports
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [settingsData, setSettingsData] = useState({
    storeName: "Furnisy Furniture Store",
    supportEmail: "support@furnisy.com",
    contactPhone: "+94 77 123 4567",
    currency: "USD",
    shippingFee: "15.00",
    facebookUrl: "https://facebook.com/furnisystore",
    instagramUrl: "https://instagram.com/furnisystore",
    logoUrl: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [newLogoFile, setNewLogoFile] = useState(null);

  const currencyOptions = [
    { value: "USD", label: "USD ($)" },
    { value: "LKR", label: "LKR (Rs)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettingsData((prev) => ({
            ...prev,
            ...data,
          }));
          setLogoPreview(data.logoUrl || "");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setSettingsData((prev) => ({ ...prev, currency: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    toast.loading("Saving settings...", { id: "settingsToast" });

    try {
      let finalLogoUrl = settingsData.logoUrl;

      // ImgBB Upload
      if (newLogoFile) {
        toast.loading("Uploading new logo...", { id: "settingsToast" });
        const imgBBApiKey = "714ffa9ca6f167058702c8b37ac27191";
        const formData = new FormData();
        formData.append("image", newLogoFile);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${imgBBApiKey}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.success) {
          finalLogoUrl = data.data.url;
        }
      }

      const docRef = doc(db, "settings", "general");
      await setDoc(docRef, {
        ...settingsData,
        logoUrl: finalLogoUrl,
        updatedAt: new Date().toISOString(),
      });

      setSettingsData((prev) => ({ ...prev, logoUrl: finalLogoUrl }));
      setNewLogoFile(null);

      toast.success("Settings saved successfully!", { id: "settingsToast" });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.", { id: "settingsToast" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            System Settings
          </h1>
        </div>

        <div className="max-w-8xl w-full">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-white/[0.05] dark:bg-white/[0.03] sm:p-8">
            <form onSubmit={handleSave} className="space-y-8">
              {/* General Information Section */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 pb-2">
                  General Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      placeholder="Enter store name"
                      value={settingsData.storeName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      placeholder="support@example.com"
                      value={settingsData.supportEmail}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+94 123456789"
                      value={settingsData.contactPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Store Configurations Section */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 pb-2">
                  Store Configurations
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label>Default Currency</Label>
                    <Select
                      options={currencyOptions}
                      defaultValue={settingsData.currency}
                      onChange={handleSelectChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingFee">Standard Shipping Fee</Label>
                    <Input
                      id="shippingFee"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 15.00"
                      value={settingsData.shippingFee}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links Section */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 pb-2">
                  Social Media Links
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      placeholder="https://facebook.com/yourstore"
                      value={settingsData.facebookUrl}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      placeholder="https://instagram.com/yourstore"
                      value={settingsData.instagramUrl}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Store Logo Section */}
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100">
                  Store Logo
                </h2>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center mt-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Store Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-xs font-bold text-gray-400">
                        NO LOGO
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label>Upload New Logo</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Choose File
                      </button>
                      <span className="text-sm text-gray-500">
                        {newLogoFile ? newLogoFile.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Recommended size: 200x200px. PNG, JPG or SVG up to 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end border-t border-gray-100 dark:border-white/[0.05]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 bg-blue-500 hover:bg-blue-700"
                >
                  {saving && <FaSpinner className="animate-spin" />}
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

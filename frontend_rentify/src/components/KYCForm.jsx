import React, { useState, useEffect, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import logo from "/logo.png"; // Replace with your logo path
import axios from "axios";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { AuthContext } from "../Contexts/AuthProvider"; // Import AuthContext

const KYCForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const axiosPublic = useAxiosPublic();

  // Access user data from AuthContext
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    permanentAddress: {
      province: "",
      district: "",
      ward: "",
    },
    temporaryAddress: {
      province: "",
      district: "",
      ward: "",
    },
    documents: [], // For file uploads
  });

  const [loading, setLoading] = useState(false); // Loading state for submission
  const [error, setError] = useState(""); // Error state for submission

  // Populate formData with user data when the component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        firstName: user.displayName?.split(" ")[0] || "", // Extract first name
        lastName: user.displayName?.split(" ")[1] || "", // Extract last name
        email: user.email || "", // Use user's email
      }));
    }
  }, [user]);

  const handleNext = () => setStep(step + 1);
  const handlePrevious = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (e, addressType) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [addressType]: {
        ...formData[addressType],
        [name]: value,
      },
    });
  };

  const handleCopyAddress = () => {
    setFormData({
      ...formData,
      temporaryAddress: { ...formData.permanentAddress },
    });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      setFormData({
        ...formData,
        documents: fileList,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.documents.length === 0) {
        setError("Please upload at least one document.");
        setLoading(false);
        return;
      }

      // Upload all documents one by one
      const uploadedImages = await Promise.all(
        formData.documents.map(async (file) => {
          const formDataToSend = new FormData();
          formDataToSend.append("image", file);

          const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload", formDataToSend, {
            params: { key: import.meta.env.VITE_IMAGE_HOSTING_KEY },
          });

          return imgbbResponse.data.success ? imgbbResponse.data.data.url : null;
        })
      );

      if (uploadedImages.includes(null)) {
        setError("Some documents failed to upload. Please try again.");
        setLoading(false);
        return;
      }

      // Prepare KYC data for backend
      const kycData = {
        ...formData,
        documentUrls: uploadedImages,
      };

      console.log("Payload being sent to backend:", kycData); // Log the payload

      // Send KYC data to backend
      const backendResponse = await axiosPublic.post("/kyc", kycData);

      if (backendResponse.status === 201) {
        navigate("/");
      } else {
        setError("Error submitting KYC. Please try again.");
      }
    } catch (error) {
      console.error("Error during KYC submission:", error);
      console.error("Backend response:", error.response?.data); // Log the full response
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 relative">
        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>

        {/* Logo and Heading */}
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">KYC Verification</h1>
          <p className="text-gray-600">Step {step} of 3</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Personal Details</h2>
              <p className="text-gray-600">
                Please type carefully and fill out the form with your personal details. You can’t
                edit these details once you submit the form.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    required
                    disabled // Disable editing
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    required
                    disabled // Disable editing
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    required
                    disabled // Disable editing
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Address Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Address Details</h2>
              <p className="text-gray-600">
                Please provide your permanent and temporary address details.
              </p>

              {/* Permanent Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province *</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.permanentAddress.province}
                      onChange={(e) => handleAddressChange(e, "permanentAddress")}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District *</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.permanentAddress.district}
                      onChange={(e) => handleAddressChange(e, "permanentAddress")}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ward *</label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.permanentAddress.ward}
                      onChange={(e) => handleAddressChange(e, "permanentAddress")}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Temporary Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Temporary Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province *</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.temporaryAddress.province}
                      onChange={(e) => handleAddressChange(e, "temporaryAddress")}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District *</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.temporaryAddress.district}
                      onChange={(e) => handleAddressChange(e, "temporaryAddress")}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ward *</label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.temporaryAddress.ward}
                      onChange={(e) => handleAddressChange(e, "temporaryAddress")}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Copy Permanent Address
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: File Upload */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Document Upload</h2>
              <p className="text-gray-600">
                Please upload a valid image document (ID card, passport, etc.).
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full p-2 mt-4 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                required
              />
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default KYCForm;
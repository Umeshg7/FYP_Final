import React, { useState, useEffect, useContext } from "react";
import { FaHome, FaBuilding, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import logo from "/logo.png";
import axios from "axios";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { AuthContext } from "../Contexts/AuthProvider";

const KYCForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const axiosPublic = useAxiosPublic();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    documentNumber: "",
    dateOfBirth: "",
    permanentAddress: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
    },
    temporaryAddress: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
    },
    documents: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kycStatus, setKycStatus] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [showForm, setShowForm] = useState(true);

  // Check existing KYC status on load
  useEffect(() => {
    if (user?.uid) {
      checkKYCStatus(user.uid);
      setFormData(prev => ({
        ...prev,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email || "",
        userId: user.uid 
      }));
    }
  }, [user]);

  const checkKYCStatus = async (userId) => {
    try {
      const response = await axiosPublic.get(`/kyc/${userId}/status`);
      setKycStatus(response.data.data.status);
      setAdminFeedback(response.data.data.adminFeedback || "");
  
      if (response.data.data.status === "NEEDS_CORRECTION") {
        const kycDetails = await axiosPublic.get(`/kyc/${userId}`);
        setFormData(prev => ({
          ...prev,
          ...kycDetails.data.data,
          documents: [] 
        }));
        setShowForm(false);
      } else if (["APPROVED", "REJECTED", "PENDING"].includes(response.data.data.status)) {
        setShowForm(false);
      } else {
        setShowForm(true);
      }
    } catch (error) {
      console.log("No existing KYC found - showing form");
      setShowForm(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.phoneNumber) {
        setError("Phone number is required");
        return;
      }
    }
    setStep(step + 1);
  };

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
  
      // Upload documents (unchanged)
      const uploadedImages = await Promise.all(
        formData.documents.map(async (file) => {
          const formDataToSend = new FormData();
          formDataToSend.append("image", file);
          const response = await axios.post(
            "https://api.imgbb.com/1/upload", 
            formDataToSend,
            { params: { key: import.meta.env.VITE_IMAGE_HOSTING_KEY } }
          );
          return response.data.data.url;
        })
      );
  
      // Prepare submission data matching backend schema
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        documentNumber: formData.documentNumber,
        dateOfBirth: formData.dateOfBirth,
        permanentAddress: formData.permanentAddress,
        temporaryAddress: formData.temporaryAddress,
        documentUrls: uploadedImages,
        status: "PENDING",
        userId: user.uid
      };  
      // POST to /kyc endpoint
      const response = await axiosPublic.post(`/kyc/${user.uid}`, submissionData);
      
      if (response.status === 200 || response.status === 201) {
        navigate("/kycstatus", {
          state: { 
            message: kycStatus === "NEEDS_CORRECTION" 
              ? "KYC updated successfully!" 
              : "KYC submitted successfully!"
          }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Render KYC status view if not showing form
  if ((kycStatus === "APPROVED" || kycStatus === "REJECTED" || kycStatus === "PENDING") && !showForm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">KYC Status: {kycStatus}</h2>
          {kycStatus === "REJECTED" && adminFeedback && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="font-semibold text-red-800">Admin Feedback:</h3>
              <p className="text-red-700">{adminFeedback}</p>
            </div>
          )}
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  // Needs correction screen
  if (kycStatus === "NEEDS_CORRECTION" && !showForm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">
            KYC Needs Correction
          </h2>
          {adminFeedback && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <h3 className="font-semibold text-yellow-800">Admin Feedback:</h3>
              <p className="text-yellow-700">{adminFeedback}</p>
            </div>
          )}
          <button
            onClick={() => {
              setShowForm(true);
              setStep(1);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit and Resubmit
          </button>
          <button
            onClick={() => navigate("/")}
            className="ml-4 px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  // Render the KYC form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>

        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">
            {kycStatus === "NEEDS_CORRECTION" ? "Update KYC Information" : "KYC Verification"}
          </h1>
          <p className="text-gray-600">Step {step} of 3</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Personal Details</h2>
              
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
                    disabled
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
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                    required
                    disabled
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

              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                  onClick={handlePrevious}
                  disabled={step === 1}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleNext}
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
    
    {/* Permanent Address Section */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <FaHome className="mr-2 text-blue-600" />
        Permanent Address *
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <input
            type="text"
            name="province"
            value={formData.permanentAddress.province}
            onChange={(e) => handleAddressChange(e, "permanentAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <input
            type="text"
            name="district"
            value={formData.permanentAddress.district}
            onChange={(e) => handleAddressChange(e, "permanentAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Municipality</label>
          <input
            type="text"
            name="municipality"
            value={formData.permanentAddress.municipality}
            onChange={(e) => handleAddressChange(e, "permanentAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <input
            type="number"
            name="ward"
            value={formData.permanentAddress.ward}
            onChange={(e) => handleAddressChange(e, "permanentAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
    </div>

    {/* Temporary Address Section */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <FaBuilding className="mr-2 text-blue-600" />
          Temporary Address
        </h3>
        <label className="flex items-center text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={
              formData.permanentAddress.province === formData.temporaryAddress.province &&
              formData.permanentAddress.district === formData.temporaryAddress.district &&
              formData.permanentAddress.municipality === formData.temporaryAddress.municipality &&
              formData.permanentAddress.ward === formData.temporaryAddress.ward
            }
            onChange={handleCopyAddress}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          Same as Permanent Address
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <input
            type="text"
            name="province"
            value={formData.temporaryAddress.province}
            onChange={(e) => handleAddressChange(e, "temporaryAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={formData.permanentAddress.province === formData.temporaryAddress.province &&
              formData.permanentAddress.district === formData.temporaryAddress.district &&
              formData.permanentAddress.municipality === formData.temporaryAddress.municipality &&
              formData.permanentAddress.ward === formData.temporaryAddress.ward}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <input
            type="text"
            name="district"
            value={formData.temporaryAddress.district}
            onChange={(e) => handleAddressChange(e, "temporaryAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={formData.permanentAddress.province === formData.temporaryAddress.province &&
              formData.permanentAddress.district === formData.temporaryAddress.district &&
              formData.permanentAddress.municipality === formData.temporaryAddress.municipality &&
              formData.permanentAddress.ward === formData.temporaryAddress.ward}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Municipality</label>
          <input
            type="text"
            name="municipality"
            value={formData.temporaryAddress.municipality}
            onChange={(e) => handleAddressChange(e, "temporaryAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={formData.permanentAddress.province === formData.temporaryAddress.province &&
              formData.permanentAddress.district === formData.temporaryAddress.district &&
              formData.permanentAddress.municipality === formData.temporaryAddress.municipality &&
              formData.permanentAddress.ward === formData.temporaryAddress.ward}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <input
            type="number"
            name="ward"
            value={formData.temporaryAddress.ward}
            onChange={(e) => handleAddressChange(e, "temporaryAddress")}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={formData.permanentAddress.province === formData.temporaryAddress.province &&
              formData.permanentAddress.district === formData.temporaryAddress.district &&
              formData.permanentAddress.municipality === formData.temporaryAddress.municipality &&
              formData.permanentAddress.ward === formData.temporaryAddress.ward}
          />
        </div>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex justify-between pt-4">
      <button
        type="button"
        onClick={handlePrevious}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Next
        <FaArrowRight className="ml-2" />
      </button>
    </div>
  </div>
)}

          {/* Step 3: Document Upload */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Document Upload</h2>
              <div>
              <label className="block text-sm font-medium text-gray-700">Document No.*</label>
              <input
                type="tel"
                name="documentNumber" // Must match state key
                value={formData.documentNumber}
                onChange={handleInputChange} // Now defined!
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Documents *</label>
                <input
                  type="file"
                  name="documents"
                  multiple
                  onChange={handleFileChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                  required
                />
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
                  type="submit"
                  className="px-6 py-2 bg-purple text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
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
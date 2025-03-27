import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { AuthContext } from "../Contexts/AuthProvider";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const ItemDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);

  const handleNavigateToProducts = () => {
    navigate("/rent");
  };
  const handleRentNow = () => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to make a booking",
      });
      return;
    }
    navigate(`/book/${id}`); // Navigate to new booking page
  };

  // Fetch product details and owner information
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch product details
        const productResponse = await axiosSecure.get(`/rent/item/${id}`);
        setProduct(productResponse.data);

        // Fetch owner information if userId exists
        if (productResponse.data?.userId) {
          try {
            const ownerResponse = await axiosSecure.get(`/users/${productResponse.data.userId}`);
            setOwnerInfo(ownerResponse.data?.data || null);
          } catch (ownerError) {
            console.error("Error fetching owner info:", ownerError);
            setOwnerInfo({
              name: productResponse.data.userName || "Owner",
              email: productResponse.data.userEmail || "No email provided",
              kycVerified: false
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load product details");
        Swal.fire({
          icon: "error",
          title: "Error loading data",
          text: "An error occurred while fetching product details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, axiosSecure]);

  // Navigate to previous image
  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  // Navigate to next image
  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Open modal with the selected image
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Fix image URL if needed
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400";
    // Fix common URL issues
    if (url.startsWith("http://")) url = url.replace("http://", "https://");
    if (!url.startsWith("http")) url = `https://${url}`;
    return url;
  };

  // Default owner info if not available
  const displayOwnerInfo = ownerInfo || {
    name: product?.userName || "Owner",
    email: product?.userEmail || "No email provided",
    photoURL: "",
    kycVerified: false
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:max-w-none lg:py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Image Section */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={
                    product.images?.length > 0
                      ? getImageUrl(product.images[currentImageIndex])
                      : "https://via.placeholder.com/400"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover object-center cursor-pointer"
                  onClick={() => product.images?.length > 0 && handleImageClick(product.images[currentImageIndex])}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400";
                  }}
                />
                
                {/* Navigation Arrows */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                      <FaArrowLeft />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                      <FaArrowRight />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col justify-center text-center lg:text-left w-full lg:w-1/2">
              <h2 className="text-3xl font-bold mb-4 flex items-center">
                {product.title}
              </h2>
              <p className="text-lg mb-4">{product.description}</p>

              <p className="font-bold text-xl text-red-600 mb-3">
                Price Per Day: NPR {product.pricePerDay}
              </p>

              <p className="text-gray-600">
                <strong>Category:</strong> {product.category}
              </p>
              <p className="text-gray-600">
                <strong>Location:</strong> {product.location}
              </p>
              <p className="text-gray-600">
                <strong>Owner Email:</strong> {displayOwnerInfo.email}
              </p>

              {/* Owner Profile Section */}
              <div 
                className="flex items-center mt-4 cursor-pointer" 
                onClick={() => product.userId && navigate(`/profile/${product.userId}`)}
              >
                <img
                  src={getImageUrl(displayOwnerInfo.photoURL)}
                  alt={displayOwnerInfo.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/100";
                  }}
                />
                <div>
                  <p className="text-lg font-semibold flex items-center">
                    {displayOwnerInfo.name}
                    {displayOwnerInfo.kycVerified && (
                      <span className="ml-1 text-purple" title="KYC Verified">
                        <MdVerified size={18} />
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {displayOwnerInfo.kycVerified ? "Verified User" : "Unverified User"}
                  </p>
                </div>

              </div>
              <button
        onClick={handleRentNow}
        className="mt-6 bg-purple text-white px-3 py-3 rounded-lg hover:bg-purple-700 transition w-full"
      >
        Rent Now
      </button>
              <button
                onClick={handleNavigateToProducts}
                className="mt-6 bg-purple-yellow-gradient text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Browse More Listings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-4 rounded-lg max-w-4xl">
            <img
              src={getImageUrl(selectedImage)}
              alt="Selected"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800";
              }}
            />
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
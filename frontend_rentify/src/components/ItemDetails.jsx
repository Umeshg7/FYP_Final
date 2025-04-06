import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { AuthContext } from "../Contexts/AuthProvider";
import { FaArrowLeft, FaArrowRight, FaComment } from "react-icons/fa";
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
    navigate(`/book/${id}`);
  };

  // In your ItemDetails component
const handleChatNow = async (e) => {
  e.stopPropagation();
  
  if (!user) {
      Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login to start chatting",
      });
      return;
  }

  try {
      // Check if we have owner info
      if (!ownerInfo?.email) {
          throw new Error("Owner information not available");
      }

      // Don't allow chatting with yourself
      if (ownerInfo.email === user.email) {
          Swal.fire({
              icon: "error",
              title: "Can't chat with yourself",
              text: "You can't start a chat with yourself",
          });
          return;
      }

      // Create or get conversation
      const response = await axiosSecure.post("/messages/conversations", {
          participant1: user.email,
          participant2: ownerInfo.email,
          participant1Id: user.uid,
          participant2Id: product.userId
      });

      // Navigate to the chat page
      navigate(`/chat`);
  } catch (error) {
      console.error("Error starting chat:", error);
      Swal.fire({
          icon: "error",
          title: "Chat Error",
          text: "An error occurred while starting the chat",
      });
  }
};


  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productResponse = await axiosSecure.get(`/rent/item/${id}`);
        setProduct(productResponse.data);

        if (productResponse.data?.userId) {
          try {
            const ownerResponse = await axiosSecure.get(`/users/${productResponse.data.userId}`);
            setOwnerInfo(ownerResponse.data?.data || null);
          } catch (ownerError) {
            console.error("Error fetching owner info:", ownerError);
            setOwnerInfo({
              name: productResponse.data.userName || "Owner",
              email: productResponse.data.userEmail || "No email provided",
              kycVerified: false,
              photoURL: ""
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

  

  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };


  
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400";
    if (url.startsWith("http://")) url = url.replace("http://", "https://");
    if (!url.startsWith("http")) url = `https://${url}`;
    return url;
  };

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
              <div className="relative bg-grey1 rounded-lg overflow-hidden " 
                   style={{ height: "500px", width: "100%" }}>
                <div className="flex items-center justify-center h-full w-full">
                  <img
                    src={
                      product.images?.length > 0
                        ? getImageUrl(product.images[currentImageIndex])
                        : "https://via.placeholder.com/400"
                    }
                    alt={product.title}
                    className="max-h-full max-w-full object-contain p-4"
                    onClick={() => product.images?.length > 0 && handleImageClick(product.images[currentImageIndex])}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400";
                    }}
                  />
                </div>
                
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
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col justify-center text-center lg:text-left w-full lg:w-1/2">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center lg:justify-start">
                {product.title}
              </h2>
              <p className="text-lg mb-6 text-gray-700">{product.description}</p>

              <div className="mb-6">
                <p className="font-bold text-2xl text-purple-600">
                  NPR {product.pricePerDay} <span className="text-lg">per day</span>
                </p>
              </div>

              <div className="space-y-3 mb-8 text-left">
                <p className="text-gray-700">
                  <span className="font-semibold">Category:</span> {product.category}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Location:</span> {product.location}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Owner Email:</span> {displayOwnerInfo.email}
                </p>
              </div>

              {/* Owner Profile Section with Chat Button */}
              <div className="flex items-center justify-between mb-8">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => product.userId && navigate(`/profile/${product.userId}`)}
                >
                  <img
                    src={getImageUrl(displayOwnerInfo.photoURL)}
                    alt={displayOwnerInfo.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-purple-100"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100";
                    }}
                  />
                  <div>
                    <p className="text-lg font-semibold flex items-center">
                      {displayOwnerInfo.name}
                      {displayOwnerInfo.kycVerified && (
                        <MdVerified className="ml-2 text-purple" size={20} />
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Chat Now Button */}
                <button
                  onClick={handleChatNow}
                  className="flex items-center gap-2 bg-white text-purple px-4 py-2 rounded-full border-2 border-purple shadow-md hover:shadow-lg transition-all"
                  style={{
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                    borderRadius: "2rem 2rem 2rem 0"
                  }}
                >
                  <div className="bg-white text-purple p-1 rounded-full">
                    <FaComment />
                  </div>
                  <span>Chat Now</span>
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleRentNow}
                  className="bg-purple  text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Rent Now
                </button>
                <button
                  onClick={handleNavigateToProducts}
                  className="border border-purple text-purple  px-6 py-3 rounded-lg transition-colors"
                >
                  Browse More Listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4">
            <img
              src={getImageUrl(selectedImage)}
              alt="Selected"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800";
              }}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-purple text-white rounded-lg hover:bg-purple transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
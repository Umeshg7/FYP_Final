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
  const [reviews, setReviews] = useState([]);
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
      if (!ownerInfo?.email) {
        throw new Error("Owner information not available");
      }
  
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
        participant2: ownerInfo.email
      });
  
      // Navigate to the chat page
      navigate(`/chat/${response.data.conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      Swal.fire({
        icon: "error",
        title: "Chat Error",
        text: error.response?.data?.message || "An error occurred while starting the chat",
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

        // Fetch reviews
        const reviewsResponse = await axiosSecure.get(`/bookings/items/${id}/reviews`);
        setReviews(reviewsResponse.data.reviews || []);

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

  function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:max-w-none lg:py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Image Section */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative bg-grey1 rounded-lg overflow-hidden" 
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
                  className="bg-purple text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Rent Now
                </button>
                <button
                  onClick={handleNavigateToProducts}
                  className="border border-purple text-purple px-6 py-3 rounded-lg transition-colors"
                >
                  Browse More Listings
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
<div className="mt-16 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center">
        <svg 
          className="w-6 h-6 text-purple-600 mr-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        Customer Reviews
        <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {reviews.length}
        </span>
      </h3>
      {reviews.length > 0 && (
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-500 mr-2">Average:</span>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-gray-900 font-medium">
              {calculateAverageRating(reviews).toFixed(1)}
            </span>
            <span className="mx-1 text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      )}
    </div>
    
    {reviews.length === 0 ? (
      <div className="text-center py-12">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
          />
        </svg>
        <h4 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h4>
        <p className="mt-1 text-gray-500">Be the first to share your experience!</p>
      </div>
    ) : (
      <div className="space-y-6 divide-y divide-gray-200">
        {reviews.map((review, index) => (
          <div key={index} className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(review.renter.photoURL)}
                  alt={review.renter.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-100"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(review.renter.name) + "&background=random";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {review.renter.name}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{new Date(review.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
                
                <div className="mt-1 flex items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <svg
                      key={rating}
                      className={`h-5 w-5 ${rating <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="mt-2 text-gray-600">{review.comment}</p>
                
                {review.rentalPeriod && (
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Rented from {new Date(review.rentalPeriod.startDate).toLocaleDateString()} 
                      {' → '} 
                      {new Date(review.rentalPeriod.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
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
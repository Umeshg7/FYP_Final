import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { AuthContext } from "../Contexts/AuthProvider"; // Import the AuthContext

const ItemDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // To hold selected image for modal
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure(); // Use the secure axios instance
  const { user } = useContext(AuthContext); // Get user data from AuthContext

  const handleNavigateToProducts = () => {
    navigate("/rent");
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axiosSecure.get(`/rent/item/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        Swal.fire({
          icon: "error",
          title: "Error loading product",
          text: "An error occurred while fetching product details.",
        });
      }
    };

    fetchProductDetails();
  }, [id, axiosSecure]);

  // Open modal with the selected image
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Navigate to user profile
  const handleUserProfileClick = (userEmail) => {
    navigate(`/profile/${userEmail}`);
  };

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:max-w-none lg:py-16">
          {product ? (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Image Section */}
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={
                      product.images?.length > 0
                        ? product.images[0]
                        : "https://via.placeholder.com/400"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover object-center cursor-pointer"
                    onClick={() => handleImageClick(product.images[0])} // Open modal on click of the first image
                  />
                </div>
                {/* Image Gallery */}
                <div className="mt-4 flex space-x-4">
                  {product.images?.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-md cursor-pointer"
                      onClick={() => handleImageClick(image)} // Open modal for clicked image
                    />
                  ))}
                </div>
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col justify-center text-center lg:text-left w-full lg:w-1/2">
                <h2 className="text-3xl font-bold mb-4 flex items-center">
                  {product.title}
                  {product.adminVerified && (
                    <span className="ml-2 px-2 py-1 text-sm bg-purple text-white rounded">
                      Verified ✅
                    </span>
                  )}
                </h2>
                <p className="text-lg mb-4">{product.description}</p>

                {/* Price */}
                <p className="font-bold text-xl text-red-600 mb-3">
                  Price Per Day: NPR {product.pricePerDay}
                </p>

                {/* Additional Details */}
                <p className="text-gray-600">
                  <strong>Category:</strong> {product.category}
                </p>
                <p className="text-gray-600">
                  <strong>Location:</strong> {product.location}
                </p>
                <p className="text-gray-600">
                  <strong>Owner Email:</strong> {product.userEmail}
                </p>

                {/* User Profile Section */}
                <div className="flex items-center mt-4 cursor-pointer" onClick={() => handleUserProfileClick(product.userEmail)}>
                  <img
                    src={user?.photoURL || "https://via.placeholder.com/50"} // If user is authenticated, show their photoURL
                    alt={user?.displayName || "User Name"}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <p className="text-lg font-semibold">{user?.displayName || product.userName || "User Name"}</p>
                </div>

                {/* Navigation Button */}
                <button
                  onClick={handleNavigateToProducts}
                  className="mt-6 bg-purple-yellow-gradient text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Browse More Listings
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">Loading product details...</p>
          )}
        </div>
      </div>

      {/* Modal for image view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-4 rounded-lg">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-96 h-auto object-cover rounded-lg"
            />
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
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

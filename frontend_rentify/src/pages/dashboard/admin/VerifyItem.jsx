import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useNavigate } from "react-router-dom"; // Import useNavigate

const VerifyItem = () => {
  const axiosPublic = useAxiosPublic();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch items that need verification
  const fetchItems = async () => {
    try {
      const response = await axiosPublic.get("/rent/admin");
      // Filter only unverified items
      const pendingItems = response.data.filter(item => !item.adminVerified);
      setItems(pendingItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Error fetching items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle item verification (approve or reject)
  const handleVerification = async (itemId, status) => {
    try {
      const endpoint = status === "approve" ? `/rent/approve/${itemId}` : `/rent/reject/${itemId}`;
      const method = status === "approve" ? "patch" : "delete";
      await axiosPublic[method](endpoint);

      // Remove the verified/rejected item from the state
      setItems(prevItems => prevItems.filter(item => item._id !== itemId));

      setSuccessMessage(`Item has been ${status}d successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating item verification:", err);
      setError("Error updating item verification. Please check the backend.");
    }
  };

  // SweetAlert2 confirmation for approve/reject
  const confirmAction = (itemId, status) => {
    const actionText = status === "approve" ? "approve" : "reject";
    Swal.fire({
      title: `Are you sure you want to ${actionText} this item?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${actionText} it!`,
    }).then((result) => {
      if (result.isConfirmed) {
        handleVerification(itemId, status); // Proceed with the action
        Swal.fire({
          title: `${actionText}d!`,
          text: `The item has been ${actionText}d.`,
          icon: "success",
        });
      }
    });
  };

  // Navigate to item details page
  const handleViewDetails = (itemId) => {
    navigate(`/item/${itemId}`); // Navigate to the item details page with the item's ID
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between m-4">
        <h5>Verify Items</h5>
        <h5>Total Pending Items: {items.length}</h5>
      </div>

      {/* table */}
      <div>
        <div className="overflow-x-auto">
          <table className="table table-zebra md:w-[870px]">
            {/* head */}
            <thead className="bg-purple text-white rounded-lg">
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>User Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item._id} onClick={() => handleViewDetails(item._id)}> {/* Add click handler */}
                  <th>{index + 1}</th>
                  <td>
                    <img
                      src={item.images[0] || "default-image.jpg"}
                      alt={item.title || "Image not available"}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>NPR {item.pricePerDay}</td>
                  <td>{item.userEmail}</td>
                  <td>
                    <button
                      onClick={() => confirmAction(item._id, "approve")}
                      className="btn btn-xs btn-circle bg-green-500 text-white mr-2"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => confirmAction(item._id, "reject")}
                      className="btn btn-xs btn-circle bg-red-500 text-white"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-4">
                    No items pending verification.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifyItem;

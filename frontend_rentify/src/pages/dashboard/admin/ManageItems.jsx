import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ManageItems = () => {
  const axiosSecure = useAxiosSecure();
  const [rent, setRent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch Rent Items
  useEffect(() => {
    const fetchRentItems = async () => {
      try {
        const response = await axiosSecure.get("/rent");
        setRent(response.data);
      } catch (error) {
        console.error("Error fetching rent items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentItems();
  }, []);

  // Handle Delete Item
  const handleDeleteItem = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/rent/${item._id}`);
          if (res.status === 200) {
            setRent(rent.filter((r) => r._id !== item._id));
            Swal.fire("Deleted!", "Your item has been deleted.", "success");
          }
        } catch (error) {
          console.error("Error deleting item:", error);
          Swal.fire("Error!", "Failed to delete item.", "error");
        }
      }
    });
  };

  // Handle Edit Item
  const handleEditClick = (item) => {
    setEditingItem(item);
  };

  // Handle Update Item
  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedItem = {
      ...editingItem,
      title: e.target.title.value,
      pricePerDay: e.target.price.value,
      status: "pending_admin_verification", // Mark for admin re-verification
    };

    try {
      const response = await axiosSecure.put(`/rent/${editingItem._id}`, updatedItem);
      if (response.status === 200) {
        setRent(rent.map((item) => (item._id === editingItem._id ? updatedItem : item)));
        Swal.fire(
          "Updated!",
          "Item updated successfully. It will be verified by the admin.",
          "success"
        );
        setEditingItem(null); // Close modal
      }
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire("Error!", "Failed to update item.", "error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full md:w-[870px] px-4 mx-auto">
      <h2 className="text-2xl font-semibold my-4">
        Manage All <span className="text-green">Rent Items</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Item Name</th>
              <th>Price</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rent.map((item, index) => (
              <tr key={item._id}>
                <th>{index + 1}</th>
                <td>
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img src={item.images[0] || "default-image.jpg"} alt={item.title} />
                    </div>
                  </div>
                </td>
                <td>{item.title}</td>
                <td>NPR : {item.pricePerDay}</td>
                <td>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="btn btn-ghost btn-xs text-red"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <input
                type="text"
                name="title"
                defaultValue={editingItem.title}
                className="input input-bordered"
                required
              />
              <input
                type="number"
                name="price"
                defaultValue={editingItem.pricePerDay}
                className="input input-bordered"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;

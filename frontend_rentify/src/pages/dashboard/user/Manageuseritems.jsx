import React, { useContext, useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { AuthContext } from "../../../Contexts/AuthProvider";

const Manageuseritems = () => {
  const axiosSecure = useAxiosSecure();
  const [rent, setRent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const uid = user?.uid;

  // Fetch Rent Items for specific user
  useEffect(() => {
    const fetchRentItems = async () => {
      if (!uid) return;
      
      try {
        setLoading(true);
        const response = await axiosSecure.get(`/rent/user/${uid}`);
        setRent(response.data);
      } catch (error) {
        console.error("Error:", error.response?.data);
        Swal.fire("Error!", error.response?.data?.message || "Failed to fetch items.", "error");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRentItems();
  }, [uid, axiosSecure]);

  // Handle Delete Item
  const handleDeleteItem = (item, e) => {
    e.stopPropagation();
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
          console.error("Error:", error.response?.data);
          Swal.fire("Error!", error.response?.data?.message || "Failed to delete item.", "error");
        }
      }
    });
  };

  // Handle View Details
  const handleViewDetails = (id) => {
    console.log("View details for item:", id);
    // Implement your view details logic here
  };

  if (loading) return <div className="text-center py-8">Loading items...</div>;
  if (!uid) return <div className="text-center py-8">Please login to view your items</div>;
  if (rent.length === 0) return <div className="text-center py-8">No items found</div>;

  return (
    <div className="w-full px-4 mx-auto">
      <div className="flex items-center justify-between m-4">
        <h2 className="text-2xl font-semibold">My Rent Items</h2>
        <h4>Total Items: {rent.length}</h4>
      </div>

      {/* table */}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rent.map((item, index) => (
              <tr key={item._id} onClick={() => handleViewDetails(item._id)} className="hover:bg-gray-100 cursor-pointer">
                <th>{index + 1}</th>
                <td>
                  <img
                    src={item.images[0] || "default-image.jpg"}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </td>
                <td>{item.title}</td>
                <td>{item.category || "N/A"}</td>
                <td>NPR : {item.pricePerDay}</td>
                <td>
                  <button
                    onClick={(e) => handleDeleteItem(item, e)}
                    className="btn btn-circle btn-sm bg-red text-white"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Manageuseritems;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axiosSecure.get(`/rent/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedItem = {
        title: e.target.title.value,
        pricePerDay: e.target.price.value,
      };

      const response = await axiosSecure.put(`/rent/${id}`, updatedItem);
      if (response.status === 200) {
        Swal.fire(
          "Updated!",
          "Item updated successfully. It will be verified by the admin.",
          "success"
        );
        navigate("/dashboard/manageitems");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire("Error!", "Failed to update item.", "error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full md:w-[600px] px-4 mx-auto">
      <h2 className="text-2xl font-semibold my-4">Edit Item</h2>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          defaultValue={item.title}
          className="input input-bordered"
          required
        />
        <input
          type="number"
          name="price"
          defaultValue={item.pricePerDay}
          className="input input-bordered"
          required
        />
        <button type="submit" className="btn btn-primary">
          Update Item
        </button>
      </form>
    </div>
  );
};

export default EditItem;

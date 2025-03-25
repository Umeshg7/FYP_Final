import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select"; // Import React-Select
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAuth from "../../../hooks/useAuth";
import nepaliCities from "../../../nepaliCities"

const AddRentItem = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);

  const onSubmit = async (data) => {
    if (!user || !user.email) {
      setError("User is not logged in.");
      return;
    }

    // Prepare rent item data
    const rentItemData = {
      title: data.title,
      description: data.description,
      category: data.category,
      pricePerDay: data.pricePerDay,
      location: selectedCity ? selectedCity.value : "", // Use selected city
      userEmail: user.email,
      images: [],
    };

    try {
      const response = await axiosPublic.post("/rent", rentItemData);
      console.log("Item added successfully:", response.data);
      reset();
      setSelectedCity(null); // Reset city selection
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item.");
    }
  };

  return (
    <div className="w-full md:w-[870px] px-4 mx-auto">
      <h2 className="text-2xl font-semibold my-4">
        Upload A New <span className=" text-purple"> Item for Rent</span>
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Title*</span>
          </label>
          <input
            type="text"
            {...register("title", { required: true })}
            placeholder="Item Title"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description*</span>
          </label>
          <textarea
            {...register("description", { required: true })}
            className="textarea textarea-bordered h-24"
            placeholder="Describe your item"
          ></textarea>
        </div>

        <div className="flex items-center gap-4">
          <div className="form-control w-full my-6">
            <label className="label">
              <span className="label-text">Category*</span>
            </label>
            <select
              {...register("category", { required: true })}
              className="select select-bordered"
              defaultValue="default"
            >
              <option disabled value="default">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="vehicles">Vehicles</option>
              <option value="appliances">Appliances</option>
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Price per day*</span>
            </label>
            <input
              type="number"
              {...register("pricePerDay", { required: true })}
              placeholder="Price per day"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="form-control w-full my-6">
          <label className="label">
            <span className="label-text">Location*</span>
          </label>
          <Select
            options={nepaliCities}
            isSearchable
            placeholder="Select a city..."
            value={selectedCity}
            onChange={(selected) => {
              setSelectedCity(selected);
              setValue("location", selected.value); // Update form value
            }}
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button className="btn bg-purple-yellow-gradient text-white px-6">Add Item</button>
      </form>
    </div>
  );
};

export default AddRentItem;

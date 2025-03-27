import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAuth from "../../../hooks/useAuth";
import nepaliCities from "../../../nepaliCities";

const AddRentItem = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const imageArray = Array.from(files);
      setImages((prevImages) => [...prevImages, ...imageArray]);
    }
  };

  const uploadImagesToImgBB = async (images) => {
    const uploadedImageUrls = [];
    const apiKey = "db33f182a086535a7febb31315a3b84d"; // Replace with your ImgBB API key

    for (const image of images) {
      const formData = new FormData();
      formData.append("image", image);

      try {
        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (data.data && data.data.url) {
          uploadedImageUrls.push(data.data.url);
        } else {
          throw new Error("Failed to upload image to ImgBB");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    }

    return uploadedImageUrls;
  };

  const onSubmit = async (data) => {
    if (!user || !user.email || !user.uid) {
      setError("User is not properly authenticated.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const hostedImageUrls = await uploadImagesToImgBB(images);

      // Prepare rent item data with UID
      const rentItemData = {
        title: data.title,
        description: data.description,
        category: data.category,
        pricePerDay: data.pricePerDay,
        location: selectedCity ? selectedCity.value : "",
        userEmail: user.email,
        userId: user.uid, // Add the user's UID
        userName: user.displayName || "Anonymous", // Add user's display name
        images: hostedImageUrls,
      };

      const response = await axiosPublic.post("/rent", rentItemData);
      console.log("Item added successfully:", response.data);
      reset();
      setSelectedCity(null);
      setImages([]);
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full md:w-[870px] px-4 mx-auto">
      <h2 className="text-2xl font-semibold my-4">
        Upload A New <span className="text-purple"> Item for Rent</span>
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
              <option disabled value="default">
                Select a category
              </option>
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

        <div className="form-control w-full my-6">
          <label className="label">
            <span className="label-text">Upload Images*</span>
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {images.length} image(s) selected
            </p>
          )}
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="btn bg-purple-yellow-gradient text-white px-6"
          disabled={uploading} // Disable button while uploading
        >
          {uploading ? "Uploading..." : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default AddRentItem;

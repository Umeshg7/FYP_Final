import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAuth from "../../../hooks/useAuth";
import Swal from 'sweetalert2';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet marker path
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Red icon for selected location
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const AddRentItem = () => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      latitude: 27.700769,
      longitude: 85.30014
    }
  });
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [mapCenter, setMapCenter] = useState([27.700769, 85.30014]);

  useEffect(() => {
    const getLocation = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 60000
            });
          });
          
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setPosition([latitude, longitude]);
          setValue("latitude", latitude);
          setValue("longitude", longitude);
          await reverseGeocode(latitude, longitude);
        } catch (error) {
          console.warn("Geolocation error:", error);
          setMapCenter([27.700769, 85.30014]);
          setPosition([27.700769, 85.30014]);
          setValue("latitude", 27.700769);
          setValue("longitude", 85.30014);
          reverseGeocode(27.700769, 85.30014);
        }
      }
    };

    getLocation();
  }, [setValue]);

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setValue("latitude", lat);
        setValue("longitude", lng);
        reverseGeocode(lat, lng);
      },
    });
    return position ? (
      <Marker position={position} icon={redIcon}>
        <Popup>{address || "Selected Location"}</Popup>
      </Marker>
    ) : null;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddress(data.display_name || "Selected location");
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Location selected");
    }
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const imageArray = Array.from(files);
      setImages((prevImages) => [...prevImages, ...imageArray]);
    }
  };

  const uploadImagesToImgBB = async (images) => {
    if (!images || images.length === 0) {
      throw new Error("No images to upload");
    }

    const uploadedImageUrls = [];
    const apiKey = "db33f182a086535a7febb31315a3b84d";

    try {
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          {
            method: "POST",
            body: formData,
          }
        );
        
        if (!response.ok) {
          throw new Error(`Image upload failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.data?.url;
      });

      const results = await Promise.all(uploadPromises);
      return results.filter(url => url !== undefined);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
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

    if (!data.latitude || !data.longitude || isNaN(data.latitude) || isNaN(data.longitude)) {
      setError("Please select a valid location on the map.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const hostedImageUrls = await uploadImagesToImgBB(images);

      const rentItemData = {
        title: data.title,
        description: data.description,
        category: data.category,
        pricePerDay: parseFloat(data.pricePerDay),
        longitude: parseFloat(data.longitude),
        latitude: parseFloat(data.latitude),
        address: address,
        userEmail: user.email,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        images: hostedImageUrls,
        adminVerified: false,
      };

      const response = await axiosPublic.post("/rent", rentItemData);
      
      // Show success alert
      Swal.fire({
        title: 'Success!',
        text: 'Item added successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        reset();
        setPosition(null);
        setAddress("");
        setImages([]);
      });

    } catch (error) {
      console.error("Error adding item:", error);
      
      // Show error alert
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || "Failed to add item. Please try again.",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full md:w-[870px] px-4 mx-auto">
      <h2 className="text-2xl font-semibold my-4">
        Upload A New <span className="text-purple">Item for Rent</span>
      </h2>
      
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

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
              <option value="electronics">Electronics & Gadgets</option>
              <option value="house">Home & Lifestyle</option>
              <option value="vehicles">Vehicles & Transportation</option>
              <option value="clothes">Fashion & Accessories</option>
              <option value="sports">Sports & Outdoor Gear</option>
              <option value="baby">Baby & Kids Items</option>
              <option value="musical">Musical Instruments</option>
              <option value="equipment">Office & Business Equipment</option>
              <option value="books">Books</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Price per day*</span>
            </label>
            <input
              type="number"
              {...register("pricePerDay", { 
                required: true,
                min: 0
              })}
              placeholder="Price per day"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-control w-full my-6">
          <label className="label">
            <span className="label-text">Select Location on Map*</span>
          </label>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "350px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker />
          </MapContainer>
          {position ? (
            <p className="mt-2 text-sm text-gray-600">
              Selected Address: {address}
            </p>
          ) : (
            <p className="mt-2 text-sm text-yellow-600">
              Please click on the map to select a location or allow geolocation access
            </p>
          )}
        </div>

        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />

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
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {images.length} image(s) selected
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Preview ${index}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn bg-purple-yellow-gradient text-white px-6"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner"></span>
              Uploading...
            </>
          ) : (
            "Add Item"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddRentItem;
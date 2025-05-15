import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { AuthContext } from "../../../Contexts/AuthProvider";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker path
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
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

const Manageuseritems = () => {
  const axiosSecure = useAxiosSecure();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [rent, setRent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const [editingItem, setEditingItem] = useState(null);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [mapCenter, setMapCenter] = useState([27.700769, 85.30014]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  // Handle Edit Click
  const handleEditClick = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setPosition([item.location.coordinates[1], item.location.coordinates[0]]);
    setMapCenter([item.location.coordinates[1], item.location.coordinates[0]]);
    setAddress(item.location.address || "");
    setImages(item.images.map(img => ({ url: img })));
    
    // Reset form with item data
    reset({
      title: item.title,
      description: item.description,
      category: item.category,
      pricePerDay: item.pricePerDay,
      latitude: item.location.coordinates[1],
      longitude: item.location.coordinates[0]
    });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Upload image to imgBB
  const uploadToImgBB = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=7f429808d2f81aa8d1ae8be23546257c', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      throw new Error('Image upload failed');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Handle Update Item with imgBB uploads
  const handleUpdate = async (data) => {
    if (!position) {
      Swal.fire("Error!", "Please select a location on the map", "error");
      return;
    }

    setUploading(true);
    
    try {
      // Prepare updated data
      const updatedItem = {
        ...editingItem,
        title: data.title,
        description: data.description,
        category: data.category,
        pricePerDay: parseFloat(data.pricePerDay),
        location: {
          type: "Point",
          coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
          address: address
        },
        adminVerified: false // Reset verification status
      };

      // Upload new images to imgBB
      const newImageFiles = images.filter(img => img.file).map(img => img.file);
      if (newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map(file => uploadToImgBB(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Combine existing URLs with new ones
        const existingUrls = images.filter(img => img.url).map(img => img.url);
        updatedItem.images = [...existingUrls, ...uploadedUrls];
      } else {
        // Just keep the existing URLs
        updatedItem.images = images.filter(img => img.url).map(img => img.url);
      }

      // Send update request to your backend
      const response = await axiosSecure.put(`/rent/${editingItem._id}`, updatedItem);
      
      if (response.status === 200) {
        setRent(rent.map(item => item._id === editingItem._id ? response.data : item));
        Swal.fire(
          "Updated!",
          "Item updated successfully. It will be verified by the admin.",
          "success"
        );
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire(
        "Error!", 
        error.response?.data?.message || "Failed to update item. Please try again.", 
        "error"
      );
    } finally {
      setUploading(false);
    }
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
              <th>Status</th>
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
                  <span className={`badge ${item.adminVerified ? 'badge-success' : 'badge-warning'}`}>
                    {item.adminVerified ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEditClick(item, e)}
                      className="btn btn-circle btn-sm bg-purple text-white"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item, e)}
                      className="btn btn-circle btn-sm bg-red-500 text-white"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Edit Item</h2>
              <button 
                onClick={() => setEditingItem(null)} 
                className="btn btn-circle btn-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title*</span>
                  </label>
                  <input
                    type="text"
                    {...register("title", { required: true })}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Price per day*</span>
                  </label>
                  <input
                    type="number"
                    {...register("pricePerDay", { required: true, min: 0 })}
                    className="input input-bordered w-full"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description*</span>
                </label>
                <textarea
                  {...register("description", { required: true })}
                  className="textarea textarea-bordered h-24"
                ></textarea>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category*</span>
                </label>
                <select
                  {...register("category", { required: true })}
                  className="select select-bordered"
                >
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

              <div className="form-control">
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
                    Please click on the map to select a location
                  </p>
                )}
                <input type="hidden" {...register("latitude")} />
                <input type="hidden" {...register("longitude")} />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Images</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={img.url || img.preview} 
                        alt={`Preview ${index}`}
                        className="h-24 w-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full mt-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn bg-grey text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn bg-purple text-white"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manageuseritems;
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2";

const ProblemReportForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  // Upload images to ImgBB
  const uploadImages = async () => {
    if (!images.length) throw new Error("No images selected");
    
    const uploadedUrls = [];
    const apiKey = "db33f182a086535a7febb31315a3b84d";

    for (const image of images) {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      uploadedUrls.push(data.data.url);
    }

    return uploadedUrls;
  };

  // Submit problem report
  const onSubmit = async (data) => {
    if (!user?.email) {
      setError("Please log in to report a problem");
      return;
    }

    if (!images.length) {
      setError("Please attach at least one image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const imageUrls = await uploadImages();

      const reportData = {
        title: data.title,
        description: data.description,
        category: data.category,
        images: imageUrls,
        status: "pending", // pending | resolved | rejected
        reportedBy: {
          email: user.email,
          name: user.displayName || "Anonymous",
          uid: user.uid,
        },
        createdAt: new Date().toISOString(),
      };

      await axiosPublic.post("/report", reportData);

      Swal.fire({
        title: "Report Submitted!",
        text: "Admin will review your problem shortly.",
        icon: "success",
      });
      reset();
      setImages([]);
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to submit report",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-purple">
        Report a Problem
      </h2>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Problem Title */}
        <div>
          <label className="block font-medium mb-1">Title*</label>
          <input
            type="text"
            {...register("title", { required: true })}
            placeholder="Briefly describe the problem"
            className="input input-bordered w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Details*</label>
          <textarea
            {...register("description", { required: true })}
            className="textarea textarea-bordered w-full h-32"
            placeholder="Provide full details..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category*</label>
          <select
            {...register("category", { required: true })}
            className="select select-bordered w-full"
          >
            <option value="">Select a category</option>
            <option value="lost">Item Lost</option>
            <option value="payment">Payment Issue</option>
            <option value="damage">Item Damaged</option>
            <option value="user">Report User</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-1">Attach Photos*</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${i}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="btn bg-purple text-white w-full mt-6"
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner"></span>
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
};

export default ProblemReportForm;
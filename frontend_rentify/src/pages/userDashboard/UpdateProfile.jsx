import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../Contexts/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // For image upload
import Swal from 'sweetalert2'; // For success/error notifications

const UpdateProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext); // Access user context
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const location = useLocation();

  const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY_PROFILE; // ImgBB API key
  const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

  const onSubmit = async (data) => {
    try {
      // Ensure an image is selected
      if (!data.photo || data.photo.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'No Image Selected',
          text: 'Please select an image to upload.',
        });
        return;
      }

      const imageFile = { image: data.photo[0] }; // Image file to upload
      const hostingImg = await axios.post(image_hosting_api, imageFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (hostingImg.data.success) {
        const photoURL = hostingImg.data.data.display_url; // URL of the uploaded image

        await updateUserProfile(data.name, photoURL); // Update the user profile

        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Profile Updated Successfully!',
          showConfirmButton: false,
          timer: 1500,
        });

      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An error occurred while updating your profile.',
      });
    }
    
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen" >
      {/* Display user profile image */}

            <div className="w-24 h-24 rounded-full overflow-hidden mb-6">
              <a href={user.photoURL}  >
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              </a>
            </div>
      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-bold">Update Your Profile</h3>
          {/* Display user's profile information */}
          <p>Name: {user.displayName}</p>
          <p>Email: {user.email}</p>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input {...register('name')} type="text" placeholder="Your Name" className="input input-bordered" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Upload Photo</span>
            </label>
            <input
              {...register('photo')}
              type="file"
              className="file-input w-full max-w-xs"
              accept="image/*"
              required
            />
          </div>
          <div className="form-control mt-6">
            <button className="btn bg-purple-yellow-gradient text-white">Update</button>
          </div>
          {errors.photo && (
            <p className="text-red italic text-xs">Please select a photo to upload.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
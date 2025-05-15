import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../Contexts/AuthProvider';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPencilAlt, FaUserCircle } from 'react-icons/fa';

const UpdateProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY_PROFILE;
  const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('photo', [file]); // Set value for react-hook-form
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let photoURL = user?.photoURL;
      
      // Handle photo upload if a new photo was selected
      if (data.photo && data.photo.length > 0) {
        const imageFile = { image: data.photo[0] };
        const hostingImg = await axios.post(image_hosting_api, imageFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (hostingImg.data.success) {
          photoURL = hostingImg.data.data.display_url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // Get the name to update (use existing name if not provided)
      const nameToUpdate = data.name || user?.displayName;

      // Only update if either name or photo was changed
      if (nameToUpdate !== user?.displayName || photoURL !== user?.photoURL) {
        await updateUserProfile(nameToUpdate, photoURL);
        
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Profile Updated Successfully!',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'No Changes Made',
          text: 'Your profile remains unchanged.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message || 'An error occurred while updating your profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-to-r from-purple to-purple-600">
            {/* Cover Photo - Can be made editable if needed */}
          </div>
          
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col items-center md:items-start md:flex-row gap-6">
              {/* Profile Picture with Edit Functionality */}
              <div className="relative -mt-16 group">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="w-full h-full text-gray-300" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full opacity-100 group-hover:bg-blue-700 transition-colors shadow-md cursor-pointer">
                  <FaPencilAlt className="text-sm" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    {...register('photo')}
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user?.displayName}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
                <p className="text-gray-600 mb-4">You can update your name, profile photo, or both.</p>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Name</label>
                <p className="text-gray-900 font-medium">{user?.displayName}</p>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  New Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Enter your new name"
                  className="input input-bordered w-full"
                  defaultValue={user?.displayName || ''}
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                className="btn bg-purple-yellow-gradient px-6 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
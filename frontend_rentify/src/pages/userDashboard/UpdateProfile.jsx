import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../Contexts/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // For image upload
import Swal from 'sweetalert2'; // For success/error notifications

const UpdateProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext); // Access user context
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpError, setOtpError] = useState('');

  const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY_PROFILE; // ImgBB API key
  const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

  const sendOtp = async () => {
    try {
      // Ensure the phone number has the country code
      const phoneNumberWithCountryCode = `+977${phoneNumber}`;
      
      // Log phone number to verify correct format
      console.log("Sending OTP to:", phoneNumberWithCountryCode);
      
      const response = await axios.post(
        'http://localhost:6001/send-otp', 
        { phone_number: phoneNumberWithCountryCode },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data.message === 'OTP sent successfully') {
        setIsOtpSent(true);
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'OTP sent successfully!',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error sending OTP',
        text: 'There was an issue sending the OTP. Please try again.',
      });
    }
  };
  

  const verifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:6001/verify-otp', { phoneNumber, otp });
      if (response.data.message === 'OTP verified successfully') {
        setOtpError('');
        return true; // OTP verified successfully
      } else {
        setOtpError('Invalid OTP. Please try again.');
        return false; // Invalid OTP
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Error verifying OTP. Please try again.');
      return false;
    }
  };

  const onSubmit = async (data) => {
    // First, verify the OTP
    const isOtpVerified = await verifyOtp();
    if (!isOtpVerified) {
      return; // Stop if OTP verification fails
    }

    try {
      if (!data.photo || data.photo.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'No Image Selected',
          text: 'Please select an image to upload.',
        });
        return;
      }

      const imageFile = { image: data.photo[0] };
      const hostingImg = await axios.post(image_hosting_api, imageFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (hostingImg.data.success) {
        const photoURL = hostingImg.data.data.display_url;

        await updateUserProfile(data.name, photoURL);
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
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Display user profile image */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-6">
        <a href={user.photoURL}>
          <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
        </a>
      </div>

      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-bold">Update Your Profile</h3>
          {/* Display user's profile information */}
          <p>Name: {user.displayName}</p>
          <p>Email: {user.email}</p>

          {/* Phone number input for OTP */}
          {!isOtpSent ? (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="text"
                placeholder="Enter your phone number"
                className="input input-bordered"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <button type="button" className="btn mt-4" onClick={sendOtp}>
                Send OTP
              </button>
            </div>
          ) : (
            <div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Enter OTP</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="input input-bordered"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
            </div>
          )}

          {/* Name and photo update */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Your Name"
              className="input input-bordered"
              defaultValue={user.displayName}
            />
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
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;

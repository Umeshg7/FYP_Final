import React, { useContext, useState } from 'react';
import logo from '/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5'; // Import a close icon
import { useForm } from 'react-hook-form';
import { AuthContext } from '../Contexts/AuthProvider';
import useAxiosPublic from '../hooks/useAxiosPublic';

const Modal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signUpWithGmail, login } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState("");
  const axiosPublic = useAxiosPublic();

  // Redirecting to home page
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = (data) => {
    const email = data.email;
    const password = data.password;

    login(email, password)
      .then((result) => {
        // Prepare user data for MongoDB
        const userInfo = {
          name: result.user.displayName || "Unknown", // Use displayName from Firebase
          email: result.user.email,
          photoURL: result.user.photoURL || "", // Use photoURL from Firebase if available
          role: "user", // Default role
        };

        console.log("Sending user data to backend:", userInfo); // Log the payload

        // Send user data to backend
        axiosPublic
          .post("/users", userInfo)
          .then(() => {
            alert("Login successful!");
            document.getElementById('my_modal_5').close();
            navigate(from, { replace: true });
          })
          .catch((error) => {
            console.error("Error posting user data:", error); // Log the error
            if (error.response?.status === 302) {
              alert("User already exists!");
            } else {
              setErrorMessage("Failed to save user data. Please try again.");
            }
          });
      })
      .catch((error) => {
        console.error("Login error:", error);
        setErrorMessage("Please provide a valid email & password!");
      });
  };

  // Google sign-in
  const handleLogin = () => {
    signUpWithGmail()
      .then((result) => {
        // Prepare user data for MongoDB
        const userInfo = {
          name: result.user.displayName || "Unknown", // Use displayName from Firebase
          email: result.user.email,
          photoURL: result.user.photoURL || "", // Use photoURL from Firebase if available
          role: "user", // Default role
        };

        console.log("Sending user data to backend:", userInfo); // Log the payload

        // Send user data to backend
        axiosPublic
          .post("/users", userInfo)
          .then(() => {
            alert("Login successful!");
            document.getElementById('my_modal_5').close();
            navigate(from, { replace: true });
          })
          .catch((error) => {
            console.error("Error posting user data:", error); // Log the error
            if (error.response?.status === 302) {
              alert("User already exists!");
            } else {
              setErrorMessage("Failed to save user data. Please try again.");
            }
          });
      })
      .catch((error) => {
        console.error("Google login error:", error);
        setErrorMessage("Failed to login with Google. Please try again.");
      });
  };

  return (
    <div>
      <dialog
        id="my_modal_5"
        className="modal modal-middle sm:modal-middle"
        style={{ maxWidth: '95vw', maxHeight: '95vh', overflow: 'hidden' }}
      >
        <div className="modal-box max-h-screen overflow-y-auto relative">
          {/* Close button */}
          <button
            htmlFor="my_modal_5"
            onClick={() => document.getElementById('my_modal_5').close()}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 mt-2 mr-2"
          >
            <IoClose size={24} />
          </button>

          {/* Modal content */}
          <div className="justify-items-center text-center">
            <img src={logo} alt="rentifyhub" style={{ width: 'auto', height: '60px' }} />
          </div>
          <div className="modal-action mt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="card-body" method="dialog">
              <h3 className="text-center text-xl">Please Login Your Account !</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="rentifyhub@gmail.com"
                  className="input input-bordered"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="rentifyhub@123"
                  className="input input-bordered"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
                <label className="label mt-2">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>

              {/* Error text */}
              {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}

              <div className="form-control mt-6">
                <input
                  type="submit"
                  value="Login"
                  className="btn bg-purple-yellow-gradient text-white text-lg"
                />
              </div>
              <p className="text-center my-3">
                Don't have an account?{' '}
                <Link to="/signup" className="underline text-purple ml-2">
                  Sign Up Now
                </Link>
              </p>
              {/* Google sign-up button */}
              <div className="form-control mt-4 text-center">
                <button
                  type="button"
                  className="btn bg-white border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2"
                  onClick={handleLogin}
                >
                  <FcGoogle className="text-xl" />
                  Sign Up With Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Modal;
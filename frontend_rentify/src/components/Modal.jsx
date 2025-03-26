import React, { useState, useContext } from 'react';
import logo from '/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../Contexts/AuthProvider';
import useAxiosPublic from '../hooks/useAxiosPublic';

const Modal = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUpWithGmail, login } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      const result = await login(data.email, data.password);
      const user = result.user;

      // Check if user exists before creating
      try {
        await axiosPublic.get(`/users/${user.uid}`);
      } catch (error) {
        if (error.response?.status === 404) {
          const userInfo = {
            _id: user.uid,
            name: user.displayName || data.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || "",
            role: "user",
            createdAt: new Date()
          };
          await axiosPublic.post("/users", userInfo);
        }
      }

      document.getElementById('my_modal_5').close();
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      let message = "Login failed";
      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        message = "Account temporarily locked due to many failed attempts";
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      const result = await signUpWithGmail();
      const user = result.user;
      
      const userInfo = {
        _id: user.uid,
        name: user.displayName || "Google User",
        email: user.email,
        photoURL: user.photoURL || "",
        role: "user",
        createdAt: new Date()
      };

      await axiosPublic.post("/users", userInfo);
      document.getElementById('my_modal_5').close();
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage(
        error.code === "auth/popup-closed-by-user" 
          ? "Google sign-in was canceled" 
          : "Failed to sign in with Google"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="my_modal_5" className="modal modal-middle sm:modal-middle">
      <div className="modal-box max-h-screen overflow-y-auto relative">
        <button
          onClick={() => document.getElementById('my_modal_5').close()}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          disabled={loading}
        >
          <IoClose size={24} />
        </button>

        <div className="text-center mb-4">
          <img src={logo} alt="RentifyHub" className="h-12 mx-auto" />
          <h3 className="text-xl font-bold mt-2">Login to Your Account</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label-text">Email</label>
            <input
              type="email"
              placeholder="your-email@example.com"
              className="input input-bordered w-full"
              {...register("email", { required: "Email is required" })}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="form-control">
            <label className="label-text">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              {...register("password", { required: "Password is required" })}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
            <Link to="/forgot-password" className="text-xs text-right mt-1 text-purple">
              Forgot password?
            </Link>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-xs text-center">{errorMessage}</p>
          )}

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn bg-purple-yellow-gradient text-white w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-center my-3">
          Don't have an account?
          <Link to="/signup" className="underline text-purple ml-2">
            Sign Up Now
          </Link>
        </p>

        <div className="form-control mt-4 text-center">
          <button
            type="button"
            className="btn bg-white border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2 w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="text-xl" /> 
            {loading ? 'Processing...' : 'Sign In With Google'}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
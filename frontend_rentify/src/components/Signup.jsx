import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2"; // ✅ SweetAlert2
import { AuthContext } from "../Contexts/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";
import logo from "/logo.png";

const Signup = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUpWithGmail, createUser, updateUserProfile } = useContext(AuthContext);
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
      const result = await createUser(data.email, data.password);
      const user = result.user;

      await updateUserProfile(data.name, "");

      const userInfo = {
        _id: user.uid,
        name: data.name,
        email: data.email,
        photoURL: user.photoURL || "",
        role: "user",
        createdAt: new Date()
      };

      try {
        await axiosPublic.get(`/users/${user.uid}`);
      } catch (error) {
        if (error.response?.status === 404) {
          await axiosPublic.post("/users", userInfo);
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: 'Your account has been successfully created.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate(from, { replace: true });
      });

    } catch (error) {
      console.error("Signup error:", error);
      let message = "Signup failed";
      if (error.code === "auth/email-already-in-use") {
        message = "Email already in use";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters";
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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

      try {
        await axiosPublic.get(`/users/${user.uid}`);
      } catch (error) {
        if (error.response?.status === 404) {
          await axiosPublic.post("/users", userInfo);
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Signed up with Google!',
        text: 'Your account has been successfully created.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate(from, { replace: true });
      });

    } catch (error) {
      console.error("Google signup error:", error);
      setErrorMessage(
        error.code === "auth/popup-closed-by-user"
          ? "Google sign-up was canceled"
          : "Failed to sign up with Google"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="modal-box max-w-md relative p-6 shadow-lg rounded-lg bg-white">
        <button
          onClick={() => navigate("/")}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          disabled={loading}
        >
          <IoClose size={24} />
        </button>

        <div className="text-center mb-4">
          <img src={logo} alt="RentifyHub" className="h-12 mx-auto" />
          <h3 className="text-xl font-bold mt-2">Create an Account</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label-text">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="input input-bordered w-full"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 3,
                  message: "Name should be at least 3 characters"
                }
              })}
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="form-control">
            <label className="label-text">Email</label>
            <input
              type="email"
              placeholder="your-email@example.com"
              className="input input-bordered w-full"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="form-control">
            <label className="label-text">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-center my-3">
          Already have an account?
          <Link to="/login" className="underline text-purple ml-2">Login here</Link>
        </p>

        <div className="divider">OR</div>

        <div className="form-control mt-4 text-center">
          <button
            type="button"
            className="btn bg-white border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2 w-full"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <FcGoogle className="text-xl" />
            {loading ? 'Signing up...' : 'Sign Up With Google'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;

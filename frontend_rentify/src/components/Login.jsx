import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import useAxiosPublic from "../hooks/useAxiosPublic";
import logo from '/logo.png';

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { signUpWithGmail, login } = useAuth();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    login(data.email, data.password)
      .then((result) => {
        const userInfo = {
          name: data.name,
          email: data.email,
        };
        axiosPublic.post("/users", userInfo).then(() => {
          alert("Login successful!");
          navigate(from, { replace: true });
        });
      })
      .catch(() => {
        setErrorMessage("Please provide a valid email & password!");
      });
    reset();
  };

  const handleGoogleLogin = () => {
    signUpWithGmail()
      .then((result) => {
        const userInfo = {
          name: result?.user?.displayName,
          email: result?.user?.email,
        };
        axiosPublic.post("/users", userInfo).then(() => {
          alert("Login successful!");
          navigate("/");
        });
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="modal-box max-w-md relative p-6 shadow-lg rounded-lg bg-white">
        <button
          onClick={() => navigate("/")}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
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
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="form-control">
            <label className="label-text">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          {errorMessage && <p className="text-red-500 text-xs text-center">{errorMessage}</p>}

          <div className="form-control mt-4">
            <button type="submit" className="btn bg-purple-yellow-gradient text-white w-full">Login</button>
          </div>
        </form>

        <p className="text-center my-3">
          Don't have an account?
          <Link to="/signup" className="underline text-purple ml-2">Sign Up Now</Link>
        </p>

        <div className="form-control mt-4 text-center">
          <button
            type="button"
            className="btn bg-white border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2 w-full"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="text-xl" /> Sign Up With Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React from "react";
import { Link, Outlet } from "react-router-dom";
import { MdDashboard, MdDashboardCustomize } from "react-icons/md";
import {
  FaEdit,
  FaLocationArrow,
  FaPlusCircle,
  FaQuestionCircle,
  FaRegUser,
  FaShoppingBag,
  FaUser,
} from "react-icons/fa";
import { BsChatLeftTextFill } from "react-icons/bs";

import { FaCartShopping } from "react-icons/fa6";
import logo from "/logo.png";
import useAuth from "../hooks/useAuth";

const sharedLinks = (
  <>
    <li className="mt-3">
      <Link to="/">
        <MdDashboard /> Home
      </Link>
    </li>
    <li>
      <Link to="/rent">
        <FaCartShopping /> Renting Items
      </Link>
    </li>
    <li>
      <Link to="">
        <FaLocationArrow /> Orders Tracking
      </Link>
    </li>
    <li>
      <Link to="/chat/6816a0c318695f4db7a88347">
        <FaQuestionCircle /> Customer Support
      </Link>
    </li>
    <li>
      <Link to="/chat">
        < BsChatLeftTextFill/> Chat
      </Link>
    </li>
        <li>
      <Link to="/user-dashboard/report">
        < BsChatLeftTextFill/> Report Problem to Admin
      </Link>
    </li>
  </>
);

const UserDashboardLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="drawer sm:drawer-open">
      <input id="user-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col sm:items-start sm:justify-start my-2">
        {/* Page content here */}
        <div className="flex items-center justify-between mx-4">
          <label
            htmlFor="user-drawer"
            className="btn btn-primary drawer-button lg:hidden"
          >
            <MdDashboardCustomize />
          </label>
          <button className="btn rounded-full px-6 bg-green flex items-center gap-2 text-white sm:hidden">
            <FaRegUser /> Logout
          </button>
        </div>
        <div className="mt-5 md:mt-2 mx-4">
          <Outlet />
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="user-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}
          <li>
            <Link to="/user-dashboard" className="flex justify-start mb-3">
              <img src={logo} alt="" className="w-40" />
              <span className="badge bg-purple">user</span>
            </Link>
          </li>
          <hr />
          <li className="mt-3">
            <Link to="/user-dashboard">
              <MdDashboard /> My Dashboard
            </Link>
          </li>
          <li>
            <Link to="/user-dashboard/addrent">
              <FaShoppingBag /> Add Rent Item
            </Link>
          </li>
          <li>
            <Link to="/user-dashboard/manageitems">
              <FaLocationArrow /> Manage Items
            </Link>
          </li>
          <li>
            <Link to="/user-dashboard/lent">
              <FaLocationArrow /> Booking Tracking
            </Link>
          </li>
          <hr />
          {sharedLinks}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
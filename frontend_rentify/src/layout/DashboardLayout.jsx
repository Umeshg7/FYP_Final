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
import { FaCartShopping } from "react-icons/fa6";

import logo from "/logo.png";
import Login from "../components/Login";
import useAdmin from "../hooks/useAdmin";
import useAuth from "../hooks/useAuth";

const sharedLinks = (
  <>
    <li className="mt-3">
      <Link to="/">
        <MdDashboard /> Home
      </Link>
    </li>
    <li>
      <Link to="/menu">
        <FaCartShopping /> Renting Items
      </Link>
    </li>
    <li>
      <Link to="/menu">
        <FaLocationArrow /> Booking Tracking
      </Link>
    </li>
    <li>
      <Link to="/menu">
        <FaQuestionCircle /> Customer Support
      </Link>
    </li>
  </>
);

const DashboardLayout = () => {
  const { loading } = useAuth();
  const [isAdmin, isAdminLoading] = useAdmin();

  if (loading || isAdminLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAdmin ? (
        <div className="drawer sm:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col sm:items-start sm:justify-start my-2">
            {/* Page content here */}
            <div className="flex items-center justify-between mx-4">
              <label
                htmlFor="my-drawer-2"
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
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
              {/* Sidebar content here */}
              <li>
                <Link to="/dashboard" className="flex justify-start mb-3">
                  <img src={logo} alt="" className="w-20" />
                  <span className="badge badge-primary">admin</span>
                </Link>
              </li>
              <hr />
              <li className="mt-3">
                <Link to="/admin-dashboard">
                  <MdDashboard /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/verifykycadmin">
                  <FaShoppingBag /> Verify KYC
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/verifyitem">
                  <FaShoppingBag /> Verify Items
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/addrentitem">
                  <FaPlusCircle />
                  Add items
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/manageitems">
                  <FaEdit /> Manage Items
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/adminbooking">
                  <FaEdit /> Booking Tracking
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/admin-dashboard/users">
                  <FaUser /> All Users
                </Link>
              </li>

              <hr />

              {/* shared nav links */}
              {sharedLinks}
            </ul>
          </div>
        </div>
      ) : (
        <div className="h-screen flex justify-center items-center">
          <Link to="/">
            <button className="btn bg-purple-yellow-gradient text-white">Back to Home</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
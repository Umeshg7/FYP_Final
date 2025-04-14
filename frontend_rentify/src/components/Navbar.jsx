import React, { useContext, useEffect, useState } from "react";
import logo from '/logo.png';
import { FaUser } from "react-icons/fa";
import Modal from "./Modal";
import { AuthContext } from "../Contexts/AuthProvider";
import Profile from "./Profile";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isSticky, setSticky] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setSticky(offset > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = (
    <>
      <li>
        <a className="text-xl font-semibold py-3 px-6" href="/">Home</a>
      </li>
      <li tabIndex={0}>
        <details>
          <summary className="text-xl font-semibold py-3 px-6">For Rent</summary>
          <ul className="p-2">
            <li><a className="py-2 px-4" href="/rent">All</a></li>
            <li><a className="py-2 px-4">Vehicles</a></li>
            <li><a className="py-2 px-4">Electronics</a></li>
            <li><a className="py-2 px-4">Clothes</a></li>
            <li><a className="py-2 px-4">Camping equipment</a></li>
          </ul>
        </details>
      </li>
      <li tabIndex={0}>
        <details>
          <summary className="text-xl font-semibold py-3 px-6">Our Services</summary>
          <ul className="p-2">
            <li><a className="py-2 px-4">Online Booking</a></li>
            <li><a className="py-2 px-4">Vehicles</a></li>
            <li><a className="py-2 px-4">Electronics</a></li>
            <li><a className="py-2 px-4">Clothes</a></li>
            <li><a className="py-2 px-4">Camping equipment</a></li>
          </ul>
        </details>
      </li>
      <li>
        <a className="text-xl font-semibold py-3 px-6">About Us</a>
      </li>
    </>
  );

  return (
    <header className={`max-w-screen-2xl container mx-auto fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isSticky ? "shadow-md bg-white" : "bg-white"}`}>
      <div className="navbar xl:px-16">
        <div className="navbar-start flex items-center space-x-5">
          <a href="/">
            <img src={logo} alt="rentiifyhub" style={{ width: 'auto', height: '60px' }} />
          </a>
        </div>

        <div className="navbar-center flex items-center space-x-6">
          <ul className="menu menu-horizontal flex space-x-6">
            {navItems}
          </ul>

          <form onSubmit={handleSearch} className="bg-white flex px-4 py-3 border-b border-[#333] focus-within:border-blue-500 overflow-hidden max-w-md mx-auto font-[sans-serif] ml-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18px" className="fill-gray-600 mr-3">
              <path
                d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
              </path>
            </svg>
            <input 
              type="text" 
              placeholder="Search item to rent..." 
              className="w-full outline-none text-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-end flex items-center space-x-5">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle mr-5 flex items-center justify-center">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="badge badge-sm indicator-item">5</span>
            </div>
          </div>

          {user ? <Profile user={user}/> : 
            <button onClick={() => document.getElementById('my_modal_5').showModal()} className="btn bg-purple-yellow-gradient rounded-full px-8 py-3 text-white text-lg"> 
              <FaUser />
              Login
            </button>
          }
          <Modal/>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
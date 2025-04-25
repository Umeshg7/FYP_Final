import React, { useContext, useEffect, useState } from "react";
import logo from '/logo.png';
import { FaUser, FaBell, FaSearch, FaTimes } from "react-icons/fa";
import Modal from "./Modal";
import { AuthContext } from "../Contexts/AuthProvider";
import Profile from "./Profile";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isSticky, setSticky] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSuggestions = async (term) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:6001/rent/search-suggestions?q=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data);
      console.log(data)
    } catch (err) {
      setError(err.message);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item) => {
    navigate(`/item/${item._id}`);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
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
      <li>
        <a className="text-xl font-semibold py-3 px-6" href="/itemmap">View Nearby Items</a>
      </li>
      <li>
        <a className="text-xl font-semibold py-3 px-6" href="/rent">For Rent </a>
      </li>
      <li>
        <a className="text-xl font-semibold py-3 px-6" href="/about">About Us</a>
      </li>
    </>
  );

  return (
    <header className={`max-w-screen-2xl container mx-auto fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isSticky ? "shadow-md bg-white" : "bg-white"}`}>
      <div className="navbar xl:px-16">
        <div className="navbar-start flex items-center space-x-5">
          <a href="/">
            <img src={logo} alt="Rentiify Hub Logo" style={{ width: 'auto', height: '60px' }} />
          </a>
        </div>

        <div className="navbar-center flex items-center space-x-6">
          <ul className="menu menu-horizontal flex space-x-6">
            {navItems}
          </ul>

          <div className="relative max-w-md ml-8">
            <form onSubmit={handleSearch} className="bg-white flex items-center px-4 py-3 border-b border-[#333] focus-within:border-blue-500 overflow-hidden font-[sans-serif]">
              <FaSearch className="text-gray-600 mr-3" />
              <input 
                type="text" 
                placeholder="Search item to rent..." 
                className="w-full outline-none text-sm" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                aria-label="Search items"
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </form>

            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                {isLoading ? (
                  <div className="p-2 text-center text-gray-500">Loading suggestions...</div>
                ) : error ? (
                  <div className="p-2 text-center text-red-500">{error}</div>
                ) : (
                  <ul>
                    {suggestions.map((item) => (
                      <li 
                        key={item._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span className="truncate">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="navbar-end flex items-center space-x-5">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle mr-5 flex items-center justify-center">
            <div className="indicator">
              <FaBell className="h-5 w-5" aria-hidden="true" />
              <span className="badge badge-sm indicator-item">3</span>
            </div>
          </div>

          {user ? <Profile user={user}/> : 
            <button 
              onClick={() => document.getElementById('my_modal_5').showModal()} 
              className="btn bg-purple-yellow-gradient rounded-full px-8 py-3 text-white text-lg"
            > 
              <FaUser aria-hidden="true" />
              Login
            </button>
          }
          <Modal />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
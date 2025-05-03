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

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  console.log(user)

  // Fetch notifications with error handling
  const fetchNotifications = async () => {
    if (!user?.uid) {
      console.log("Current user object:", {
        exists: !!user,
        hasToken: !!user?.token,
        hasUID: !!user?.uid,
        fullUser: user
      });
      console.log("User token or UID missing");
      return;
    }
    
    setNotificationsLoading(true);
    setNotificationError(null);
    try {
      console.log("Fetching notifications...");
      const response = await fetch(
        `http://localhost:6001/notifications?userId=${user.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch notifications: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Received notifications data:", data); // Now logging after data is defined
      
      if (!data || !Array.isArray(data.notifications)) {
        throw new Error('Invalid notifications data structure');
      }
      
      setNotifications(data.notifications);
      
      // Calculate unread count from the received notifications
      const unread = data.notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotificationError(err.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch unread count with error handling
  const fetchUnreadCount = async () => {
    if (!user?.token || !user?.uid) return;
    
    try {
      const response = await fetch(
        `http://localhost:6001/notifications/unread-count?userId=${user.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Unread count error:", err);
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:6001/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.uid })
        }
      );
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? {...n, isRead: true} : n
      ));
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch(
        'http://localhost:6001/notifications/mark-all-read',
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.uid })
        }
      );
      
      setNotifications(notifications.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  // Poll for notifications
  useEffect(() => {
    if (!user) return;
    
    fetchNotifications();
    fetchUnreadCount();
    
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Search functionality
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
      setSuggestions(data || []);
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
        <a className="text-xl font-semibold py-3 px-6" href="/aboutus">About Us</a>
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
          {/* Notification Bell */}
          <div className="relative mr-5">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  markAllAsRead();
                }
              }}
              className="btn btn-ghost btn-circle flex items-center justify-center relative"
              aria-label="Notifications"
            >
              <FaBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                  ) : notificationError ? (
                    <div className="p-4 text-center text-red-500">{notificationError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    <ul>
                      {notifications.map(notification => (
                        <li 
                          key={notification._id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            markAsRead(notification._id);
                            if (notification.link) {
                              navigate(notification.link);
                            }
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{notification.message}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="text-xs mt-1 text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="p-2 border-t border-gray-200 text-center bg-gray-50">
                  <button 
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifications(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
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
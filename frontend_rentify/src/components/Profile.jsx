import React, { useContext, useState } from 'react';
import { AuthContext } from '../Contexts/AuthProvider';
import { Link } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';

const Profile = ({ user }) => {
  const { logOut } = useContext(AuthContext);
  const [isAdmin] = useAdmin();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logOut()
      .then(() => alert("Logout done"))
      .catch(() => alert("Error Logging out"));
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="drawer drawer-end z-50">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="my-drawer-4" className="drawer-button btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            {user.photoURL ? (
              <img alt="Profile" src={user.photoURL} className="w-full h-full object-cover" />
            ) : (
              <img
                alt="Default Profile"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </label>
      </div>
      
      <div className="drawer-side">
        <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li><Link to={`/profile/${user.uid}`}>Profile</Link></li>
          <li><Link to='/kycverify'>Verify KYC</Link></li>
          
          {/* Settings with expandable submenu */}
          <li>
            <details open={showSettings} onToggle={toggleSettings}>
              <summary>Settings</summary>
              <ul>
                <li><Link to='/updateprofile'>Update Profile</Link></li>
                <li><Link to='/userdetails'>Your Details</Link></li>
              </ul>
            </details>
          </li>
          
          
          {isAdmin ? (
            <li><Link to='/admin-dashboard'>Admin Dashboard</Link></li>
          ) : (
            <li><Link to='/user-dashboard'>User Dashboard</Link></li>
          )}
          
          <li><a onClick={handleLogout}>Logout</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
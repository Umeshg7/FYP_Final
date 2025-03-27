import React, { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthProvider';
import { Link } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';

const Profile = ({ user }) => {
  const { logOut } = useContext(AuthContext);
  const [isAdmin] = useAdmin();

  const handleLogout = () => {
    logOut()
      .then(() => alert("Logout done"))
      .catch(() => alert("Error Logging out"));
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
          <li><a href='/updateprofile'>Profile</a></li>
          <li><a href='/kycverify'>Verify KYC</a></li>
          <li><a>Settings</a></li>
          <li><a>Post for Rent</a></li>
          
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
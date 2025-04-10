import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Contexts/AuthProvider';
import { Link } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import Swal from 'sweetalert2';
import axios from 'axios';

const Profile = ({ user }) => {
  const { logOut } = useContext(AuthContext);
  const [isAdmin] = useAdmin();
  const [showSettings, setShowSettings] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:6001/users/${user.uid}`);
        setKycStatus(response.data.data.kycVerified);
      } catch (error) {
        console.error('Error fetching KYC status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch KYC status',
        });
        setKycStatus(false);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchKycStatus();
    }
  }, [user]);

  const handleLogout = () => {
    logOut()
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out',
          timer: 2000,
          showConfirmButton: false
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Logout Failed',
          text: 'There was an error logging out',
        });
      });
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleDashboardClick = (e) => {
    if (loading) {
      e.preventDefault();
      Swal.fire({
        icon: 'info',
        title: 'Loading',
        text: 'Please wait while we check your KYC status',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!kycStatus) {
      e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'KYC Verification Required',
        html: `
          <p>You need to verify your KYC before accessing the dashboard.</p>
          <p>Please complete your KYC verification first.</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Go to KYC',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/kycverify';
        }
      });
    }
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
          
          {/* Show KYC verification link only if not verified */}
          {!kycStatus && !loading && (
            <li><Link to='/kycverify' className="text-orange-600 font-medium">Verify KYC</Link></li>
          )}
          
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
          
          {/* Dashboard link with KYC verification check */}
          {isAdmin ? (
            <li><Link to='/admin-dashboard'>Admin Dashboard</Link></li>
          ) : (
            <li>
              <Link 
                to={kycStatus ? '/user-dashboard' : '#'} 
                onClick={handleDashboardClick}
                className={!kycStatus ? 'text-gray-400 cursor-not-allowed' : ''}
              >
                User Dashboard
                {!kycStatus && !loading && (
                  <span className="badge badge-warning ml-2">KYC Required</span>
                )}
                {loading && (
                  <span className="loading loading-spinner loading-xs ml-2"></span>
                )}
              </Link>
            </li>
          )}
          
          <li><a onClick={handleLogout}>Logout</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
import React, { useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthProvider';
import { Link } from 'react-router-dom';
import { FaPencilAlt, FaUserCircle } from 'react-icons/fa';

const UserDetails = () => {
  const { user } = useContext(AuthContext);

  const formatFirebaseDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Facebook-like Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative h-40 bg-gradient-to-r from-purple to-purple-600">
          {/* Cover Photo - You can add actual cover photo logic if available */}
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture with Edit Icon */}
            <div className="relative -mt-16 group">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-full h-full text-gray-300" />
                )}
              </div>
              <Link 
                to="/updateprofile" 
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-blue-700"
              >
                <FaPencilAlt className="text-sm" />
              </Link>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user?.displayName || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Account Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-medium text-gray-500 mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{user?.displayName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-sm break-all">{user?.uid}</p>
              </div>
            </div>
          </div>
          
          {/* Authentication */}
          <div>
            <h3 className="font-medium text-gray-500 mb-3">Authentication</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="font-medium">{formatFirebaseDate(user?.metadata?.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">{formatFirebaseDate(user?.metadata?.lastLoginAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Verification</p>
                <p className="font-medium">{user?.emailVerified ? 'Verified' : 'Not Verified'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Data */}
        {user?.providerData?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-500 mb-3">Connected Accounts</h3>
            <div className="space-y-3">
              {user.providerData.map((provider, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium capitalize">{provider.providerId.replace('.com', '')}</p>
                  {provider.phoneNumber && (
                    <p className="text-sm text-gray-600">Phone: {provider.phoneNumber}</p>
                  )}
                  {provider.uid && (
                    <p className="text-xs text-gray-500 break-all">UID: {provider.uid}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
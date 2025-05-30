import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaAngleRight, FaAngleLeft, FaComment, FaPhoneAlt } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Cards from '../../components/Cards';

const PublicProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userRentals, setUserRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataAvailable, setDataAvailable] = useState(true);
  const slider = React.useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDataAvailable(true);
        
        const userResponse = await fetch(`http://localhost:6001/users/${userId}`);
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            setDataAvailable(false);
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        
        const rentalsResponse = await fetch(`http://localhost:6001/rent/user/${userId}`);
        if (!rentalsResponse.ok) {
          // Don't treat no rentals as an error, just set empty array
          setUserRentals([]);
        } else {
          const rentalsData = await rentalsResponse.json();
          setUserRentals(rentalsData);
        }
        
        setUserData(userData.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setDataAvailable(false);
      }
    };

    fetchData();
  }, [userId]);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 970,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dataAvailable) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Notice!</strong>
          <span className="block sm:inline"> No data available for this user</span>
          <Link to="/" className="mt-2 block text-blue-600 hover:underline">Return to homepage</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <Link to="/" className="mt-2 block text-blue-600 hover:underline">Return to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-48 bg-purple-yellow-gradient opacity-50"></div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                {userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-500">
                      {userData?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold flex items-center">
                      {userData?.name || 'User'}
                      {userData?.kycVerified && (
                        <MdVerified 
                          size={20} 
                          className="ml-2 text-purple" 
                          title="KYC Verified"
                        />
                      )}
                    </h1>
                    {userData?.role === 'admin' && (
                      <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
                        ADMIN
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <FaEnvelope className="text-gray-500" />
                    <p className="text-gray-600">{userData?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <FaPhoneAlt className="text-gray-500" />
                    <p className="text-gray-600">{userData?.phoneNumber}</p>
                  </div>
                </div>
                
                {/* Contact Buttons */}
                <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 bg-white text-purple px-4 py-2 rounded-full border-2 border-purple shadow-md hover:shadow-lg transition-all"
                  style={{
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                    borderRadius: "2rem 2rem 2rem 0"
                  }}
                >
                  <div className="bg-white text-purple p-1 rounded-full">
                    <FaPhone />
                  </div>
                  <span>Call Now</span>
                </button>
                <Link to ="/chat">
                <button
                  className="flex items-center gap-2 bg-white text-purple px-4 py-2 rounded-full border-2 border-purple shadow-md hover:shadow-lg transition-all"
                  style={{
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                    borderRadius: "2rem 2rem 2rem 0"
                  }}
                  
                >
                
                  <div className="bg-white text-purple p-1 rounded-full">
                    <FaComment />
                  </div>
                  <span>Chat Now</span>
                </button>
                </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Listings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">
          {userData?.name}'s Listings ({userRentals?.length || 0})
        </h2>
        
        {userRentals?.length > 0 ? (
          <>
            <div className="md:absolute right-3 top-8 mb-8 md:mr-6">
              <button
                onClick={() => slider?.current?.slickPrev()}
                className="btn p-2 rounded-full ml-5"
              >
                <FaAngleLeft className="h-8 w-8 p-1" />
              </button>
              <button
                className="bg-purple btn p-2 rounded-full ml-5"
                onClick={() => slider?.current?.slickNext()}
              >
                <FaAngleRight className="h-8 w-8 p-1" />
              </button>
            </div>

            <div className="mt-10">
              <Slider ref={slider} {...settings}>
                {userRentals.map((item, i) => (
                  <div key={i} className="px-2">
                    <Cards item={item} />
                  </div>
                ))}
              </Slider>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
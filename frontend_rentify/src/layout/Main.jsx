import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../Contexts/AuthProvider';
import LoadingSpinner from '../components/LoadingSpinner';

const Main = () => {
  const { loading } = useContext(AuthContext);

  return (
    <div className='bg-white'>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <Navbar />
          <div className="min-h-screen">
            <Outlet />
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Main;

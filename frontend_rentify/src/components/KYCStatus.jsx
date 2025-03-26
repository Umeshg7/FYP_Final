import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthProvider';
import useAxiosPublic from '../hooks/useAxiosPublic';

const KYCStatus = () => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axiosPublic.get(`/kyc/${user.uid}/status`);
        setStatus(response.data.data.status);
        setFeedback(response.data.data.adminFeedback || 'No feedback yet');
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchStatus();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Your KYC Status</h2>
        
        <div className={`p-4 mb-6 rounded-md ${
          status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          status === 'REJECTED' ? 'bg-red-100 text-red-800' :
          status === 'NEEDS_CORRECTION' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <p className="font-semibold">Status: {status || 'Not submitted'}</p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold mb-2">Admin Feedback:</h3>
            <p>{feedback}</p>
          </div>
        )}

        {status === 'NEEDS_CORRECTION' && (
          <button 
            onClick={() => navigate('/kyc')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Your KYC
          </button>
        )}

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-4 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default KYCStatus;
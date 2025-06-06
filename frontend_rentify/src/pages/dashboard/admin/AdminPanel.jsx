import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCheck, FaTimes, FaInfoCircle, FaEye, FaUser, 
  FaIdCard, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaCalendarAlt, FaVenusMars, FaFileAlt, FaDownload 
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AuthContext } from "../../../Contexts/AuthProvider";

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="text-center mt-5">
    <p>Something went wrong:</p>
    <pre className="text-red-500">{error.message}</pre>
    <button 
      onClick={resetErrorBoundary} 
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Try Again
    </button>
  </div>
);

const KYCDetailsModal = ({ record, onClose }) => {
  const { user } = useContext(AuthContext);
  
  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={24} />
        </button>

        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="bg-black rounded-full p-1 flex items-center justify-center w-24 h-24">
              {user?.photoURL ? (
                <img 
                  src={record.photoURL} 
                  alt={`${record.firstName} ${record.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=No+Photo";
                  }}
                />
              ) : (
                <FaUser size={48} className="text-gray-500" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{record.firstName} {record.lastName}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <FaEnvelope />
                <span>{record.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <FaPhone />
                <span>{record.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaIdCard />
              <span>Personal Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Date of Birth</p>
                  <p>{record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaVenusMars className="text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Gender</p>
                  <p>{record.gender || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaIdCard className="text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Document Number</p>
                  <p>{record.documentNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt />
              <span>Address Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Permanent Address</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p>Province: {record.permanentAddress?.province || 'Not provided'}</p>
                  <p>District: {record.permanentAddress?.district || 'Not provided'}</p>
                  <p>Municipality: {record.permanentAddress?.municipality || 'Not provided'}</p>
                  <p>Ward No.: {record.permanentAddress?.ward || 'Not provided'}</p>
                </div>  
              </div>
              {record.temporaryAddress && (
                <div>
                  <h3 className="font-medium mb-2">Temporary Address</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p>Province: {record.temporaryAddress?.province || 'Not provided'}</p>
                    <p>District: {record.temporaryAddress?.district || 'Not provided'}</p>
                    <p>Municipality: {record.temporaryAddress?.municipality || 'Not provided'}</p>
                    <p>Ward No.: {record.temporaryAddress?.ward || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4 text-center">Documents</h2>
            {record.documentUrls?.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 mb-6">
                {record.documentUrls.map((doc, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <p className="font-medium mb-4 text-lg">Document {index + 1}</p>
                    <div className="relative w-full max-w-4xl bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center p-4">
                      {doc.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <div className="flex justify-center w-full h-full">
                          <img 
                            src={doc} 
                            alt={`Document ${index + 1}`}
                            className="max-h-[70vh] max-w-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg mb-4">Document Preview Not Available</p>
                          <a 
                            href={doc} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline inline-flex items-center gap-2 text-lg"
                          >
                            <FaDownload /> Download File
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No documents available</p>
            )}

            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="mb-6">
              <p className="font-medium">Submitted On</p>
              <p>{new Date(record.createdAt).toLocaleString()}</p>
            </div>
            {record.adminFeedback && (
              <div className="mb-6">
                <p className="font-medium">Admin Feedback</p>
                <p className="bg-yellow-50 p-3 rounded">{record.adminFeedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: "all", date: "" });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKYCRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get("http://localhost:6001/kyc");
        setKycRecords(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch KYC records");
        setKycRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKYCRecords();
  }, []);

  const handleStatusUpdate = async (userId, status, feedback = "") => {
    try {
      const token = await user.getIdToken();
      const { data } = await axios.put(
        `http://localhost:6001/kyc/${userId}/status`,
        { status, adminFeedback: feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setKycRecords(prev => 
        prev.map(record => 
          record.userId === userId ? { ...record, ...data.data } : record
        )
      );
      
      Swal.fire({
        title: "Success!",
        text: `KYC has been ${status.toLowerCase()}`,
        icon: "success"
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to update status",
        icon: "error"
      });
    }
  };

  const confirmAction = (record, status) => {
    Swal.fire({
      title: `Are you sure you want to ${status.toLowerCase()} this KYC?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${status.toLowerCase()}`,
      input: status === "REJECTED" || status === "NEEDS_CORRECTION" ? 
        "textarea" : undefined,
      inputLabel: "Feedback (optional)",
      inputPlaceholder: "Enter feedback for the user...",
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusUpdate(record.userId, status, result.value);
      }
    });
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const filteredRecords = kycRecords.filter(record => {
    if (filter.status !== "all" && record.status !== filter.status) {
      return false;
    }
    if (filter.date) {
      const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
      return recordDate === filter.date;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      NEEDS_CORRECTION: "bg-blue-100 text-blue-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Admin" 
                className="w-10 h-10 rounded-full"
              />
            )}
            <h1 className="text-2xl font-bold">KYC Verification</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">
              Pending: {kycRecords.filter(r => r.status === "PENDING").length}
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
              Approved: {kycRecords.filter(r => r.status === "APPROVED").length}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="border rounded px-3 py-2 flex-grow md:flex-grow-0"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="NEEDS_CORRECTION">Needs Correction</option>
          </select>
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({...filter, date: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.firstName} {record.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.phoneNumber || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.permanentAddress?.province}, {record.permanentAddress?.district}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.permanentAddress?.municipality}-{record.permanentAddress?.ward}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => confirmAction(record, "APPROVED")}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => confirmAction(record, "REJECTED")}
                          className="p-2 text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                        <button
                          onClick={() => confirmAction(record, "NEEDS_CORRECTION")}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Request Correction"
                        >
                          <FaInfoCircle />
                        </button>
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 text-gray-600 hover:text-gray-800"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No KYC records found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedRecord && (
          <KYCDetailsModal 
            record={selectedRecord} 
            onClose={() => setSelectedRecord(null)} 
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AdminPanel;
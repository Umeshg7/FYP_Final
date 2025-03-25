import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="text-center mt-5">
    <p>Something went wrong:</p>
    <pre className="text-red-500">{error.message}</pre>
    <button onClick={resetErrorBoundary} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
      Try Again
    </button>
  </div>
);

const AdminPanel = () => {
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ verified: "all", date: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKYCRecords = async () => {
      try {
        const response = await axios.get("http://localhost:6001/kyc");
        // Ensure kycRecords is always an array
        setKycRecords(Array.isArray(response.data.kycRecords) ? response.data.kycRecords : []);
      } catch (error) {
        setError("Failed to fetch KYC records.");
        setKycRecords([]); // Set to empty array to prevent crashes
      } finally {
        setLoading(false);
      }
    };
    fetchKYCRecords();
  }, []);

  const handleVerification = async (id, verified) => {
    try {
      const response = await axios.put(`http://localhost:6001/kyc/${id}/verify`, { verified });
      setKycRecords((prevRecords) =>
        prevRecords.map((record) =>
          record?._id === id ? { ...record, verified: response.data.kycRecord?.verified } : record
        )
      );
    } catch (error) {
      setError("Failed to update verification status.");
    }
  };

  const confirmAction = (id, verified) => {
    const actionText = verified ? "approve" : "reject";
    Swal.fire({
      title: `Are you sure you want to ${actionText} this KYC?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${actionText} it!`,
    }).then((result) => {
      if (result.isConfirmed) {
        handleVerification(id, verified);
        Swal.fire({
          title: `${actionText}d!`,
          text: `The KYC has been ${actionText}d.`,
          icon: "success",
        });
      }
    });
  };

  const handleViewDetails = (id) => {
    navigate(`/kyc/${id}`);
  };

  const filteredRecords = kycRecords.filter((record) => {
    if (!record) return false; // Skip undefined/null records
    if (filter.verified !== "all" && String(record.verified) !== filter.verified) return false;
    if (filter.date && !record.createdAt?.startsWith(filter.date)) return false;
    return true;
  });

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-5">{error}</div>;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>
        <div className="flex items-center justify-between m-4">
          <h5>Verify KYC Records</h5>
          <h5>Total Pending KYC: {kycRecords.filter((record) => !record?.verified).length}</h5>
        </div>

        {/* Filters */}
        <div className="flex gap-4 m-4">
          <select
            value={filter.verified}
            onChange={(e) => setFilter({ ...filter, verified: e.target.value })}
            className="border p-2"
          >
            <option value="all">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            className="border p-2"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra md:w-[1000px]">
            <thead className="bg-purple text-white rounded-lg">
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Profile Image</th>
                <th>Document</th>
                <th>Address</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record?._id} onClick={() => handleViewDetails(record?._id)}>
                  <th>{index + 1}</th>
                  <td>{record?.firstName} {record?.lastName}</td>
                  <td>
                    <img
                      src={record?.userPhoto || "default-user.jpg"}
                      className="w-10 h-10 rounded-full"
                      alt="User"
                      onError={(e) => {
                        e.target.src = "default-user.jpg"; // Fallback for broken images
                      }}
                    />
                  </td>
                  <td>
                    {record?.documentUrls?.length > 0 ? (
                      <img
                        src={record.documentUrls[0]}
                        className="w-16 h-16 object-cover rounded-md"
                        alt="Document"
                        onError={(e) => {
                          e.target.src = "default-document.jpg"; // Fallback for broken images
                        }}
                      />
                    ) : (
                      <span>No document</span>
                    )}
                  </td>
                  <td>
                    <p>Permanent: {record?.permanentAddress?.province || "N/A"}, {record?.permanentAddress?.district || "N/A"}</p>
                    <p>Temporary: {record?.temporaryAddress?.province || "N/A"}, {record?.temporaryAddress?.district || "N/A"}</p>
                  </td>
                  <td>{record?.createdAt ? record.createdAt.split("T")[0] : "N/A"}</td>
                  <td>
                    {record?.verified ? (
                      <span className="text-green-500">VERIFIED</span>
                    ) : (
                      <span className="text-red-500">UNVERIFIED</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmAction(record?._id, true);
                      }}
                      className="btn btn-xs btn-circle bg-green-500 text-white mr-2"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmAction(record?._id, false);
                      }}
                      className="btn btn-xs btn-circle bg-red text-white"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-gray-500 py-4">
                    No KYC records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminPanel;
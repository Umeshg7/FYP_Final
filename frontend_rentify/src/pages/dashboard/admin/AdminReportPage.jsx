import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AdminReportPage = () => {
  const axiosSecure = useAxiosSecure();
  const { 
    data: reports = [], 
    isLoading, 
    
    refetch 
  } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await axiosSecure.get("/report");
      return res.data; // Directly returning the array
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (!Array.isArray(reports)) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: Reports data is not in expected format
        <pre>{JSON.stringify(reports, null, 2)}</pre>
      </div>
    );
  }

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const response = await axiosSecure.patch(`/report/${reportId}/status`, {
        status: newStatus
      });
      
      if (response.data) {
        alert(`Report status updated to ${newStatus}`);
        refetch();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Status update failed:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        reportId
      });
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between m-4">
        <h5>All Reports</h5>
        <h5>Total Reports: {reports.length}</h5>
      </div>

      {/* table */}
      <div>
        <div className="overflow-x-auto">
          <table className="table table-zebra md:w-[870px]">
            {/* head */}
            <thead className="bg-purple text-white rounded-lg">
              <tr>
                <th>#</th>
                <th>Reported By</th>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Images</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={report._id}>
                  <th>{index + 1}</th>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <span className="text-xl">
                            {report.reportedBy.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold">{report.reportedBy.name || 'Unknown'}</p>
                        <p className="text-xs">{report.reportedBy.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{report.title}</td>
                  <td>
                    <span className={`badge ${
                      report.category === 'lost' ? 'badge-primary' :
                      report.category === 'payment' ? 'badge-secondary' :
                      report.category === 'damage' ? 'badge-error' : 'badge-info'
                    }`}>
                      {report.category}
                    </span>
                  </td>
                  <td className="max-w-xs truncate">{report.description}</td>
                  <td>
                    {report.images?.map((img, i) => (
                      <a 
                        key={i} 
                        href={img} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mr-1"
                      >
                        <img 
                          src={img} 
                          alt={`Report ${i + 1}`} 
                          className="w-10 h-10 object-cover inline-block"
                        />
                      </a>
                    ))}
                  </td>
                  <td>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                      className={`select select-bordered select-xs ${
                        report.status === 'pending' ? 'bg-yellow-100' :
                        report.status === 'resolved' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button 
                        className="btn btn-xs btn-circle bg-blue-500 text-white"
                        onClick={() => {
                          // Implement view details modal or page navigation
                          console.log('View report:', report);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn btn-xs btn-circle bg-green-500 text-white"
                        onClick={() => handleStatusUpdate(report._id, 'resolved')}
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className="btn btn-xs btn-circle bg-red-500 text-white"
                        onClick={() => handleStatusUpdate(report._id, 'rejected')}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportPage;
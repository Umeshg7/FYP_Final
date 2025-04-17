import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FaTrashAlt, FaUser, FaUsers } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const Users = () => {
  const axiosSecure = useAxiosSecure();
  const { 
    data: usersData = {}, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });

  // Safely extract users array from response
  const users = usersData.data || usersData.users || [];
  console.log(users)
  
  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (!Array.isArray(users)) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: Users data is not in expected format
        <pre>{JSON.stringify(usersData, null, 2)}</pre>
      </div>
    );
  }

  const handleMakeAdmin = async (user) => {
    try {
      console.log('Attempting to make admin:', user._id);
      const response = await axiosSecure.patch(`/users/${user._id}/admin`);
      console.log('Admin promotion response:', response.data);
      
      if (response.data.success) {
        alert(`${user.name} is now admin`);
        refetch();
      } else {
        alert(response.data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Admin promotion failed:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        userId: user._id
      });
      alert(error.response?.data?.message || 'Failed to make admin');
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await axiosSecure.delete(`/users/${user._id}`);
      alert(`${user.name} removed successfully`);
      refetch();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between m-4">
        <h5>All Users</h5>
        <h5>Total Users: {users.length}</h5>
      </div>

      {/* table */}
      <div>
        <div className="overflow-x-auto">
          <table className="table table-zebra md:w-[870px]">
            {/* head */}
            <thead className="bg-purple text-white rounded-lg">
              <tr>
                <th>#</th>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
                <th>Kyc Status</th>

              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>
                      <img
                        src={user.photoURL || "https://via.placeholder.com/50"} // Use a placeholder if photoURL is missing
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover" // Adjust size and styling as needed
                      />
                    </td>
                  <td>{user.name}</td>

                  <td>{user.email}</td>
                  <td>
                    {user.role === "admin" ? (
                      "Admin"
                    ) : (
                      <button
                        onClick={() => handleMakeAdmin(user)}
                        className="btn btn-xs btn-circle bg-indigo-500 text-white"
                      >
                        <FaUsers />
                      </button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(user)} className="btn btn-xs bg-orange-500 text-white">
                      <FaTrashAlt />
                    </button>
                  </td>
                  <td>
                  
                    {user.kycVerified ? "Verified" : "Not Verified"}

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

export default Users;
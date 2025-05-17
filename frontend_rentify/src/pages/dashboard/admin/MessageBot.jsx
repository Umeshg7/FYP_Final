import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useState } from 'react';

import { FaEdit, FaTrashAlt } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const MessageBot = () => {
  const axiosSecure = useAxiosSecure();
  const { authToken } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState({ key: '', value: '' });
  const [editingKey, setEditingKey] = useState(null);
  const [error, setError] = useState('');

  // Fetch messages using React Query
  const { 
    data: messages = [], 
    isLoading 
  } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await axiosSecure.get("/botmessage", {
        headers: { 'x-auth-token': authToken }
      });
      return res.data;
    },
  });

  // Mutation for adding/updating messages
  const { mutate: mutateMessage } = useMutation({
    mutationFn: async (messageData) => {
      if (editingKey) {
        return axiosSecure.put(`/botmessage${editingKey}`, 
          { value: messageData.value },
          { headers: { 'x-auth-token': authToken } }
        );
      } else {
        return axiosSecure.post('/botmessage', messageData, {
          headers: { 'x-auth-token': authToken }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
      setNewMessage({ key: '', value: '' });
      setEditingKey(null);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Operation failed');
    }
  });

  // Mutation for deleting messages
  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (key) => {
      return axiosSecure.delete(`/botmessage/${key}`, {
        headers: { 'x-auth-token': authToken }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
    onError: (err) => {
      setError('Failed to delete message');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutateMessage(newMessage);
  };

  const handleEdit = (message) => {
    setNewMessage({ key: message.key, value: message.value });
    setEditingKey(message.key);
  };

  const handleDelete = (key) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(key);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between m-4">
        <h5 className="text-xl font-bold">Answer Bot Messages</h5>
        <h5>Total Messages: {messages.length}</h5>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingKey ? 'Edit Message' : 'Add New Message'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!editingKey && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Question (Key)</label>
              <input
                type="text"
                name="key"
                value={newMessage.key}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Answer (Value)</label>
            <textarea
              name="value"
              value={newMessage.value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="3"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn bg-indigo-500 text-white hover:bg-indigo-600"
          >
            {editingKey ? 'Update' : 'Add'} Message
          </button>
          
          {editingKey && (
            <button
              type="button"
              onClick={() => {
                setNewMessage({ key: '', value: '' });
                setEditingKey(null);
              }}
              className="btn bg-gray-500 text-white hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-purple text-white">
              <tr>
                <th>#</th>
                <th>Question (Key)</th>
                <th>Answer (Value)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No messages found. Add your first message above.
                  </td>
                </tr>
              ) : (
                messages.map((message, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td>{message.key}</td>
                    <td>{message.value}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(message)}
                          className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(message.key)}
                          className="btn btn-sm bg-red-500 text-red hover:bg-white"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MessageBot;
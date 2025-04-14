import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthProvider";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaComment } from "react-icons/fa";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get(`/messages/conversations/${user.email}`);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Poll for new conversations
    const interval = setInterval(fetchConversations, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [user, axiosSecure]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Your Conversations</h1>
        
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <FaComment className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No conversations yet</h3>
            <p className="mt-1 text-gray-500">Start a conversation from a product page</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => navigate(`/chat/${conv._id}`)}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <img
                  src={conv.participant.photoURL || ""}
                  alt={conv.participant.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{conv.participant.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {conv.lastMessage
                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthProvider";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";

const ChatPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherParticipant, setOtherParticipant] = useState({
    name: "Loading...",
    email: "",
    photoURL: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
  
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get conversation details
        const convResponse = await axiosSecure.get(`/messages/conversations/${user.email}`);
        
        // Find the specific conversation
        const currentConversation = convResponse.data.find(conv => conv._id === conversationId);
        
        if (!currentConversation) {
          throw new Error("Conversation not found");
        }
  
        // Set participant info with fallback for UID
        if (currentConversation.participant) {
          setOtherParticipant({
            name: currentConversation.participant.name,
            email: currentConversation.participant.email,
            photoURL: currentConversation.participant.photoURL || "",
            uid: currentConversation.participant._id,
          });
        }
        
        // Fetch messages
        const messagesResponse = await axiosSecure.get(`/messages/messages/${conversationId}`);
        setMessages(messagesResponse.data || []);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setError(error.message || "Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [conversationId, user, axiosSecure]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = {
        conversationId,
        sender: user.email,
        text: newMessage
      };

      setMessages(prev => [...prev, message]);
      setNewMessage("");
      await axiosSecure.post("/messages/messages", message);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.slice(0, -1));
      setNewMessage(newMessage);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
    </div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-100 border border-red-400 text-red px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
      <button
        onClick={() => navigate("/chat")}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple transition"
      >
        Back to Conversations
      </button>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray">
      {/* Chat header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => navigate("/chat")} className="mr-4 text-purple-600">
          <FaArrowLeft size={20} />
        </button>
        <img
          src={otherParticipant.photoURL || ""}
          alt={otherParticipant.name}
          onClick={() => navigate(`/profile/${otherParticipant.uid}`)}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div>
          <h2 className="font-semibold">{otherParticipant.name}</h2>
          <p className="text-xs text-gray-500">{otherParticipant.email}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === user.email ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === user.email ? "bg-purple text-white" : "bg-white text-gray-800"}`}>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === user.email ? "text-purple-200" : "text-gray-500"}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple"
          />
          <button
            type="submit"
            className="ml-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple transition"
            disabled={!newMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
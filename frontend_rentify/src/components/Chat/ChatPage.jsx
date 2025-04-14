import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthProvider";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaPaperPlane, FaArrowLeft, FaSync } from "react-icons/fa";

const ChatPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherParticipant, setOtherParticipant] = useState({
    name: "Loading...",
    email: "",
    photoURL: "",
    uid: ""
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setInitialLoading(true);
        } else {
          setIsRefetching(true);
        }
        setError(null);
        
        const convResponse = await axiosSecure.get(`/messages/conversations/${user.email}`);
        const currentConversation = convResponse.data.find(conv => conv._id === conversationId);
        
        if (!currentConversation) {
          throw new Error("Conversation not found");
        }

        if (currentConversation.participant) {
          setOtherParticipant({
            name: currentConversation.participant.name,
            email: currentConversation.participant.email,
            photoURL: currentConversation.participant.photoURL || "",
            uid: currentConversation.participant._id
          });
        }
        
        const messagesResponse = await axiosSecure.get(`/messages/messages/${conversationId}`);
        setMessages(messagesResponse.data || []);
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setError(error.message || "Failed to load conversation");
      } finally {
        if (isInitialLoad) {
          setInitialLoading(false);
        } else {
          setIsRefetching(false);
        }
      }
    };

    fetchData(true);
    const interval = setInterval(() => fetchData(), 5000);
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

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red border border-red text-red-700 px-4 py-3 rounded-lg mb-4 max-w-md w-full">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple transition"
        >
          Back to Conversations
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Refetching indicator */}
      {isRefetching && (
        <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow">
          <FaSync className="animate-spin text-purple" />
        </div>
      )}

      {/* Chat header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/chat")} 
            className="mr-4 text-purple hover:text-purple transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <img
            src={otherParticipant.photoURL || "https://via.placeholder.com/100"}
            alt={otherParticipant.name}
            onClick={() => navigate(`/profile/${otherParticipant.uid}`)}
            className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer hover:opacity-80 transition"
          />
          <div>
            <h2 className="font-semibold text-gray-800">{otherParticipant.name}</h2>
            <p className="text-xs text-gray-500">{otherParticipant.email}</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mx-auto w-full max-w-4xl">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-1">Send your first message to start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.sender === user.email;
            const showAvatar = !isCurrentUser && (
              index === 0 || 
              messages[index - 1].sender !== message.sender ||
              (new Date(message.createdAt) - new Date(messages[index - 1].createdAt)) > 600000
            );
            
            return (
              <div 
                key={index} 
                className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                {showAvatar ? (
                  <img
                    src={otherParticipant.photoURL || "https://via.placeholder.com/100"}
                    alt={otherParticipant.name}
                    className="w-8 h-8 rounded-full object-cover mb-1"
                  />
                ) : !isCurrentUser && (
                  <div className="w-8"></div> // Spacer when avatar isn't shown for receiver
                )}
                
                <div 
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isCurrentUser 
                    ? "bg-purple text-white rounded-tr-none" 
                    : "bg-white text-gray-800 rounded-tl-none shadow-sm"}`}
                >
                  <p className="break-words">{message.text}</p>
                  <p className={`text-xs mt-1 text-right ${isCurrentUser ? "text-white" : "text-gray-500"}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message input */}
      <div className="bg-white p-4 border-t sticky bottom-0">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
            />
            <button
              type="submit"
              className={`p-3 rounded-full transition ${newMessage.trim() 
                ? "bg-purple text-white hover:bg-purple" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthProvider";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaPaperPlane, FaComment, FaSearch } from "react-icons/fa";

const ChatPage = () => {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherParticipant, setOtherParticipant] = useState({
    name: "Loading...",
    email: "",
    photoURL: "",
    uid: ""
  });
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const response = await axiosSecure.get(`/messages/conversations/${user.email}`);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user, axiosSecure]);

  // Fetch messages for current conversation
  useEffect(() => {
    if (!user || !conversationId) return;

    const fetchData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
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
          setLoading(false);
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

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Chats</h1>
        </div>
        
        {/* Search bar */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
            />
          </div>
        </div>
        
        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <FaComment className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery ? "No matches found" : "No conversations yet"}
              </h3>
              <p className="mt-1 text-gray-500">
                {searchQuery ? "Try a different search" : "Start a conversation from a product page"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/chat/${conv._id}`)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition ${conversationId === conv._id ? "bg-violet-100" : ""}`}
                >
                  <img
                    src={conv.participant.photoURL || "https://via.placeholder.com/100"}
                    alt={conv.participant.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{conv.participant.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 ml-2">
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 max-w-md w-full">
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="bg-purple text-white px-6 py-2 rounded-full hover:bg-purple transition"
            >
              Back to Conversations
            </button>
          </div>
        ) : !conversationId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <FaComment className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
            <p className="text-center max-w-md">
              Choose an existing conversation from the sidebar or start a new one
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white shadow-sm p-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center">
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
              
              {isRefetching && (
                <div className="bg-white p-2 rounded-full shadow">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple"></div>
                </div>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        <div className="w-8"></div>
                      )}
                      
                      <div 
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isCurrentUser 
                          ? "bg-purple text-white rounded-tr-none" 
                          : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200"}`}
                      >
                        <p className="break-words">{message.text}</p>
                        <p className={`text-xs mt-1 text-right ${isCurrentUser ? "text-violet-400" : "text-gray-500"}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message input */}
            <div className="bg-white p-4 border-t">
              <form onSubmit={handleSendMessage}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
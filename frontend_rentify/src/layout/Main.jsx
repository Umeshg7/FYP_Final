import React, { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../Contexts/AuthProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaRobot, FaTimes, FaPaperPlane, FaComment, FaSearch, FaArrowLeft } from 'react-icons/fa';
import useAxiosSecure from '../hooks/useAxiosSecure';

const ChatInterface = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list'); // 'list', 'assistant', or 'conversation'
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Sample welcome messages for the assistant
  const welcomeMessages = [
    "How do I list my property?",
    "What are your fees?",
    "How to contact support?"
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations for the user
  const fetchConversations = async () => {
    try {
      const response = await axiosSecure.get(`/messages/conversations/${user.email}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Initialize bot messages
  const fetchBotMessages = async () => {
    try {
      const response = await axiosSecure.get('/botmessage');
      if (response.data?.length > 0) {
        setMessages([
          {
            text: `Hello${user?.displayName ? ` ${user.displayName}` : ''}! How can I help you today?`,
            sender: 'bot',
            key: 'welcome',
            createdAt: new Date()
          },
          ...response.data.map(msg => ({
            text: msg.value,
            sender: 'bot',
            key: msg.key,
            createdAt: new Date()
          }))
        ]);
      } else {
        setMessages([{
          text: `Welcome to RentifyHub! How can I assist you?`,
          sender: 'bot',
          key: 'welcome',
          createdAt: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([{
        text: "Hi there! I'm here to help with your RentifyHub questions.",
        sender: 'bot',
        key: 'welcome-error',
        createdAt: new Date()
      }]);
    }
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (conversationId) => {
    try {
      setIsTyping(true);
      const response = await axiosSecure.get(`/messages/messages/${conversationId}`);
      setMessages(response.data || []);
      setIsTyping(false);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      setIsTyping(false);
    }
  };

  // Handle sending messages to the assistant
  const handleSendToAssistant = async () => {
    const question = inputMessage.trim();
    if (!question || isTyping) return;
    
    const userMessage = { 
      text: question, 
      sender: user.email, 
      createdAt: new Date(),
      userPhoto: user.photoURL,
      userName: user.displayName
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const exactMatch = await axiosSecure.get(`/botmessage/${encodeURIComponent(question)}`);
      
      if (exactMatch.data) {
        addBotResponse(exactMatch.data.value, exactMatch.data.key);
        return;
      }
      
      const allMessages = await axiosSecure.get('/botmessage');
      const similarQuestion = allMessages.data.find(msg => 
        msg.key.toLowerCase().includes(question.toLowerCase())
      );
      
      if (similarQuestion) {
        addBotResponse(similarQuestion.value, similarQuestion.key);
      } else {
        addBotResponse(
          "I couldn't find an answer to that. Try asking about: " + 
          welcomeMessages.join(', '),
          'no-match'
        );
      }
    } catch (error) {
      console.error('Error fetching bot response:', error);
      addBotResponse(
        "I'm having trouble connecting right now. Please try again later.",
        'error'
      );
    }
  };

  // Handle sending messages to a conversation
  const handleSendToConversation = async () => {
    const messageText = inputMessage.trim();
    if (!messageText || isTyping || !currentConversation) return;
    
    const userMessage = { 
      text: messageText, 
      sender: user.email, 
      createdAt: new Date(),
      conversationId: currentConversation._id,
      userPhoto: user.photoURL,
      userName: user.displayName
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      await axiosSecure.post("/messages/messages", userMessage);
      setIsTyping(false);
      // Refresh conversation list to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m !== userMessage));
      setIsTyping(false);
    }
  };

  const addBotResponse = (text, key) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text, 
        sender: 'bot', 
        key,
        createdAt: new Date()
      }]);
      setIsTyping(false);
    }, 800);
  };

  // Open a conversation
  const openConversation = (conversation) => {
    setCurrentConversation(conversation);
    setActiveView('conversation');
    fetchConversationMessages(conversation._id);
  };

  // Open the assistant
  const openAssistant = () => {
    setCurrentConversation(null);
    setActiveView('assistant');
    fetchBotMessages();
  };

  // Return to conversation list
  const backToList = () => {
    setActiveView('list');
    setMessages([]);
    setCurrentConversation(null);
  };

  // Load appropriate data when view changes
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      if (activeView === 'assistant') {
        fetchBotMessages();
      }
    } else {
      setMessages([]);
      setCurrentConversation(null);
      setActiveView('list');
    }
  }, [isOpen]);

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50" style={{ height: '450px' }}>
      {/* Header */}
      <div className="bg-purple text-white p-3 rounded-t-lg flex justify-between items-center">
        {activeView === 'list' ? (
          <h3 className="font-bold">Messages</h3>
        ) : activeView === 'assistant' ? (
          <div className="flex items-center">
            <button onClick={backToList} className="mr-2">
              <FaArrowLeft />
            </button>
            <h3 className="font-bold">RentifyHub Assistant</h3>
          </div>
        ) : (
          <div className="flex items-center">
            <button onClick={backToList} className="mr-2">
              <FaArrowLeft />
            </button>
            <div className="flex items-center">
              <img
                src={currentConversation?.participant?.photoURL || "https://via.placeholder.com/100"}
                alt={currentConversation?.participant?.name}
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
              <h3 className="font-bold truncate max-w-xs">
                {currentConversation?.participant?.name || 'Conversation'}
              </h3>
            </div>
          </div>
        )}
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      </div>
      
      {activeView === 'list' ? (
        <>
          {/* Search bar for conversations */}
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
                {/* RentifyHub Assistant as first conversation */}
                <div
                  onClick={openAssistant}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition`}
                >
                  <div className="w-10 h-10 rounded-full bg-purple text-white flex items-center justify-center mr-3">
                    <FaRobot />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">RentifyHub Assistant</h3>
                    <p className="text-sm text-gray-500 truncate">
                      How can I help you today?
                    </p>
                  </div>
                </div>
                
                {/* User conversations */}
                {filteredConversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition`}
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
        </>
      ) : (
        <>
          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && !isTyping ? (
              <div className="text-center text-gray-500 py-4">
                {activeView === 'assistant' ? 'Ask the assistant anything!' : 'No messages yet'}
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.sender === user?.email;
                const isBot = msg.sender === 'bot';
                const showSenderInfo = !isCurrentUser || 
                  (index > 0 && messages[index-1].sender !== msg.sender);
                
                return (
                  <div 
                    key={index} 
                    className={`mb-4 ${isCurrentUser ? 'text-right' : 'text-left'}`}
                  >
                    {showSenderInfo && (
                      <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser && !isBot && (
                          <img
                            src={currentConversation?.participant?.photoURL || "https://via.placeholder.com/100"}
                            alt={currentConversation?.participant?.name}
                            className="w-6 h-6 rounded-full object-cover mr-2"
                          />
                        )}
                        <span className="text-xs font-medium text-gray-600">
                          {isBot ? 'RentifyHub Assistant' : 
                           isCurrentUser ? 'You' : 
                           currentConversation?.participant?.name}
                        </span>
                      </div>
                    )}
                    <div 
                      className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words ${isCurrentUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : isBot ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}
                    >
                      {msg.text}
                    </div>
                    <div className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : 'text-left'} text-gray-500`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="text-left mb-3">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-purple text-white flex items-center justify-center mr-2">
                    <FaRobot size={12} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">RentifyHub Assistant</span>
                </div>
                <div className="inline-block px-3 py-2 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (
                  activeView === 'assistant' ? handleSendToAssistant() : handleSendToConversation()
                )}
                placeholder={
                  activeView === 'assistant' ? 
                  "Ask the assistant..." : 
                  "Type your message..."
                }
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple"
                aria-label="Type your message"
                disabled={isTyping}
              />
              <button
                onClick={
                  activeView === 'assistant' ? 
                  handleSendToAssistant : 
                  handleSendToConversation
                }
                className={`px-4 py-2 rounded-r-lg flex items-center justify-center 
                  ${isTyping ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple hover:bg-purplehover text-white'}`}
                disabled={isTyping}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Main = () => {
  const { loading } = useContext(AuthContext);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className='bg-white'>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <Navbar />
          <div className="min-h-screen">
            <Outlet />
          </div>
          <Footer />
          
          {/* Chatbot Toggle */}
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 bg-purple text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-40"
              aria-label="Open chat"
            >
              <FaRobot size={24} />
            </button>
          )}
          
          {/* Chat Interface */}
          {isChatOpen && <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        </div>
      )}
    </div>
  );
};

export default Main;
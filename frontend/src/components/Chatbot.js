import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Bot, ChevronUp, MessageCircle, PlaneTakeoff, Send, Sparkles, X, RefreshCw } from 'lucide-react';
import './Chatbot.css';
import axiosInstance from './axiosInstance';


const initialMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello, I am SkyAssist. Your friendly airline support assistant!',
  timestamp: new Date(),
  badge: 'AI',
  flights: [] 
};

function formatTime(date) {
  return new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(date);
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const flightHint = useMemo(() => {
    return 'Search flights, compare prices, or ask about booking support.';
  }, []);

  const appendMessage = (nextMessage) => {
    setMessages((current) => [...current, nextMessage]);
  };

  const handleNewChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      const resetWelcome = {
        ...initialMessage,
        id: `welcome-${Date.now()}`,
        timestamp: new Date()
      };
      setMessages([resetWelcome]);
      setMessage('');
    }
  };

  const sendMessage = async (rawMessage) => {
    const content = (rawMessage || message).trim();
    if (!content || isLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage('');
    setIsLoading(true);

    const apiMessagesPayload = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.text
    }));

    try {
      const response = await axios.post('http://localhost:5000/chatbot', { messages: apiMessagesPayload });
      
      appendMessage({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.data.response || 'I could not generate a response right now.',
        flights: response.data.matched_flights || [], 
        timestamp: new Date(),
        badge: 'AI',
      });
    } catch (error) {
      appendMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I could not reach the chatbot service right now. Please try again.',
        timestamp: new Date(),
        badge: 'AI',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-shell">
      {!isOpen && (
        <button className="chatbot-launcher" onClick={() => setIsOpen(true)} aria-label="Open chatbot">
          <span className="chatbot-launcher-glow" />
          <MessageCircle size={22} />
          <span>Ask SkyAssist</span>
        </button>
      )}

      {isOpen && (
        <section className="chatbot-panel" aria-label="Flight booking chatbot">
          <header className="chatbot-header">
            <div className="chatbot-brand">
              <div className="chatbot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <div className="chatbot-title-row">
                  <h3>SkyAssist</h3>
                  <span className="chatbot-badge">AI</span>
                </div>
                <p>Airline support · Fast replies</p>
              </div>
            </div>
            
            <div className="chatbot-header-actions">
              <button 
                className="chatbot-icon-button" 
                onClick={handleNewChat} 
                title="New Chat / Clear Conversation"
                aria-label="Clear chat"
              >
                <RefreshCw size={16} />
              </button>
              <button className="chatbot-icon-button" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="chatbot-subheader">
            <Sparkles size={14} />
            <span>{flightHint}</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((entry) => (
              <article key={entry.id} className={`chatbot-message ${entry.role}`}>
                <div className="chatbot-message-meta">
                  <span className="chatbot-message-badge">{entry.badge || (entry.role === 'user' ? 'You' : 'AI')}</span>
                  <time>{formatTime(entry.timestamp)}</time>
                </div>
                
                {/* সাধারণ টেক্সট মেসেজ বাবল */}
                <div className="chatbot-message-bubble">{entry.text}</div>

                {/* ✈️ রিয়েল-টাইম ফ্লাইট কার্ড উইজেট */}
                {entry.flights && entry.flights.length > 0 && (
                  <div className="chatbot-flight-cards-container">
                    {entry.flights.map((flight, idx) => {
                      const fromCode = flight.origin_code || "";
                      const toCode = flight.destination_code || "";
                      const bookingUrl = `/search?origin=${fromCode}&dest=${toCode}`;

                      return (
                        <div key={idx} className="chatbot-flight-card">
                          <div className="flight-card-header">
                            <span className="flight-airline">✈️ {flight.airline} ({flight.flight_number})</span>
                            <span className="flight-price">${flight.price}</span>
                          </div>
                          <div className="flight-card-body">
                            <p><strong>Route:</strong> {flight.origin_city || flight.origin_code || "Dhaka"} ➔ {flight.destination_city || flight.destination_code || "Istanbul"}</p>
                            <p><strong>Departs:</strong> {flight.departure_time} | <strong>Arrives:</strong> {flight.arrival_time}</p>
                          </div>
                          {/* ডাইনামিক বুকিং ইউআরএল যুক্ত বাটন */}
                          <button 
                            onClick={() => window.location.href = bookingUrl} 
                            className="flight-book-btn"
                          >
                            Book This Flight
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}

            {isLoading && (
              <article className="chatbot-message assistant typing">
                <div className="chatbot-message-meta">
                  <span className="chatbot-message-badge">AI</span>
                  <time>{formatTime(new Date())}</time>
                </div>
                <div className="chatbot-message-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </article>
            )}

            <div ref={messageEndRef} />
          </div>

          <form
            className="chatbot-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <div className="chatbot-input-wrap">
              <PlaneTakeoff size={16} />
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about flights, bookings, OTP, refunds..."
                aria-label="Chat message"
              />
            </div>
            <button type="submit" className="chatbot-send-button" disabled={isLoading || !message.trim()}>
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      {isOpen && (
        <button className="chatbot-collapse" onClick={() => setIsOpen(false)} aria-label="Collapse chatbot">
          <ChevronUp size={16} />
        </button>
      )}
    </div>
  );
}

export default Chatbot;
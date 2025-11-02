// app/page.tsx
import React, { useState } from 'react';
import './globals.css';

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, input]);
    setInput('');
  };

  return (
    <main className="container">
      <h1 className="title">Simple Chat App</h1>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            {msg}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </main>
  );
}


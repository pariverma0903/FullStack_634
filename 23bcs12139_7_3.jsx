//Backend: Express + Socket.io Setup
//Create backend

mkdir server && cd server
npm init -y
npm install express socket.io cors

//server/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});


//Frontend: React + Socket.io-client
npx create-react-app client
cd client
npm install socket.io-client

//src/App.js

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage.trim() === '' || username.trim() === '') return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const messageData = {
      author: username,
      message: currentMessage,
      time: time,
    };

    await socket.emit('send_message', messageData);
    setCurrentMessage('');
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((prev) => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, []);

  return (
    <div className="App">
      <h2>Real-Time Chat</h2>
      <input
        type="text"
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="nameInput"
      />
      <div className="chatBox">
        {messageList.map((msg, i) => (
          <p key={i}>
            <strong>{msg.author}</strong> [{msg.time}]: {msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        className="messageInput"
      />
      <button onClick={sendMessage} className="sendButton">Send</button>
    </div>
  );
}

export default App;


//src/App.css
.App {
  text-align: center;
  max-width: 400px;
  margin: 30px auto;
  border: 1px solid #ccc;
  padding: 20px;
  font-family: Arial;
}

.nameInput, .messageInput {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
}

.chatBox {
  height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  margin-bottom: 10px;
}

.sendButton {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

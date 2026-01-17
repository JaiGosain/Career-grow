import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';

const ChatDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_chat', id);
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error) => {
      setError(error.message);
    });

    setSocket(newSocket);
  };

  const fetchChat = async () => {
    try {
      const response = await axios.get(`/api/chat/${id}`);
      setChat(response.data.chat);
      setMessages(response.data.messages);
      setError('');
    } catch (err) {
      setError('Failed to fetch chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      chatId: id,
      content: newMessage
    });

    setNewMessage('');
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participants.find(p => p._id !== user.id);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !chat) {
    return (
      <Container>
        <Alert severity="error">{error || 'Chat not found'}</Alert>
      </Container>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            {otherParticipant?.name || 'Unknown User'}
          </Typography>
          {chat.job && (
            <Typography variant="body2" color="text.secondary">
              Regarding: {chat.job.title}
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: message.sender._id === user.id ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  maxWidth: '70%',
                  flexDirection: message.sender._id === user.id ? 'row-reverse' : 'row'
                }}
              >
                <Avatar>{message.sender.name?.charAt(0) || 'U'}</Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: message.sender._id === user.id ? 'primary.main' : 'grey.200',
                    color: message.sender._id === user.id ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatDetail;

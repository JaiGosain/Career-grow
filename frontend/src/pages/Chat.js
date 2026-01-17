import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Badge,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat');
      setChats(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user.id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Messages
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : chats.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No conversations yet
        </Typography>
      ) : (
        <Paper>
          <List>
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              return (
                <ListItem
                  key={chat._id}
                  component={Link}
                  to={`/chat/${chat._id}`}
                  sx={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <ListItemAvatar>
                    <Avatar>{otherParticipant?.name?.charAt(0) || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={otherParticipant?.name || 'Unknown User'}
                    secondary={
                      chat.lastMessage
                        ? chat.lastMessage.content.substring(0, 50) + '...'
                        : 'No messages yet'
                    }
                  />
                  {chat.job && (
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {chat.job.title}
                      </Typography>
                    </Box>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default Chat;

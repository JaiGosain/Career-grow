import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const setupSocketIO = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);

    // Join chat room
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.some(p => p.toString() === socket.userId)) {
          socket.join(`chat_${chatId}`);
          socket.emit('joined_chat', chatId);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content } = data;

        if (!chatId || !content) {
          return socket.emit('error', { message: 'Chat ID and content are required' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
        }

        // Verify user is a participant
        if (!chat.participants.some(p => p.toString() === socket.userId)) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Create message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content
        });

        await message.save();
        await message.populate('sender', 'name email profilePicture');

        // Update chat
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.save();

        // Emit to all participants in the chat room
        io.to(`chat_${chatId}`).emit('new_message', message);

        // Notify other participant if they're not in the chat room
        const otherParticipant = chat.participants.find(
          p => p.toString() !== socket.userId
        );
        if (otherParticipant) {
          io.to(otherParticipant.toString()).emit('new_message_notification', {
            chatId,
            message,
            chat
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message', error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('stop_typing', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

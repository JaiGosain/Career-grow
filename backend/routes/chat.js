import express from 'express';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'name email profilePicture')
      .populate('job', 'title company')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get or create chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { participantId, jobId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    })
      .populate('participants', 'name email profilePicture')
      .populate('job', 'title company');

    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, participantId],
        job: jobId || null
      });
      await chat.save();
      await chat.populate('participants', 'name email profilePicture');
      if (jobId) {
        await chat.populate('job', 'title company');
      }
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single chat with messages
router.get('/:id', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email profilePicture')
      .populate('job', 'title company');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ chat: chat._id })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 });

    res.json({ chat, messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Message.updateMany(
      { 
        chat: chat._id,
        sender: { $ne: req.user._id },
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

import express from 'express';

const chatRouter = express.Router();

import {createConversationController, 
    getConversationController, 
    listSessionsController,
    createSessionController,
    getSessionController,
    deleteSessionController,} from './controller/chat.controller.js';


// /api/chat/conversations
// Sessions (sidebar) 
chatRouter.get('/sessions', listSessionsController);
chatRouter.post('/sessions', createSessionController);
chatRouter.get('/sessions/:id', getSessionController);
chatRouter.delete('/sessions/:id', deleteSessionController);
// Messages 
chatRouter.post('/conversations', createConversationController);
chatRouter.get('/conversations', getConversationController);


export default chatRouter;
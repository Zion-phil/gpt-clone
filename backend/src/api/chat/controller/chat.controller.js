import {
    createConversationService,
    getRecentConversationRows,
    createSessionService,
    listSessionsService,
    getSessionService,
    deleteSessionService,
} from '../service/chat.service.js';


export async function createConversationController(req, res) {
    try {
        
        const { Question, sessionId } = req.body;
        const result = await createConversationService(Question, sessionId ?? null);
        res.status(201).json({
            success: true,
            message: 'Conversation posted successfully.',
            data: result,
        });
    } catch (error) {
        console.error(' Controller error:', error.message);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Something went wrong try again later',
        });
    }
}

export async function getConversationController(req, res) {
    try {
        const result = await getRecentConversationRows(100);
        res.status(200).json({
            success: true,
            message: 'Conversations fetched successfully.',
            data: result,
        });
    } catch (error) {
        console.error(' GET error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}



export async function listSessionsController(req, res) {
    try {
        const sessions = await listSessionsService();
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error(' listSessions error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createSessionController(req, res) {
    try {
        const title = req.body?.title || 'New chat';
        const session = await createSessionService(title);
        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error(' createSession error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function getSessionController(req, res) {
    try {
        const session = await getSessionService(Number(req.params.id));
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error(' getSession error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteSessionController(req, res) {
    try {
        const ok = await deleteSessionService(Number(req.params.id));
        res.status(200).json({ success: ok });
    } catch (error) {
        console.error(' deleteSession error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}


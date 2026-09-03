import { createConversationService, getRecentConversationRows} from '../service/chat.service.js';

export async function createConversationController(req, res) {
    try {
        const { Question } = req.body;
        const result = await createConversationService(Question);
        res.status(201).json({
            success: true,
            message: 'Conversation posted successfully.',
            data: result,
        });
    } catch (error) {
        // ✅ Show the actual error
        console.error('❌ Controller error:', error.message);
        
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
        console.error('❌ GET error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


import db from '../../../../db/db.config.js';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

const geminiClient = new GoogleGenAI({ apikey: process.env.GEMINI_API_KEY });

// the logic with the DB and AI integration will be done in here

// 1-we will beuild history
// 2- we'll save the users Que on DB
// 3-USER prompt + history(contect'un) ayayzen we'll send a request to AI model
// 4-AI response tekeblen we'll save it on DB
// 5-le USER response enmelsalen

export const getRecentConversationRows = async (limit = 5) => {
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit = 
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 20
    : normalizedLimit;

    const [rows] = await db.execute(
        `SELECT id, role, content, created_at FROM conversations ORDER BY id DESC LIMIT ${safeLimit}`,
    );
    return rows.reverse();
};

const generateAssistantAnswer = async ({ historyRows, Question }) => {
    // Format history for gemini startchat
    const formattedHistory = historyRows.map(row => ({
        role: row.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: row.content }],
    }));

    const chat = geminiClient.chats.create({
        model: GEMINI_MODEL,
        config: {
            maxOutputTokens: 1024,
        },
        history: formattedHistory,
    });

    const result = await chat.sendMessage({ message: Question });
    console.log(result.usageMetadata.totalTokenCount);
    return { 
        text: result.text,
        totalTokens: result.usageMetadata.totalTokenCount,
    };
};


// fetches all conversations
// array obj as apromise return yaderglnal
const getMessageById = async messageId => {
    const [rows] = await db.execute(
        'SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1',
        [messageId],
    );
    if (!rows[0]) return null;
    return {
        id: rows[0].id,
        role: rows[0].role,
        content: rows[0].content,
        tokenCount: Number(rows[0].token_count || 0),
        createdAt: rows[0].created_at,
    };
};

// creates anew conversation row.
// question as a parameter ykebelal
export async function createConversationService(Question) {
    try {
        
        // validation
        if (!Question.trim()) {
            const error = new Error('Question is required');
            error.status = 400;
            throw error;
        }

        // get recent conversations
        const historyRows = await getRecentConversationRows(5);


        // insert user question

        const [result] = await db.execute(
            'INSERT INTO conversations (content, role) VALUES (?, "user")', 
            [Question],
        );
    
        const { text, totalTokens } = await generateAssistantAnswer({ 
            historyRows, 
            Question, 
        });
    
        const [assistantResult] = await db.execute(
            'INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)',
            ['assistant', text, totalTokens],
        );
    
        const userConversation = await getMessageById(result.insertId);

        const assistantConversation = await getMessageById(assistantResult.insertId);

        return {
            userConversation,
            assistantConversation,  
        };

    } catch (error) { 
    
        throw error;
    }
}

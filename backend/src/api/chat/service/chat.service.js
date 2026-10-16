import db from '../../../../db/db.config.js';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Lazy client so the API key is read after dotenv has run
let geminiClient = null;
function getGeminiClient() {
    if (!geminiClient) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error('GEMINI_API_KEY is not set in .env');
        geminiClient = new GoogleGenAI({ apiKey: key });
    }
    return geminiClient;
}

// the logic with the DB and AI integration will be done in here

// 1-we will beuild history
// 2- we'll save the users Que on DB
// 3-USER prompt + history(contect'un) ayayzen we'll send a request to AI model
// 4-AI response tekeblen we'll save it on DB
// 5-le USER response enmelsalen

// ─── SESSION HELPERS ───────────────────────────────────────────────────

// Creates a new chat session row (one row per sidebar item).
export async function createSessionService(title = 'New chat') {
    const [result] = await db.execute(
        'INSERT INTO sessions (title) VALUES (?)',
        [title.slice(0, 60)],
    );
    return { id: result.insertId, title, createdAt: new Date() };
}

// Lists all sessions for the sidebar, newest first, with a message count.
export async function listSessionsService() {
    const [rows] = await db.execute(
        `SELECT s.id, s.title, s.created_at,
                (SELECT COUNT(*) FROM conversations c WHERE c.session_id = s.id) AS message_count
         FROM sessions s
         ORDER BY s.created_at DESC`,
    );
    return rows.map((r) => ({
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        messageCount: Number(r.message_count || 0),
    }));
}

// Loads one session with all of its messages.
export async function getSessionService(sessionId) {
    const [sessionRows] = await db.execute(
        'SELECT id, title, created_at FROM sessions WHERE id = ? LIMIT 1',
        [sessionId],
    );
    if (!sessionRows[0]) return null;

    const [messages] = await db.execute(
        `SELECT id, role, content, token_count, created_at
         FROM conversations
         WHERE session_id = ?
         ORDER BY id ASC`,
        [sessionId],
    );

    return {
        id: sessionRows[0].id,
        title: sessionRows[0].title,
        createdAt: sessionRows[0].created_at,
        messages: messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            tokenCount: Number(m.token_count || 0),
            createdAt: m.created_at,
        })),
    };
}

// Deletes a session. ON DELETE CASCADE removes its messages too.
export async function deleteSessionService(sessionId) {
    const [result] = await db.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
    return result.affectedRows > 0;
}

// ─── MESSAGE HELPERS ───────────────────────────────────────────────────

// Returns the last N messages of a session, oldest-first (ready for Gemini).
export const getSessionHistoryRows = async (sessionId, limit = 5) => {
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit =
        Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

    const [rows] = await db.execute(
        `SELECT id, role, content, created_at
         FROM conversations
         WHERE session_id = ?
         ORDER BY id DESC
         LIMIT ${safeLimit}`,
        [sessionId],
    );
    return rows.reverse();
};

// Original: recent messages across all sessions (kept for the existing GET).
export const getRecentConversationRows = async (limit = 5) => {
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit =
        Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 20 : normalizedLimit;

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

    const chat = getGeminiClient().chats.create({
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
        'SELECT id, session_id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1',
        [messageId],
    );
    if (!rows[0]) return null;
    return {
        id: rows[0].id,
        sessionId: rows[0].session_id,
        role: rows[0].role,
        content: rows[0].content,
        tokenCount: Number(rows[0].token_count || 0),
        createdAt: rows[0].created_at,
    };
};

// creates anew conversation row.
// question as a parameter ykebelal
// sessionId is optional — if missing, a new session is created automatically.
export async function createConversationService(Question, sessionId = null) {
    try {
        // validation
        if (!Question.trim()) {
            const error = new Error('Question is required');
            error.status = 400;
            throw error;
        }

        let activeSessionId = sessionId;

        // No sessionId → create a new session using the first question as title
        if (!activeSessionId) {
            const [sessionResult] = await db.execute(
                'INSERT INTO sessions (title) VALUES (?)',
                [Question.slice(0, 60)],
            );
            activeSessionId = sessionResult.insertId;
        } else {
            // If the session still has the placeholder title, replace it with the first question
            const [s] = await db.execute('SELECT title FROM sessions WHERE id = ?', [activeSessionId]);
            if (s[0]?.title === 'New chat') {
                await db.execute('UPDATE sessions SET title = ? WHERE id = ?', [
                    Question.slice(0, 60),
                    activeSessionId,
                ]);
            }
        }

        // get recent conversations (only from THIS session for context)
        const historyRows = await getSessionHistoryRows(activeSessionId, 5);

        // insert user question

        const [result] = await db.execute(
            'INSERT INTO conversations (session_id, content, role) VALUES (?, ?, "user")',
            [activeSessionId, Question],
        );

        const { text, totalTokens } = await generateAssistantAnswer({
            historyRows,
            Question,
        });

        const [assistantResult] = await db.execute(
            'INSERT INTO conversations (session_id, role, content, token_count) VALUES (?, ?, ?, ?)',
            [activeSessionId, 'assistant', text, totalTokens],
        );

        const userConversation = await getMessageById(result.insertId);

        const assistantConversation = await getMessageById(assistantResult.insertId);

        return {
            sessionId: activeSessionId,
            userConversation,
            assistantConversation,
        };

    } catch (error) {

        throw error;
    }
}
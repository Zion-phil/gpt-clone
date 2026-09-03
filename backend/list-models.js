import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';

async function listModels() {
    try {
        const client = new GoogleGenAI({ 
            apikey: process.env.GEMINI_API_KEY 
        });
        
        console.log('🔍 Fetching available models...');
        const response = await client.models.list();
        
        console.log('✅ Full response:', JSON.stringify(response, null, 2));
        
        // Check different possible response structures
        const models = response.models || response || [];
        
        if (models.length === 0) {
            console.log('⚠️ No models found in response');
            console.log('📝 Response structure:', Object.keys(response));
            return;
        }
        
        console.log(`✅ Found ${models.length} models:`);
        models.forEach(model => {
            console.log(`📌 ${model.name || model.id}`);
            console.log(`   Display name: ${model.displayName || 'N/A'}`);
            console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

listModels();
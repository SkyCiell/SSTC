import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider } from './baseProvider.js';

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super('gemini');
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async generateCode({ imageBuffer, mimeType, framework, customPrompt, isRefinement, previousCode }) {
    if (!this.apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured in backend .env file. Please add GEMINI_API_KEY to proceed with AI generation.'
      );
    }

    const maskedKey = this.apiKey.length > 14
      ? `${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`
      : 'INVALID';
    console.log(`[GeminiProvider Runtime] Initialized with GEMINI_API_KEY: ${maskedKey}`);

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    
    let promptText = '';
    if (isRefinement && previousCode) {
      promptText = this.buildRefinementSystemPrompt(framework, previousCode, customPrompt);
    } else {
      const systemPrompt = this.buildSystemPrompt(framework);
      const userInstruction = customPrompt
        ? `Additional Refinement Request: ${customPrompt}`
        : 'Please perform a systematic 6-step UI analysis on this screenshot and generate pixel-accurate code matching the image strictly.';
      promptText = `${systemPrompt}\n\n${userInstruction}`;
    }

    const contents = [
      {
        role: 'user',
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: mimeType || 'image/png',
              data: imageBuffer.toString('base64'),
            },
          },
        ],
      },
    ];

    const modelsToTry = Array.from(
      new Set([
        process.env.GEMINI_MODEL,
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-flash-lite-latest',
      ].filter(Boolean))
    );

    let lastError = null;
    let resultText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
        });
        resultText = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || '';
        if (resultText) break;
      } catch (err) {
        console.warn(`[Gemini Model ${modelName} Error]: ${err.message}. Trying next model...`);
        lastError = err;
      }
    }

    if (!resultText) {
      const errMsg = lastError?.message || '';
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || errMsg.includes('insufficient_quota')) {
        throw new Error('Gemini API Quota Exceeded (429 RESOURCE_EXHAUSTED). Free tier limit reached. Please check API key quota or try again in a moment.');
      }
      throw lastError || new Error('Gemini API failed to generate response across all models.');
    }

    const cleanCode = this.extractCodeFromMarkdown(resultText, framework);

    return {
      code: cleanCode,
      rawResponse: resultText,
    };
  }

  extractCodeFromMarkdown(text, framework) {
    if (!text) return '';
    const codeBlockRegex = /```(?:jsx|tsx|javascript|html|xml|css)?\s*([\s\S]*?)```/i;
    const match = text.match(codeBlockRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return text.trim();
  }
}

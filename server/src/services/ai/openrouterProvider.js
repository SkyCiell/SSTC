import OpenAI from 'openai';
import { BaseAIProvider } from './baseProvider.js';

export class OpenRouterProvider extends BaseAIProvider {
  constructor() {
    super('openrouter');
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  async generateCode({ imageBuffer, mimeType, framework, customPrompt, isRefinement, previousCode }) {
    if (!this.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not configured in backend .env file. Please add OPENROUTER_API_KEY to proceed with OpenRouter AI generation.'
      );
    }

    const maskedKey = this.apiKey.length > 14
      ? `${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`
      : 'INVALID';
    console.log(`[OpenRouterProvider Runtime] Initialized with OPENROUTER_API_KEY: ${maskedKey}`);

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: this.apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Screenshot to Code',
      },
    });

    let systemPrompt = '';
    let userInstruction = '';

    if (isRefinement && previousCode) {
      systemPrompt = this.buildRefinementSystemPrompt(framework, previousCode, customPrompt);
      userInstruction = 'Please visually compare the original screenshot with the previous code and return the refined code.';
    } else {
      systemPrompt = this.buildSystemPrompt(framework);
      userInstruction = customPrompt
        ? `Additional Refinement Request: ${customPrompt}`
        : 'Please perform a systematic 6-step UI analysis on this screenshot and generate pixel-accurate code matching the image strictly.';
    }

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType || 'image/png'};base64,${base64Image}`;

    const modelsToTry = Array.from(
      new Set([
        process.env.OPENROUTER_MODEL || 'openrouter/free',
        'google/gemini-2.5-flash:free',
        'meta-llama/llama-3.2-11b-vision-instruct:free',
        'qwen/qwen-2-vl-7b-instruct:free',
      ].filter(Boolean))
    );

    let lastError = null;
    let resultText = '';

    for (const modelName of modelsToTry) {
      try {
        console.log(`[OpenRouter] Sending vision prompt using model: ${modelName}...`);
        const response = await openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userInstruction },
                {
                  type: 'image_url',
                  image_url: { url: dataUrl },
                },
              ],
            },
          ],
          max_tokens: 4096,
        });

        resultText = response.choices[0]?.message?.content || '';
        if (resultText) {
          console.log(`[OpenRouter Success] Generated code using model: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`[OpenRouter Model ${modelName} Error]: ${err.message}. Trying next fallback model...`);
        lastError = err;
      }
    }

    if (!resultText) {
      throw lastError || new Error('OpenRouter API failed to generate response across all models.');
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

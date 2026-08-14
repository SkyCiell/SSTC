import OpenAI from 'openai';
import { BaseAIProvider } from './baseProvider.js';

export class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super('openai');
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async generateCode({ imageBuffer, mimeType, framework, customPrompt, isRefinement, previousCode }) {
    if (!this.apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured in backend .env file. Please add OPENAI_API_KEY to proceed with AI generation.'
      );
    }

    const maskedKey = this.apiKey.length > 14
      ? `${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`
      : 'INVALID';
    console.log(`[OpenAIProvider Runtime] Initialized with OPENAI_API_KEY: ${maskedKey}`);

    const openai = new OpenAI({ apiKey: this.apiKey });
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
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

    const resultText = response.choices[0]?.message?.content || '';
    const cleanCode = this.extractCodeFromMarkdown(resultText, framework);

    return {
      code: cleanCode,
      rawResponse: resultText,
    };
  }

  extractCodeFromMarkdown(text, framework) {
    const codeBlockRegex = /```(?:jsx|tsx|javascript|html|xml|css)?\s*([\s\S]*?)```/i;
    const match = text.match(codeBlockRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return text.trim();
  }
}

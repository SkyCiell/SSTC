import { getAIProvider, MockProvider } from './ai/index.js';

/**
 * Unified AI Service for Screenshot-to-Code generation
 */
export class AIService {
  static async generateCode({ imageBuffer, mimeType, framework, customPrompt, isRefinement, previousCode }) {
    const primaryProvider = getAIProvider();
    let activeProviderName = primaryProvider.name;
    let result;
    let fallbackWarning = null;

    try {
      result = await primaryProvider.generateCode({
        imageBuffer,
        mimeType,
        framework,
        customPrompt,
        isRefinement,
        previousCode,
      });
    } catch (primaryError) {
      console.warn(`[AI Service Error] Primary provider (${primaryProvider.name}) failed: ${primaryError.message}. Switching to Mock Fallback...`);
      
      fallbackWarning = `[AI Warning] Provider ${primaryProvider.name} error (${primaryError.message}). Using Mock Fallback mode.`;
      const mock = new MockProvider();
      result = await mock.generateCode({ framework, customPrompt });
      activeProviderName = 'mock (fallback)';
    }

    return {
      code: result.code,
      rawResponse: result.rawResponse,
      provider: activeProviderName,
      warning: fallbackWarning,
    };
  }
}

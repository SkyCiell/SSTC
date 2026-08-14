import { AIService } from '../services/aiService.js';

export async function handleGenerate(req, res) {
  try {
    let imageBuffer;
    let mimeType = 'image/png';
    let base64Image = '';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
      base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } else if (req.body.imageBase64) {
      base64Image = req.body.imageBase64;
      const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        return res.status(400).json({ error: 'Invalid base64 image format provided.' });
      }
    } else {
      return res.status(400).json({ error: 'Please upload a screenshot image file.' });
    }

    const framework = req.body.framework || 'react-tailwind';
    const customPrompt = req.body.customPrompt || '';
    const isRefinement = req.body.isRefinement === 'true' || req.body.isRefinement === true;
    const previousCode = req.body.previousCode || '';

    const result = await AIService.generateCode({
      imageBuffer,
      mimeType,
      framework,
      customPrompt,
      isRefinement,
      previousCode,
    });

    if (!result || !result.code) {
      return res.status(500).json({ error: 'AI failed to produce valid code output.' });
    }

    return res.status(200).json({
      success: true,
      generatedCode: result.code,
      framework,
      originalImage: base64Image,
      provider: result.provider,
      warning: result.warning,
    });
  } catch (error) {
    console.error('[Generate Controller Error]:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during AI vision processing.',
    });
  }
}

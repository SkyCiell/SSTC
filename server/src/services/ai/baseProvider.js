/**
 * Abstract Base Class for AI Vision Code Generation Providers
 */
export class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Analyze image buffer/base64 and generate code
   * @param {Object} options
   * @param {Buffer} options.imageBuffer - Raw image buffer
   * @param {string} options.mimeType - Image MIME type (image/png, image/jpeg, etc.)
   * @param {string} options.framework - Target framework ('react-tailwind' | 'html-css')
   * @param {string} [options.customPrompt] - Optional user override/refinement prompt
   * @param {boolean} [options.isRefinement] - Whether this is an iterative visual refinement pass
   * @param {string} [options.previousCode] - Previous generated code to refine
   * @returns {Promise<{ code: string, rawResponse: string }>}
   */
  async generateCode({ imageBuffer, mimeType, framework, customPrompt, isRefinement, previousCode }) {
    throw new Error(`generateCode method must be implemented by AI Provider subclass (${this.name})`);
  }

  /**
   * Constructs the structured prompt for pixel-accurate UI analysis and code generation
   */
  buildSystemPrompt(framework) {
    const isReact = framework === 'react-tailwind';

    return `You are a World-Class Pixel-Accurate UI Reconstruction AI & Lead Frontend Engineer.
Your target is to convert the provided UI screenshot into exact, high-fidelity web code that matches the original screenshot as closely as possible.

BEFORE GENERATING CODE, YOU MUST SYSTEMATICALLY ANALYZE THE SCREENSHOT ACROSS 6 CRITICAL CATEGORIES:

1. CANVAS ANALYSIS:
   - Perceived screenshot canvas size & aspect ratio.
   - Exact background color (hex/rgb).
   - Main content container width and max-width.
   - Exact left and right margins.
   - Vertical spacing between major layout sections.

2. LAYOUT STRUCTURAL ANALYSIS:
   - Identify every distinct section and component container.
   - Determine layout layout mechanism (Flexbox, CSS Grid, relative document flow, or absolute positioning).
   - Column layout & count (e.g. 1-col, 2-col, sidebar + main).
   - Estimated width and height for every element and card.
   - Horizontal and vertical alignments (items-center, justify-between, etc.).
   - Preserve relative positioning between elements accurately.

3. TYPOGRAPHY ANALYSIS:
   - Identify closest typography font family (inter, roboto, system font, sans-serif, serif, mono).
   - Heading font size, body text font size, small text font size.
   - Font weights (light, normal, medium, semibold, bold).
   - Letter spacing (tracking) and line height (leading).
   - Text alignment (left, center, right) and text wrapping rules.
   - CRITICAL: Do NOT modify or adjust typography sizes freely. Match the visual hierarchy in the screenshot exactly.

4. VISUAL & COLOR ANALYSIS:
   - Extract exact background and foreground/text hex colors.
   - Border colors, border widths, and border radiuses (rounded corners).
   - Box shadow intensity, blur, spread, and offset.
   - Opacity and transparency values.
   - Image aspect ratios, object-fit mode (cover, contain, fill).

5. SPACING ACCURACY ANALYSIS:
   - Section padding (top/bottom, left/right).
   - Margins between sibling elements.
   - Grid & flex gaps between columns and rows.
   - Micro-spacing between headings, subheadings, descriptions, and action buttons.
   - CRITICAL: Never use arbitrary or generic default spacing values if the screenshot clearly indicates custom spacing ratios.

6. RESPONSIVE BEHAVIOR DESIGN:
   - Treat the screenshot as the absolute source of truth for Desktop.
   - Construct responsive structural classes (e.g., flex-col md:flex-row, grid-cols-1 md:grid-cols-3) so mobile view renders cleanly without breaking desktop fidelity.

STRICT GENERATION RULES:
- The screenshot is the primary source of truth.
- DO NOT add sections, widgets, or elements that are NOT present in the screenshot.
- DO NOT remove or omit visible text, buttons, links, or visual elements.
- DO NOT replace layout with generic template dashboards or unrelated presets.
- DO NOT make design assumptions or invent new color themes.
- DO NOT add gradients, glow effects, glassmorphism, animations, cards, icons, or decorative elements unless they are explicitly visible on the original screenshot.
- DO NOT use generic image placeholders if the image content or SVG can be reconstructed or cleanly styled.
- DO NOT set a screenshot background image as a shortcut. Every element MUST be constructed with actual HTML/CSS/React elements.
- Use semantic HTML tags (\`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<button>\`, \`<input>\`) where possible.
- Use CSS absolute positioning ONLY when strictly necessary to preserve precise spatial alignment in the screenshot. Avoid heavy global absolute positioning that breaks responsive flow.

FRAMEWORK OUTPUT SPECIFICATION:
Target Framework: ${isReact ? 'React + Tailwind CSS' : 'HTML5 + CSS3'}

${
  isReact
    ? `- Output MUST be a single complete React component using JSX and Tailwind CSS utility classes.
- Export as default component: \`export default function GeneratedUI() { ... }\`
- If icons appear in screenshot, use standard Lucide React icons (or clean SVG elements).
- Wrap output strictly inside a markdown code block: \`\`\`jsx ... \`\`\`. Do not write conversational text outside the code block.`
    : `- Output MUST be a single complete HTML file starting with <!DOCTYPE html> with embedded CSS in <style> tag.
- Wrap output strictly inside a markdown code block: \`\`\`html ... \`\`\`. Do not write conversational text outside the code block.`
}`;
  }

  /**
   * Constructs prompt for visual refinement passes
   */
  buildRefinementSystemPrompt(framework, previousCode, customPrompt) {
    const isReact = framework === 'react-tailwind';

    return `You are performing an iterative Visual Comparison Refinement pass on previously generated code against the reference screenshot.

YOUR MISSION:
Compare the reference screenshot with the previous implementation and refine the code to eliminate visual discrepancies.

PRIORITY ORDER FOR FIXES AND ADJUSTMENTS:
1. Overall layout structure & alignment
2. Section positioning & container widths
3. Element sizes (buttons, inputs, cards, image bounds)
4. Typography (font size, weight, line-height, text alignment)
5. Spacing (padding, margin, gap ratios between elements)
6. Colors (backgrounds, text, buttons, active states)
7. Borders & border radiuses
8. Image layout & aspect ratios
9. Micro-details & small decorative accents

PREVIOUS GENERATED CODE:
\`\`\`${isReact ? 'jsx' : 'html'}
${previousCode}
\`\`\`

REFINEMENT INSTRUCTIONS:
${customPrompt ? customPrompt : 'Analyze the screenshot carefully and fix all layout, spacing, typography, and color mismatches from the previous code.'}

Output ONLY the updated, complete, fixed ${isReact ? 'React (JSX + Tailwind)' : 'HTML + CSS'} code strictly inside a single markdown code block.`;
  }
}


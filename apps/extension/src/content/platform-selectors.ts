import type { Platform } from "../types";

export const promptSelectors: Record<Platform, string[]> = {
  chatgpt: ['textarea', '[contenteditable="true"]', '#prompt-textarea'],
  claude: ['div[contenteditable="true"]', 'textarea'],
  gemini: ['rich-textarea div[contenteditable="true"]', 'textarea', '[contenteditable="true"]'],
  perplexity: ['textarea', '[contenteditable="true"]'],
  github: ['textarea[name="comment[body]"]', 'textarea', '[contenteditable="true"]'],
  cursor: ['textarea', '[contenteditable="true"]'],
  generic: ['textarea', '[contenteditable="true"]']
};

export function findPrompt(platform: Platform): HTMLElement | null {
  const selectors = [...(promptSelectors[platform] ?? []), ...promptSelectors.generic];
  for (const selector of selectors) {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 120 && rect.height > 20;
    });
    const visible = candidates.at(-1);
    if (visible) return visible;
  }
  return null;
}

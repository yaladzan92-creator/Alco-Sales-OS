export async function generateAIContent(prompt: string, systemInstruction?: string) {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "AI Generation failed");
  }
  
  return await response.json();
}

export const AGENT_PROMPTS = {
  RESEARCH: "Analyze the following niche and provide market validation, pain points, and target audience persona. Return JSON format.",
  OFFER: "Based on this product and niche, create a compelling IRRESISTIBLE OFFER. Include Headline, Bonuses, Guarantee, and Scarcity. Return JSON.",
  ANGLES: "Generate 5 unique marketing angles (Hooks & Headlines) for this product. Return JSON.",
  COPY: "Write high-converting copywriting for this offer. Type: {type}. Return JSON."
};

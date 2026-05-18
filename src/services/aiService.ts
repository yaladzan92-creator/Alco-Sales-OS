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
  STEP_1_NICHE: "Act as a market research expert. Analyze trends, demand, competition, and monetization for the following niche data. Provide 3 prioritized options/recommendations. Return JSON: { options: [{ id, name, demand_score, competition_score, viral_potential, summary }] }.",
  STEP_2_AUDIENCE: "Based on the niche, provide 3 potential audience personas that are most likely to buy. Return JSON: { options: [{ id, persona_name, emotional_triggers[], buying_behavior, trust_triggers[], analysis }] }.",
  STEP_3_PAIN: "Analyze audience frustrations and desires for the selected persona. Identify 3 distinct profitable angles for problems to solve. Return JSON: { options: [{ id, profitable_problem, top_pain_points[], urgency_score, emotional_score }] }.",
  STEP_4_VALIDATION: "Validate market feasibility for the chosen problem. Provide 3 strategic validation paths. Return JSON: { options: [{ id, validation_score, market_gap, opportunity_recommendation, feasibility_status: 'HIGH' | 'MEDIUM' | 'LOW' }] }.",
  STEP_5_POSITIONING: "Define product positioning. Create 3 different positioning strategies (e.g. Authority-based, Speed-based, Price-based). Return JSON: { options: [{ id, title, positioning_statement, USP, unique_mechanism, value_proposition }] }.",
  STEP_6_OFFER: "Architect 3 irresistible offer stack variations. Return JSON: { options: [{ id, type, main_offer, bonuses[], pricing_strategy, guarantee, urgency }] }.",
  STEP_7_ANGLES: "Generate 3 winning marketing angle sets. Return JSON: { options: [{ id, angle_set_title, angles: [{ title, hook, strategy, cta }] }] }.",
  STEP_8_COPY: "Define 3 distinct copywriting directions/styles. Return JSON: { options: [{ id, name, tone, style, structure_analysis, summary }] }.",
  OPTIMIZE_INPUT: "Act as an expert business consultant. Take the user's raw input and context, then refine, sharpen, and optimize it to be more strategic and effective for business analysis. Provide an optimized version and 3 specific improvement suggestions. Return JSON: { optimized_text, suggestions: [] }.",
  GET_INPUT_SUGGESTIONS: "Based on the project context and the current field label, provide 5 short, punchy, and highly relevant suggestions or recommendation chips that the user can pick to describe their project more accurately. Indonesian language. Return JSON: { suggestions: [] }.",
  GENERATE_ADS_CONTENT: "Act as a world-class ad creative strategist. Based on the provided project strategy, generate high-converting ad content for the requested type. Use Indonesian language. \n\nREQUIRED FIELDS:\n- type, hook, headline, primary_text, cta, visual_direction, emotional_angle, analysis, recommendation, optimization_tips.\n\nTYPE-SPECIFIC DETAILS:\n- For SINGLE IMAGE: include 'image_concept' and 'design_recommendation' in details.\n- For CAROUSEL: include 'slide_structure', 'storytelling_flow', and a list of 'slides' (hook, pain, solution, proof, cta) in details.\n- For VIDEO: include 'script_scenes' (scene by scene), 'narration', 'emotional_pacing', 'subtitle_style', and 'tiktok_reels_structure' in details.\n\nReturn ONLY JSON.",
  GENERATE_VISUAL_DIRECTION: "Generate a detailed image prompt and visual direction for an ad based on the script provided. Indonesian language. Return JSON: { prompt, concept, direction, emotional_tone, cta_placement, composition }.",
  GENERATE_CAROUSEL_DETAILS: "Generate slide-by-slide visual and text placement for a carousel ad. Indonesian language. Return JSON: { visual_progression, layout_type, slides: [{ slide_num, image_desc, text_overlay, strategy }] }.",
  GENERATE_VIDEO_STORYBOARD: "Generate a scene-by-scene video storyboard with visual directions and duration for each scene. Indonesian language. Return JSON: { title, scenes: [{ scene, text, visual, duration }], total_duration, mood_board, music_vibe }."
};

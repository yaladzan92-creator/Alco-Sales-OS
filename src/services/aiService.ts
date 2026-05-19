import { auth } from "@/lib/firebase";

export async function generateAIContent(prompt: string, systemInstruction?: string) {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, systemInstruction }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 429) {
      throw new Error(`QUOTA_EXCEEDED: ${errorData.message || "AI Quota limit reached. Please wait a moment before trying again."}`);
    }
    if (response.status === 403 && errorData.error === "AI_REQUIRED") {
      window.location.href = "/onboarding?error=ai_required";
      throw new Error("AI_CONNECTION_REQUIRED");
    }
    throw new Error(errorData.error || errorData.message || "AI Generation failed");
  }
  
  return await response.json();
}

export async function getUserConfig() {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch("/api/user/config", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

export async function saveUserConfig(data: any) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch("/api/user/config", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
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
  GENERATE_ADS_CONTENT: "Act as a world-class ad creative strategist. Based on the provided project strategy, generate high-converting ad content for the requested type. Use Indonesian language. \n\nREQUIRED FIELDS FOR ALL:\n- type, viral_hook, scroll_stopper_hook, curiosity_hook, emotional_hook, urgency_hook, headlines[] (provide 3), primary_text, cta_direction, hashtags[], communication_tone, target_psychology, analysis, recommendation.\n\nTYPE-SPECIFIC DETAILS:\n- For SINGLE IMAGE: include 'image_prompt', 'visual_psychology', 'composition_guide', 'caption', 'image_concept'.\n- For CAROUSEL: include 'storytelling_direction', 'carousel_caption', and a detailed 'slides' list (Hook, Pain, Emotional Trigger, Solution, Offer, Proof, CTA) each Slide with: title, subtitle, visual_prompt, strategy.\n- For VIDEO: include 'short_video_structure' (TikTok/Reels), 'opening_3s_hook', 'narration_script', 'subtitle_direction', 'emotional_pacing', 'storyboard_prompts' (scene by scene), 'video_caption'.\n\nReturn ONLY JSON.",
  OPTIMIZE_ADS: "Act as a Conversion Rate Optimization (CRO) expert. Refine the provided ad content to make it significantly stronger in terms of hook power, storytelling resonance, emotional impact, and call-to-action urgency. Maintain the Indonesian language. Return updated fields in JSON.",
  GENERATE_VISUAL_DIRECTION: "Generate a detailed image prompt and visual direction for an ad based on the script provided. Indonesian language. Return JSON: { prompt, concept, direction, emotional_tone, cta_placement, composition }.",
  GENERATE_CAROUSEL_DETAILS: "Generate slide-by-slide visual and text placement for a carousel ad. Indonesian language. Return JSON: { visual_progression, layout_type, slides: [{ slide_num, image_desc, text_overlay, strategy }] }.",
  GENERATE_VIDEO_STORYBOARD: "Generate a scene-by-scene video storyboard with visual directions and duration for each scene. Indonesian language. Return JSON: { title, scenes: [{ scene, text, visual, duration }], total_duration, mood_board, music_vibe }.",
  RESEARCH: "Act as a market research expert. Analyze niche trends and provide JSON options.",
  AUDIENCE: "Based on the niche, provide 3 potential audience personas that are most likely to buy. Return JSON.",
  PROBLEM: "Analyze audience frustrations and desires for the selected persona. Identify 3 distinct profitable angles. Return JSON.",
  VALIDATION: "Validate market feasibility for the chosen problem. Return JSON.",
  POSITIONING: "Define product positioning. Create 3 different positioning strategies. Return JSON.",
  OFFER: "Architect irresistable offer stacks. Return JSON.",
  ANGLES: "Generate marketing angle sets. Return JSON.",
  COPY: "Define copywriting directions. Return JSON.",
  PROJECT_SUMMARY: "Act as a Lead Product Strategist. Create a comprehensive 'Project Strategy Summary' based on the workflow data from steps 1-8. Provide the following sections in JSON: { niche_summary: { main_niche, analysis }, target_audience: { group, persona, fears, desires, behaviors }, analysis: { pain_points, market_validation, unique_mechanism }, business_model: { positioning, usp, offer_structure, pricing_strategy }, marketing_strategy: { triggers, winning_angles, hook_direction, cta_direction, tone, platform_rec, content_strategy, ads_direction } }. Use professional Indonesian language."
};

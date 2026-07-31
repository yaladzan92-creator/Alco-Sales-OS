import { mergeWorkflowResult, BrandIntelligence } from "@/services/brandIntelligence";

export interface MetaAdsCampaignPack {
  campaignName: string;
  objective: "OUTCOME_SALES" | "OUTCOME_LEADS" | "OUTCOME_ENGAGEMENT";
  dailyBudget: number;
  targeting: {
    country: string;
    ageMin: number;
    ageMax: number;
    interests: string[];
  };
  adVariants: Array<{
    hook: string;
    headline: string;
    primaryText: string;
    cta: string;
  }>;
}

export function buildMetaAdsCampaignPack(project: any): MetaAdsCampaignPack {
  const bi = mergeWorkflowResult(project);
  return {
    campaignName: `Meta Ads - ${project?.name || "Digital Product"}`,
    objective: "OUTCOME_SALES",
    dailyBudget: 100000,
    targeting: {
      country: project?.nicheData?.input?.country || "Indonesia",
      ageMin: 21,
      ageMax: 45,
      interests: [bi.brandIdentity.niche || "Digital Marketing"]
    },
    adVariants: bi.generatedAssets.hooks.slice(0, 3).map((hook, idx) => ({
      hook,
      headline: bi.generatedAssets.headlines[idx] || "Solusi Produk Digital",
      primaryText: bi.generatedAssets.adCopies[idx] || "Dapatkan panduan lengkap sekarang juga.",
      cta: "Learn More"
    }))
  };
}

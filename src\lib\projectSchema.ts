export type OutputStatus = "empty" | "ai_generated" | "manual_edited" | "outdated";

export interface ProjectOutputMeta {
  key: string;
  label: string;
  status: OutputStatus;
  sourceDependencies: string[];
  lastGeneratedAt: string | null;
  lastEditedAt: string | null;
}

const OUTPUT_DEPENDENCIES: Record<string, string[]> = {
  nicheData: [],
  audienceData: ["nicheData"],
  painPointData: ["nicheData", "audienceData"],
  validationData: ["nicheData", "audienceData", "painPointData"],
  positioningData: ["nicheData", "audienceData", "painPointData", "validationData"],
  offerData: ["audienceData", "painPointData", "positioningData"],
  marketingAngles: ["audienceData", "painPointData", "positioningData", "offerData"],
  copyDirection: ["audienceData", "painPointData", "positioningData", "offerData", "marketingAngles"],
  brandFoundationData: ["nicheData", "audienceData", "painPointData", "positioningData", "offerData", "marketingAngles", "copyDirection"],
  summaryData: ["nicheData", "audienceData", "painPointData", "validationData", "positioningData", "offerData", "marketingAngles", "copyDirection", "brandFoundationData"],
  adsGeneratedAngles: ["brandFoundationData", "marketingAngles", "copyDirection", "offerData"],
  adsRecommendationsState: ["brandFoundationData", "marketingAngles", "copyDirection", "offerData"],
  metaAdsCampaignPack: ["brandFoundationData", "marketingAngles", "copyDirection", "offerData", "adsGeneratedAngles", "adsRecommendationsState"],
  landingPageData: ["audienceData", "painPointData", "positioningData", "offerData", "brandFoundationData", "copyDirection"]
};

const OUTPUT_LABELS: Record<string, string> = {
  nicheData: "Niche Research",
  audienceData: "Audience",
  painPointData: "Pain Point",
  validationData: "Validation",
  positioningData: "Positioning",
  offerData: "Offer",
  marketingAngles: "Marketing Angles",
  copyDirection: "Copy Direction",
  brandFoundationData: "Brand Foundation",
  summaryData: "Strategy Summary",
  adsGeneratedAngles: "Ads Outputs",
  adsRecommendationsState: "Ads Recommendations",
  metaAdsCampaignPack: "Meta Ads Campaign Pack",
  landingPageData: "Landing Page"
};

function nowIso() {
  return new Date().toISOString();
}

function hasMeaningfulValue(value: any): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return true;
}

function inferStatusFromValue(value: any, mode: "auto" | "manual"): OutputStatus {
  if (!hasMeaningfulValue(value)) return "empty";
  return mode === "manual" ? "manual_edited" : "ai_generated";
}

function deepClone<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function extractString(value: any, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toArray(values: Array<any>): string[] {
  return values.filter((value) => typeof value === "string" && value.trim().length > 0);
}

export function deriveSharedBusinessContext(project: any) {
  const niche = project?.nicheData?.selectedOption || project?.nicheData?.input || {};
  const audience = project?.audienceData?.selectedOption || project?.audienceData?.input || {};
  const painPoint = project?.painPointData?.selectedOption || project?.painPointData?.input || {};
  const validation = project?.validationData?.selectedOption || project?.validationData?.input || {};
  const positioning = project?.positioningData?.selectedOption || project?.positioningData?.input || {};
  const offer = project?.offerData?.selectedOption || project?.offerData?.input || {};
  const angle = project?.marketingAngles?.selectedOption || project?.marketingAngles?.input || {};
  const copy = project?.copyDirection?.selectedOption || project?.copyDirection?.input || {};
  const brand = project?.brandFoundationData || {};

  return {
    product: {
      projectName: extractString(project?.name, "Untitled Project"),
      niche: extractString(niche?.name || niche?.title || niche?.interest),
      industry: extractString(niche?.name || niche?.interest),
      summary: extractString(niche?.summary),
      brandName: extractString(brand?.brandName || project?.name)
    },
    audience: {
      primary: extractString(audience?.persona_name || audience?.persona || audience?.audienceGoal),
      demographics: extractString(project?.audienceData?.input?.demographicsGoal),
      buyingBehavior: extractString(audience?.buying_behavior),
      trustTriggers: toArray(audience?.trust_triggers || []),
      emotionalTriggers: toArray(audience?.emotional_triggers || [])
    },
    problem: {
      mainPain: extractString(painPoint?.profitable_problem),
      painPoints: toArray(painPoint?.top_pain_points || [])
    },
    strategy: {
      validationSummary: extractString(validation?.market_gap || validation?.opportunity_recommendation),
      positioning: extractString(positioning?.positioning_statement || positioning?.title),
      usp: extractString(positioning?.USP),
      valueProposition: extractString(positioning?.value_proposition),
      offer: extractString(offer?.main_offer || offer?.type),
      pricing: extractString(offer?.pricing_strategy || offer?.price),
      urgency: extractString(offer?.urgency),
      marketingAngle: extractString(angle?.angle_set_title || angle?.title)
    },
    branding: {
      brandName: extractString(brand?.brandName || project?.name),
      mission: extractString(brand?.mission || positioning?.value_proposition),
      vision: extractString(brand?.vision),
      tagline: extractString(brand?.tagline),
      communicationStyle: Array.isArray(brand?.communicationStyle) ? brand.communicationStyle : [],
      tone: extractString(copy?.tone || project?.toneOfVoice),
      style: extractString(copy?.style)
    },
    campaign: {
      copyDirection: extractString(copy?.name || copy?.summary),
      hooks: Array.isArray(project?.adsGeneratedAngles)
        ? project.adsGeneratedAngles.map((item: any) => item?.hook).filter(Boolean)
        : [],
      landingPageReady: hasMeaningfulValue(project?.landingPageData)
    },
    metadata: {
      currentStep: project?.currentStep || 1,
      activePhase:
        (project?.currentStep || 1) >= 11
          ? "Campaign"
          : (project?.currentStep || 1) >= 10
            ? "Branding"
            : (project?.currentStep || 1) >= 5
              ? "Strategy"
              : "Discovery"
    }
  };
}

export function createOutputRegistry(existing?: Record<string, ProjectOutputMeta>) {
  const registry: Record<string, ProjectOutputMeta> = {};
  for (const key of Object.keys(OUTPUT_DEPENDENCIES)) {
    const previous = existing?.[key];
    registry[key] = {
      key,
      label: OUTPUT_LABELS[key] || key,
      status: previous?.status || "empty",
      sourceDependencies: [...OUTPUT_DEPENDENCIES[key]],
      lastGeneratedAt: previous?.lastGeneratedAt || null,
      lastEditedAt: previous?.lastEditedAt || null
    };
  }
  return registry;
}

export function normalizeProject(project: any) {
  const cloned = deepClone(project || {});
  const outputRegistry = createOutputRegistry(cloned.outputRegistry);
  const sharedBusinessContext = deriveSharedBusinessContext(cloned);

  return {
    ...cloned,
    schemaVersion: "2.0.0",
    workflowVersion: "documentation-phase-1",
    sharedBusinessContext,
    outputRegistry,
    persistenceMeta: {
      mode: cloned?.persistenceMeta?.mode || "local-first",
      activeDriver: cloned?.persistenceMeta?.activeDriver || "mock-firestore",
      backendReady: cloned?.persistenceMeta?.backendReady || false,
      updatedAt: cloned?.persistenceMeta?.updatedAt || null
    }
  };
}

export function buildProjectUpdatePayload(project: any, partialUpdates: Record<string, any>, mode: "auto" | "manual" = "auto") {
  const timestamp = nowIso();
  const mergedProject = normalizeProject({
    ...project,
    ...partialUpdates
  });

  const registry = createOutputRegistry(mergedProject.outputRegistry);
  const changedKeys = Object.keys(partialUpdates).filter((key) => key in registry);

  for (const key of changedKeys) {
    registry[key] = {
      ...registry[key],
      status: inferStatusFromValue(partialUpdates[key], mode),
      lastGeneratedAt: mode === "auto" && hasMeaningfulValue(partialUpdates[key]) ? timestamp : registry[key].lastGeneratedAt,
      lastEditedAt: mode === "manual" && hasMeaningfulValue(partialUpdates[key]) ? timestamp : registry[key].lastEditedAt
    };
  }

  for (const [key, meta] of Object.entries(registry)) {
    if (changedKeys.includes(key)) continue;
    if (meta.status === "empty") continue;
    if (meta.sourceDependencies.some((dependency) => changedKeys.includes(dependency))) {
      registry[key] = {
        ...meta,
        status: meta.status === "manual_edited" ? "manual_edited" : "outdated"
      };
    }
  }

  const normalized = normalizeProject({
    ...mergedProject,
    outputRegistry: registry
  });

  return {
    ...partialUpdates,
    schemaVersion: normalized.schemaVersion,
    workflowVersion: normalized.workflowVersion,
    sharedBusinessContext: normalized.sharedBusinessContext,
    outputRegistry: normalized.outputRegistry
  };
}

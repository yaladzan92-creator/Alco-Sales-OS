import { mergeWorkflowResult } from "@/services/brandIntelligence";
import { createVersionedDocumentationPack } from "@/services/documentationEngine";

export interface ReleasePack {
  releaseId: string;
  version: string;
  timestamp: string;
  projectName: string;
  payload: any;
}

export function generateReleasePack(project: any, version: string = "1.0.0"): ReleasePack {
  const bi = mergeWorkflowResult(project);
  const docPack = createVersionedDocumentationPack(project, `v${version}`);
  return {
    releaseId: `rel_${project?.id || "proj"}_${Date.now()}`,
    version,
    timestamp: new Date().toISOString(),
    projectName: project?.name || "Proyek Digital",
    payload: {
      brandIntelligence: bi,
      docPack
    }
  };
}

export interface ProjectSchema {
  id: string;
  name: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  currentStep?: number;
  nicheData?: any;
  audienceData?: any;
  painPointData?: any;
  validationData?: any;
  positioningData?: any;
  offerData?: any;
  marketingAngles?: any;
  copyDirection?: any;
  brandFoundationData?: any;
  summaryData?: any;
  brandIntelligence?: any;
}

export function validateProjectSchema(project: any): boolean {
  return Boolean(project && typeof project === "object" && (project.id || project.name));
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  platformRole?: "USER" | "SUPER_ADMIN";
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "ANALYST" | "VIEWER";
  billingPlan?: "FREE" | "PRO" | "PREMIUM" | "AGENCY" | "ENTERPRISE";
  logoUrl?: string;
  brandingColor?: string;
}

export interface Brand {
  id: string;
  name: string;
  domain?: string;
  organizationId: string;
  createdAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  domain?: string;
  brandId: string;
}

export interface Prompt {
  id: string;
  queryText: string;
  brandId: string;
  organizationId: string;
  lastRunAt?: string;
  responses?: PromptResponse[];
}

export interface PromptResponse {
  id: string;
  engine?: { name: string };
  status: string;
  content?: string;
}

export interface AnalyticsSummary {
  brands: number;
  activePrompts: number;
  responses: number;
  totalMentions: number;
  competitorMentions: number;
  totalCitations: number;
  avgGeoScore: number;
  avgSentiment: number;
  geoTrend: "up" | "down" | "flat";
}

export interface VisibilityTrend {
  snapshotDate: string;
  geoScore: number;
}

export interface ShareOfVoice {
  share: number;
  breakdown: { name: string; mentions: number }[];
}

export interface Recommendation {
  id: string;
  title: string;
  content: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  organizations: Organization[];
  currentOrg: Organization;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
}

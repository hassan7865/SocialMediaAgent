export interface Company {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  description: string | null;
  industry?: string | null;
  target_audience?: string | null;
  value_proposition?: string | null;
  differentiators?: string | null;
  key_messages?: string[] | null;
}

export interface BrandVoice {
  formality_level: number;
  style: string;
  persona_prompt: string;
  sample_approved_posts?: string[] | null;
}

export interface PlatformConnection {
  id: string;
  company_id?: string;
  platform: string;
  account_id?: string | null;
  account_name: string | null;
  token_expires_at?: string | null;
  is_active: boolean;
  connected_at: string;
}

export interface Post {
  id: string;
  company_id: string;
  platform: string;
  content_text: string;
  scheduled_at?: string | null;
  created_at?: string;
  approval_status?: string;
  status: string;
}

export interface CalendarItem {
  id: string;
  week_start_date: string;
  status: string;
  generated_at?: string | null;
}

export interface Job {
  id: string;
  status: string;
  job_type: string;
  started_at?: string | null;
}

export interface ApprovalWorkflow {
  mode: string;
  reviewer_user_ids: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  can_review: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsSummary {
  total_posts: number;
  avg_engagement: number;
  top_platform: string | null;
  this_month_count: number;
  previous_month_count: number;
  monthly_change_pct: number;
  weekly_reach: number;
}

export interface AnalyticsEngagementPoint {
  bucket: string | null;
  platform: string;
  value: number;
}

export interface AnalyticsTopPost {
  id: string;
  title: string;
  platform: string;
  engagement_rate: number;
  created_at: string;
}

export interface HeatmapPoint {
  dow: number;
  hour: number;
  count: number;
}

export interface PlatformBreakdownItem {
  platform: string;
  count: number;
  share: number;
}

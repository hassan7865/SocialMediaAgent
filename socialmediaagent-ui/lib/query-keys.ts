export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  company: {
    all: ["company"] as const,
  },
  brandVoice: {
    all: ["brand-voice"] as const,
  },
  platforms: {
    all: ["platforms"] as const,
  },
  posts: {
    all: ["posts"] as const,
    byId: (id: string) => ["posts", id] as const,
  },
  calendar: {
    all: ["calendar"] as const,
  },
  approval: {
    workflow: ["approval-workflow"] as const,
    queue: ["approval-queue"] as const,
  },
  admin: {
    users: ["admin", "users"] as const,
  },
  analytics: {
    summary: ["analytics", "summary"] as const,
    engagement: ["analytics", "engagement"] as const,
    topPosts: ["analytics", "top-posts"] as const,
    heatmap: ["analytics", "posting-heatmap"] as const,
    breakdown: ["analytics", "platform-breakdown"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    byId: (id: string) => ["jobs", id] as const,
  },
};

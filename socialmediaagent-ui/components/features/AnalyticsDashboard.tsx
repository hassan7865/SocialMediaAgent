"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, ChartNoAxesColumn, FileText, Sparkles, Trophy } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

import {
  useGetAnalytics,
  useGetAnalyticsBreakdown,
  useGetAnalyticsEngagement,
  useGetAnalyticsHeatmap,
  useGetAnalyticsTopPosts,
} from "@/hooks/useAnalytics";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";

const heatmapRows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapCols = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];

export function AnalyticsDashboard() {
  const summary = useGetAnalytics();
  const engagement = useGetAnalyticsEngagement();
  const topPosts = useGetAnalyticsTopPosts();
  const heatmap = useGetAnalyticsHeatmap();
  const breakdown = useGetAnalyticsBreakdown();

  const engagementData = useMemo(() => {
    const grouped: Record<string, { week: string; linkedin: number; twitter: number; instagram: number; facebook: number }> = {};
    for (const point of engagement.data?.series ?? []) {
      const week = point.bucket ? `W-${point.bucket.slice(5, 10)}` : "N/A";
      if (!grouped[week]) grouped[week] = { week, linkedin: 0, twitter: 0, instagram: 0, facebook: 0 };
      grouped[week][point.platform as "linkedin" | "twitter" | "instagram" | "facebook"] = point.value;
    }
    return Object.values(grouped);
  }, [engagement.data]);

  const heatmapValues = useMemo(() => {
    const matrix = Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => 0));
    for (const point of heatmap.data?.matrix ?? []) {
      const dayIdx = Math.max(0, Math.min(6, (point.dow + 6) % 7));
      const hourBucket = Math.max(0, Math.min(11, Math.floor(point.hour / 2)));
      matrix[dayIdx][hourBucket] = Math.min(100, point.count * 10);
    }
    return matrix;
  }, [heatmap.data]);

  const weeklyReachLabel = useMemo(() => {
    const reach = summary.data?.weekly_reach ?? 0;
    if (reach >= 1000000) return `${(reach / 1000000).toFixed(1)}M`;
    if (reach >= 1000) return `${(reach / 1000).toFixed(1)}k`;
    return `${reach}`;
  }, [summary.data?.weekly_reach]);

  const avgEngagementDelta = useMemo(() => {
    const points = engagement.data?.series ?? [];
    if (points.length < 2) return 0;
    const latest = points[points.length - 1]?.value ?? 0;
    const previous = points[points.length - 2]?.value ?? 0;
    return Number((latest - previous).toFixed(2));
  }, [engagement.data?.series]);

  return (
    <PageContainer wide className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Performance Insights"
        description={`Your content reached ${weeklyReachLabel} people this week.`}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-[12px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_12px_30px_rgba(21,28,39,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Posts</span>
            <FileText size={14} className="text-primary" />
          </div>
          <div className="text-3xl font-black tracking-tighter">{summary.data?.total_posts ?? 0}</div>
          <div className="mt-1 text-xs text-on-surface-variant">Lifetime total</div>
        </div>
        <div className="rounded-[12px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_12px_30px_rgba(21,28,39,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Avg Engagement</span>
            <ChartNoAxesColumn size={14} className="text-primary" />
          </div>
          <div className="text-3xl font-black tracking-tighter text-primary">{summary.data?.avg_engagement ?? 0}%</div>
          <div className={`mt-1 flex items-center gap-1 text-[10px] font-bold ${avgEngagementDelta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
            <ArrowUpRight size={12} />
            {avgEngagementDelta >= 0 ? "+" : ""}{avgEngagementDelta}% vs previous period
          </div>
        </div>
        <div className="rounded-[12px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_12px_30px_rgba(21,28,39,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Top Platform</span>
            <Trophy size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-black tracking-tighter">{summary.data?.top_platform ?? "N/A"}</div>
          <div className="mt-1 text-xs text-on-surface-variant">Top performing channel</div>
        </div>
        <div className="rounded-[12px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_12px_30px_rgba(21,28,39,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Posts This Month</span>
            <Sparkles size={14} className="text-primary" />
          </div>
          <div className="text-3xl font-black tracking-tighter">{summary.data?.this_month_count ?? 0}</div>
          <div className="mt-1 text-[10px] font-bold text-primary">
            {(summary.data?.monthly_change_pct ?? 0) >= 0 ? "+" : ""}
            {summary.data?.monthly_change_pct ?? 0}% vs last month
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_12px_30px_rgba(21,28,39,0.04)] sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Engagement by Platform</h3>
            <p className="text-sm text-on-surface-variant">Weekly interaction distribution across channels</p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant md:gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> LinkedIn</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary" /> X</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-tertiary" /> Instagram</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-outline" /> Facebook</span>
          </div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,195,216,0.3)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fontWeight: 700, fill: "#4a4455" }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid rgba(204,195,216,0.25)",
                  boxShadow: "0px 10px 24px rgba(21,28,39,0.08)",
                }}
              />
              <Bar dataKey="linkedin" fill="#630ed4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="x" fill="#005eb5" radius={[2, 2, 0, 0]} />
              <Bar dataKey="instagram" fill="#9f0044" radius={[2, 2, 0, 0]} />
              <Bar dataKey="facebook" fill="#7b7487" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Best Performing Posts</h3>
            <Button type="button" variant="link" className="h-auto p-0 text-xs font-bold">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {(topPosts.data ?? []).map((post) => (
              <div key={post.title} className="flex items-center gap-4 rounded-xl bg-surface-container-low/40 p-4 transition-all hover:-translate-y-0.5 hover:bg-surface-container-low hover:shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm" />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold">{post.title}</h4>
                  <p className="text-[10px] font-medium text-on-surface-variant">
                    {post.platform} - {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{post.engagement_rate.toFixed(2)}%</div>
                  <p className="text-[10px] text-on-surface-variant">Engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="h-full rounded-[12px] border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_12px_30px_rgba(21,28,39,0.04)] sm:p-6 lg:p-8">
            <h3 className="mb-6 text-lg font-bold tracking-tight">Optimal Posting Times</h3>
            <div className="flex gap-4">
              <div className="flex flex-col justify-between py-1 text-[9px] font-bold uppercase tracking-tight text-on-surface-variant">
                {heatmapRows.map((day) => (
                  <span key={day} className="h-9 leading-9">{day}</span>
                ))}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-12 gap-1.5">
                  {heatmapValues.flatMap((row, rowIdx) =>
                    row.map((val, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="h-8 rounded-[2px] bg-primary"
                        style={{ opacity: Math.max(0.1, val / 100) }}
                      />
                    )),
                  )}
                </div>
                <div className="mt-4 grid grid-cols-12 text-center text-[9px] font-bold uppercase text-on-surface-variant/60">
                  {heatmapCols.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-3">
              <span className="text-[9px] font-bold uppercase text-on-surface-variant/60">Low Engagement</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-sm bg-primary opacity-10" />
                <div className="h-3 w-3 rounded-sm bg-primary opacity-30" />
                <div className="h-3 w-3 rounded-sm bg-primary opacity-60" />
                <div className="h-3 w-3 rounded-sm bg-primary opacity-100" />
              </div>
              <span className="text-[9px] font-bold uppercase text-on-surface-variant/60">Peak Posting</span>
            </div>
          </div>
        </div>
      </div>
      {(summary.isLoading || engagement.isLoading || topPosts.isLoading || heatmap.isLoading || breakdown.isLoading) ? (
        <AppLoader label="Loading analytics data..." />
      ) : null}
    </PageContainer>
  );
}

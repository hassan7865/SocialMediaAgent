"use client";

import { useMemo } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Unplug, Globe, PlugZap, Shield, Sparkles } from "lucide-react";

import { useCreatePlatforms, useDeletePlatforms, useGetPlatforms, useUpdatePlatforms } from "@/hooks/usePlatforms";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import type { PlatformConnection } from "@/types/resources";

export default function PlatformsPage() {
  const { data, isLoading, isError } = useGetPlatforms();
  const connectPlatform = useCreatePlatforms();
  const testPlatform = useUpdatePlatforms();
  const deletePlatform = useDeletePlatforms();

  const platformOptions = useMemo(
    () => [
      { key: "linkedin", label: "LinkedIn", accent: "from-[#0A66C2] to-[#1d9bf0]", hint: "Professional network publishing" },
      { key: "twitter", label: "X / Twitter", accent: "from-[#111827] to-[#374151]", hint: "Short-form and real-time posts" },
      { key: "instagram", label: "Instagram", accent: "from-[#E1306C] to-[#F77737]", hint: "Visual-first content strategy" },
      { key: "facebook", label: "Facebook", accent: "from-[#1877F2] to-[#2563EB]", hint: "Community and page engagement" },
    ],
    [],
  );

  const connectedByPlatform = useMemo(() => {
    const map = new Map<string, PlatformConnection>();
    (data ?? []).forEach((item) => map.set(item.platform, item));
    return map;
  }, [data]);

  const connectedCount = data?.length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        className="bg-gradient-to-br from-white via-surface-container-lowest to-surface-container-low"
        title="Platform Connections"
        description="Connect, test, and manage your publishing channels."
        badge={
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles size={12} />
            Distribution Hub
          </p>
        }
        actions={
          <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
            <div className="rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-center">
              <p className="text-xs text-on-surface-variant">Connected</p>
              <p className="text-lg font-black text-on-surface">{connectedCount}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-center">
              <p className="text-xs text-on-surface-variant">Available</p>
              <p className="text-lg font-black text-on-surface">{platformOptions.length}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/20 bg-white px-3 py-2 text-center">
              <p className="text-xs text-on-surface-variant">Coverage</p>
              <p className="text-lg font-black text-on-surface">{Math.round((connectedCount / platformOptions.length) * 100)}%</p>
            </div>
          </div>
        }
      />

      {isLoading ? <AppLoader label="Loading platform connections..." /> : null}
      {isError ? <p className="text-sm text-destructive">Unable to load platform connections.</p> : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {platformOptions.map((platform) => {
          const connection = connectedByPlatform.get(platform.key);
          const isConnected = Boolean(connection);
          const connectionId = connection?.id ?? "";
          return (
            <div key={platform.key} className="group rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${platform.accent} px-3 py-1 text-xs font-bold text-white`}>
                    {platform.label}
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">{platform.hint}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {isConnected
                      ? `Connected as ${connection?.account_name ?? "Connected account"}`
                      : "Not connected yet"}
                  </p>
                </div>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Active
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low/30 px-3 py-2">
                  <p className="text-on-surface-variant">Status</p>
                  <p className="font-semibold">{isConnected ? "Ready to publish" : "Action required"}</p>
                </div>
                <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low/30 px-3 py-2">
                  <p className="text-on-surface-variant">Last update</p>
                  <p className="font-semibold">{isConnected && connection?.connected_at ? new Date(connection.connected_at).toLocaleDateString() : "-"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => connectPlatform.mutate(platform.key)}
                    disabled={connectPlatform.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {connectPlatform.isPending ? <Loader2 size={14} className="animate-spin" /> : <PlugZap size={14} />}
                    Connect
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => testPlatform.mutate(connectionId)}
                      disabled={testPlatform.isPending || !connectionId}
                      className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-white px-4 py-2 text-sm font-bold"
                    >
                      <ShieldCheck size={14} />
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePlatform.mutate(connectionId)}
                      disabled={deletePlatform.isPending || !connectionId}
                      className="inline-flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive"
                    >
                      <Unplug size={14} />
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Connected Accounts</h2>
          <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
            {connectedCount} Active
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {(data ?? []).length === 0 ? (
            <p className="text-sm text-on-surface-variant">No connected platforms yet.</p>
          ) : (
            (data ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low/30 p-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold capitalize">
                    <Globe size={14} className="text-primary" />
                    {item.platform}
                  </p>
                  <p className="text-xs text-on-surface-variant">{item.account_name ?? item.account_id ?? "Connected account"}</p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <Shield size={12} />
                    Verified
                  </p>
                  <p className="text-xs text-on-surface-variant">Connected at {new Date(item.connected_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </PageContainer>
  );
}

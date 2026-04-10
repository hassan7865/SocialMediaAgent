"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ShieldCheck, Unplug, Globe, PlugZap, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useCreatePlatforms, useDeletePlatforms, useGetPlatforms, useSyncPlatform, useUpdatePlatforms } from "@/hooks/usePlatforms";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import type { PlatformConnection } from "@/types/resources";

export default function PlatformsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pfmSyncDone = useRef(false);
  const { data, isLoading, isError } = useGetPlatforms();
  const connectPlatform = useCreatePlatforms();
  const syncPlatform = useSyncPlatform();
  const testPlatform = useUpdatePlatforms();
  const deletePlatform = useDeletePlatforms();

  useEffect(() => {
    if (typeof window === "undefined" || pfmSyncDone.current) return;
    const params = new URLSearchParams(window.location.search.slice(1).replace(/\?/g, "&"));
    const rawPfmSync = params.get("pfm_sync");
    const pfmError = params.get("error");
    const isSuccess = params.get("isSuccess");
    const pfmFailed = Boolean(pfmError) || isSuccess === "false";

    if (pfmError) {
      toast.error(decodeURIComponent(pfmError.replace(/\+/g, " ")));
    } else if (isSuccess === "false") {
      toast.error("Post for Me did not complete the connection. Check that the account is allowed for this project.");
    }

    if (!rawPfmSync) {
      if (pfmFailed) router.replace("/platforms");
      return;
    }

    let syncKey = decodeURIComponent(rawPfmSync);
    let embeddedProvider: string | null = null;
    const qAt = syncKey.indexOf("?");
    if (qAt !== -1) {
      const inner = new URLSearchParams(syncKey.slice(qAt + 1).replace(/\?/g, "&"));
      embeddedProvider = inner.get("provider");
      syncKey = syncKey.slice(0, qAt);
    }
    syncKey = syncKey.trim();
    if (!syncKey) {
      if (pfmFailed) router.replace("/platforms");
      return;
    }

    pfmSyncDone.current = true;

    if (pfmFailed) {
      router.replace("/platforms");
      return;
    }

    if (syncKey === "all") {
      const providerRaw = params.get("provider") ?? embeddedProvider;
      const provider = providerRaw?.trim() || undefined;
      void (async () => {
        try {
          const url = provider
            ? `/api/platforms/sync/all?provider=${encodeURIComponent(provider)}`
            : "/api/platforms/sync/all";
          await api.post(url);
          await queryClient.invalidateQueries({ queryKey: queryKeys.platforms.all });
          toast.success("Platform connections refreshed from Post for Me");
        } catch {
          toast.error("Could not sync platforms from Post for Me");
        } finally {
          router.replace("/platforms");
        }
      })();
      return;
    }

    syncPlatform.mutate(syncKey, {
      onSuccess: () => {
        toast.success("Platform linked from Post for Me");
        router.replace("/platforms");
      },
      onError: () => {
        router.replace("/platforms");
      },
    });
  }, [router, syncPlatform, queryClient]);

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
        description="OAuth runs through Post for Me. For Quickstart projects, set the Post for Me Project Redirect URL to this app’s /platforms?pfm_sync=all so we can refresh connections after login."
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
                  <p className="font-semibold">{isConnected ? "Ready to publish via Post for Me" : "Connect via Post for Me"}</p>
                </div>
                <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low/30 px-3 py-2">
                  <p className="text-on-surface-variant">Last update</p>
                  <p className="font-semibold">{isConnected && connection?.connected_at ? new Date(connection.connected_at).toLocaleDateString() : "-"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!isConnected ? (
                  <Button
                    type="button"
                    onClick={() => connectPlatform.mutate(platform.key)}
                    disabled={connectPlatform.isPending}
                    className="gap-2 rounded-xl font-bold"
                  >
                    {connectPlatform.isPending ? <Loader2 size={14} className="animate-spin" /> : <PlugZap size={14} />}
                    Connect
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testPlatform.mutate(connectionId)}
                      disabled={testPlatform.isPending || !connectionId}
                      className="gap-2 rounded-xl border-outline-variant/20 font-bold"
                    >
                      <ShieldCheck size={14} />
                      Test
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => deletePlatform.mutate(connectionId)}
                      disabled={deletePlatform.isPending || !connectionId}
                      className="gap-2 rounded-xl font-bold"
                    >
                      <Unplug size={14} />
                      Disconnect
                    </Button>
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

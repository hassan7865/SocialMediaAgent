"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ShieldCheck, Unplug, PlugZap, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useDeletePlatforms, useGetPlatforms, useSyncPlatform, useUpdatePlatforms } from "@/hooks/usePlatforms";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AppLoader } from "@/components/shared/AppLoader";
import { PageContainer, PageHeader } from "@/components/shared/PagePrimitives";
import { Button } from "@/components/ui/button";
import type { PlatformConnection } from "@/types/resources";
import type { ApiResponse } from "@/types/api";

type ConnectResponse = { auth_url: string; platform: string };

const platformIconMap: Record<string, React.ReactNode> = {
  linkedin: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  facebook: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
};

export default function PlatformsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pfmSyncDone = useRef(false);
  const { data, isLoading, isError } = useGetPlatforms();
  
  const linkedinConnect = useMutation({
    mutationKey: ["connect-platform", "linkedin"],
    mutationFn: async () => (await api.post<ApiResponse<ConnectResponse>>("/api/platforms/connect/linkedin")).data,
    onSuccess: (wrapper) => {
      const authUrl = wrapper.data?.auth_url;
      if (authUrl && typeof window !== "undefined") window.location.href = authUrl;
    },
    onError: () => toast.error("Could not start LinkedIn connection"),
  });
  
  const twitterConnect = useMutation({
    mutationKey: ["connect-platform", "twitter"],
    mutationFn: async () => (await api.post<ApiResponse<ConnectResponse>>("/api/platforms/connect/twitter")).data,
    onSuccess: (wrapper) => {
      const authUrl = wrapper.data?.auth_url;
      if (authUrl && typeof window !== "undefined") window.location.href = authUrl;
    },
    onError: () => toast.error("Could not start Twitter connection"),
  });
  
  const instagramConnect = useMutation({
    mutationKey: ["connect-platform", "instagram"],
    mutationFn: async () => (await api.post<ApiResponse<ConnectResponse>>("/api/platforms/connect/instagram")).data,
    onSuccess: (wrapper) => {
      const authUrl = wrapper.data?.auth_url;
      if (authUrl && typeof window !== "undefined") window.location.href = authUrl;
    },
    onError: () => toast.error("Could not start Instagram connection"),
  });
  
  const facebookConnect = useMutation({
    mutationKey: ["connect-platform", "facebook"],
    mutationFn: async () => (await api.post<ApiResponse<ConnectResponse>>("/api/platforms/connect/facebook")).data,
    onSuccess: (wrapper) => {
      const authUrl = wrapper.data?.auth_url;
      if (authUrl && typeof window !== "undefined") window.location.href = authUrl;
    },
    onError: () => toast.error("Could not start Facebook connection"),
  });

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

  const platformIconMap: Record<string, React.ReactNode> = {
  linkedin: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  facebook: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
};

  const platformOptions = useMemo(
    () => [
      { key: "linkedin", label: "LinkedIn", accent: "from-[#0A66C2] to-[#1d9bf0]", hint: "Professional network publishing", icon: platformIconMap.linkedin },
      { key: "twitter", label: "X / Twitter", accent: "from-[#111827] to-[#374151]", hint: "Short-form and real-time posts", icon: platformIconMap.twitter },
      { key: "instagram", label: "Instagram", accent: "from-[#E1306C] to-[#F77737]", hint: "Visual-first content strategy", icon: platformIconMap.instagram },
      { key: "facebook", label: "Facebook", accent: "from-[#1877F2] to-[#2563EB]", hint: "Community and page engagement", icon: platformIconMap.facebook },
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
        description="OAuth runs through Post for Me. For Quickstart projects, set the Post for Me Project Redirect URL to this app's /platforms?pfm_sync=all so we can refresh connections after login."
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
                  <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${platform.accent} px-3 py-1 text-xs font-bold text-white`}>
                    {platform.icon}
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
                    onClick={() => {
                      if (platform.key === "linkedin") linkedinConnect.mutate();
                      else if (platform.key === "twitter") twitterConnect.mutate();
                      else if (platform.key === "instagram") instagramConnect.mutate();
                      else if (platform.key === "facebook") facebookConnect.mutate();
                    }}
                    disabled={
                      (platform.key === "linkedin" && linkedinConnect.isPending) ||
                      (platform.key === "twitter" && twitterConnect.isPending) ||
                      (platform.key === "instagram" && instagramConnect.isPending) ||
                      (platform.key === "facebook" && facebookConnect.isPending)
                    }
                    className="gap-2 rounded-xl font-bold"
                  >
                    {(platform.key === "linkedin" && linkedinConnect.isPending) ||
                    (platform.key === "twitter" && twitterConnect.isPending) ||
                    (platform.key === "instagram" && instagramConnect.isPending) ||
                    (platform.key === "facebook" && facebookConnect.isPending) ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <PlugZap size={14} />
                    )}
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
                    {platformIconMap[item.platform] || <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>}
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
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowUp,
  Clapperboard,
  ChevronDown,
  Download,
  History as HistoryIcon,
  Image as ImageIcon,
  Layers,
  LogOut,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  UploadCloud,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { ModelCard } from "@/components/studio/model-card";
import { AspectRatioPicker } from "@/components/studio/aspect-ratio-picker";
import { StyleCards } from "@/components/studio/style-cards";
import { InteractiveHoverButton, LogoutButton } from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";
import { clearSession, getSession, SESSION_EVENT } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n/context";
import {
  createGeneration,
  enhancePrompt,
  getCreditsBalance,
  getModelCatalog,
  pollGeneration,
  type CatalogEntry,
} from "@/lib/generation-client";
import { IMAGE_MODELS, VIDEO_MODELS, IMAGE_STYLES, ASPECT_RATIOS } from "@/lib/models";

type StudioStatus = "idle" | "loading" | "done" | "failed";

const STYLE_SUFFIXES: Record<string, string> = {
  None: "",
  Cinematic: ", cinematic lighting, dramatic composition, shallow depth of field, film grain",
  Anime: ", anime style, vibrant cel-shaded illustration, clean line art",
  Photo: ", photorealistic, shot on DSLR, natural lighting, high detail",
  Illustration: ", digital illustration, painterly style, rich color palette",
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function StudioShell({ mediaType }: { mediaType: "image" | "video" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const isVideo = mediaType === "video";
  const models = isVideo ? VIDEO_MODELS : IMAGE_MODELS;

  function handleLogout() {
    clearSession();
    toast.success(t.toast.loggedOut);
    router.push("/");
  }

  const NAV_ITEMS = [
    { href: "/history", label: t.studio.history, icon: HistoryIcon },
    { href: "/studio/image", label: t.studio.image, icon: ImageIcon },
    { href: "/studio/video", label: t.studio.video, icon: Clapperboard },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [modelId, setModelId] = useState(models[isVideo ? 3 : 1]?.id ?? models[0].id);
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [style, setStyle] = useState<string>(IMAGE_STYLES[0]);
  const [aspect, setAspect] = useState<string>(ASPECT_RATIOS[isVideo ? 0 : 1]);
  const [duration, setDuration] = useState<number | null>(null);
  const [source, setSource] = useState<"text" | "image">("text");
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [status, setStatus] = useState<StudioStatus>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [enhanceBusy, setEnhanceBusy] = useState<"enhance" | "variation" | null>(null);

  const [catalog, setCatalog] = useState<Record<string, CatalogEntry>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const syncSession = () => {
      const session = getSession();
      setSignedIn(!!session);
      setAuthChecked(true);
      if (!session) {
        router.replace(`/signup?next=/studio/${mediaType}`);
      }
    };
    syncSession();
    window.addEventListener(SESSION_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(SESSION_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [mediaType, router]);

  useEffect(() => {
    getModelCatalog()
      .then((res) => {
        const map: Record<string, CatalogEntry> = {};
        for (const entry of isVideo ? res.video : res.image) map[entry.id] = entry;
        setCatalog(map);
      })
      .catch(() => {});
    getCreditsBalance()
      .then(setBalance)
      .catch(() => {});
  }, [isVideo]);

  const model = models.find((m) => m.id === modelId) ?? models[0];
  const catalogEntry = catalog[modelId];
  const durations = catalogEntry?.durations ?? [5, 8];

  useEffect(() => {
    if (isVideo && durations.length && !durations.includes(duration ?? -1)) {
      setDuration(durations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, catalog, isVideo]);

  const cost = useMemo(() => {
    if (isVideo) {
      const rate = catalogEntry?.creditsPerSecond ?? parseFloat(model.costPerUnit) ?? 1;
      return Math.max(1, Math.ceil(rate * (duration ?? durations[0] ?? 5)));
    }
    return catalogEntry?.creditsCost ?? (parseInt(model.costPerUnit, 10) || 1);
  }, [isVideo, catalogEntry, model, duration, durations]);

  const disabledReason = useMemo(() => {
    if (isVideo && source === "image" && !uploadName) return t.studio.uploadImageToGenerate;
    if ((!isVideo || source === "text") && !prompt.trim()) return t.studio.enterPromptToGenerate;
    if (catalogEntry && !catalogEntry.unlocked) return t.studio.upgradeToUseModel;
    if (balance !== null && balance < cost) return t.studio.notEnoughCredits;
    return null;
  }, [isVideo, source, uploadName, prompt, catalogEntry, balance, cost, t]);

  function handleUpload(file: File | undefined) {
    setUploadError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(t.toast.uploadInvalidType);
      toast.error(t.toast.uploadInvalidType);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(t.toast.uploadTooLarge);
      toast.error(t.toast.uploadTooLarge);
      return;
    }
    setSource("image");
    setUploadName(file.name);
  }

  async function handleEnhance(mode: "enhance" | "variation") {
    if (!prompt.trim() || enhanceBusy) return;
    setEnhanceBusy(mode);
    try {
      const result = await enhancePrompt({ prompt, mode, type: isVideo ? "VIDEO" : "IMAGE" });
      setPrompt(result.prompt);
    } catch {
      // Leave the existing prompt untouched on failure.
    } finally {
      setEnhanceBusy(null);
    }
  }

  async function handleGenerate() {
    setStatus("loading");
    setStartedAt(Date.now());
    setOutputUrl(null);
    setFailureMessage(null);

    const finalPrompt = !isVideo && style !== "None" ? `${prompt}${STYLE_SUFFIXES[style] ?? ""}` : prompt.trim() || (isVideo ? "Animate this image with subtle, natural motion." : "");

    try {
      const { id } = await createGeneration({
        type: isVideo ? "VIDEO" : "IMAGE",
        model: modelId,
        prompt: finalPrompt,
        settings: isVideo
          ? { aspectRatio: aspect, durationSeconds: duration ?? durations[0] }
          : { aspectRatio: aspect },
      });
      const result = await pollGeneration(id, isVideo ? { timeoutMs: 150_000 } : undefined);
      if (result.status === "COMPLETE" && result.outputUrl) {
        setOutputUrl(result.outputUrl);
        setStatus("done");
        toast.success(t.toast.generationReady);
      } else {
        const message = result.userMessage ?? t.studio.generationFailed;
        setFailureMessage(message);
        setStatus("failed");
        toast.error(t.toast.generationFailed, { description: message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setFailureMessage(message);
      setStatus("failed");
      toast.error(t.toast.generationFailed, { description: message });
    } finally {
      getCreditsBalance().then(setBalance).catch(() => {});
    }
  }

  if (!authChecked || !signedIn) {
    return (
      <div className="flex h-[calc(100svh-5rem)] min-h-0 items-center justify-center bg-background">
        <Loader2 size={22} className="animate-spin text-accent-hi" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-5rem)] min-h-0 bg-background text-text">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden min-h-0 shrink-0 flex-col border-r border-border-soft bg-background transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center justify-between px-3", collapsed && "justify-center px-0")}>
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex size-9 items-center justify-center rounded-xl border border-border-soft bg-surface text-text-muted shadow-sm transition-colors hover:border-accent/40 hover:text-accent"
            >
              <PanelLeftOpen size={17} />
            </button>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-wash text-accent">
                  <Wand2 size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">Creative studio</p>
                  <p className="truncate text-[11px] text-text-faint">Your workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
              >
                <PanelLeftClose size={16} />
              </button>
            </>
          )}
        </div>
        <div className={cn("mx-3 mb-3 h-px bg-border-soft", collapsed && "mx-2")} />
        <nav className="flex flex-1 flex-col gap-1.5 px-3 pb-3">
          {!collapsed && (
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-faint">
              {t.nav.create}
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
                  active
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "text-text-muted hover:bg-surface-2 hover:text-text",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon size={17} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {signedIn && (
          <>
            <div className={cn("mx-3 mb-3 h-px bg-border-soft", collapsed && "mx-2")} />
            <div className={cn("px-3 pb-3", collapsed && "px-2")}>
              {collapsed ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t.studio.logOut}
                  className="flex h-11 w-full items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <LogOut size={17} />
                </button>
              ) : (
                <LogoutButton onClick={handleLogout} text={t.studio.logOut} size="sm" fullWidth />
              )}
            </div>
          </>
        )}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Canvas */}
        <div
          className="relative flex-1 overflow-hidden bg-background"
          onDragOver={(e) => {
            if (!isVideo) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (!isVideo) return;
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files?.[0]);
          }}
        >
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center gap-3 px-6 pb-40 text-center"
              >
                <Layers size={28} className="text-text-faint" strokeWidth={1.5} />
                <p className="text-sm text-text-faint">
                  {isVideo ? "Start creating, or drop a starting image" : "Start creating"}
                </p>
                {dragOver && (
                  <span className="text-xs font-medium text-accent-hi">Drop to use as your starting image</span>
                )}
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center gap-3 px-6 pb-40 text-center"
              >
                <Loader2 size={24} className="animate-spin text-accent-hi" />
                <p className="text-sm text-text-muted">Generating your {isVideo ? "video" : "image"}…</p>
                <p className="text-xs text-text-faint">Estimated {model.eta}</p>
              </motion.div>
            )}

            {status === "done" && outputUrl && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full items-center justify-center px-6 pb-40 pt-6"
              >
                <div className="relative max-h-full max-w-2xl overflow-hidden rounded-2xl border border-border-soft bg-black">
                  {isVideo ? (
                    <video src={outputUrl} controls autoPlay loop className="max-h-[60svh] w-full object-contain" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={outputUrl} alt="Generated result" className="max-h-[60svh] w-full object-contain" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-3">
                    <span className="text-xs font-medium text-white/80">Generated</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus("idle")}
                        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                      >
                        <RotateCcw size={12} />
                        New
                      </button>
                      <a
                        href={outputUrl}
                        download
                        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:opacity-90"
                      >
                        <Download size={12} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {status === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center gap-3 px-6 pb-40 text-center"
              >
                <AlertCircle size={22} className="text-text-faint" />
                <p className="max-w-sm text-sm text-text-muted">{failureMessage ?? t.studio.generationFailed}</p>
                <InteractiveHoverButton type="button" text={t.studio.tryAgain} size="sm" onClick={() => setStatus("idle")} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Composer */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-3 shadow-2xl">
              {isVideo && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex rounded-lg border border-border-soft bg-bg p-0.5">
                    {(["text", "image"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSource(tab)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                          source === tab ? "bg-surface-2 text-text" : "text-text-faint hover:text-text-muted",
                        )}
                      >
                        {tab === "text" ? "Text → Video" : "Image → Video"}
                      </button>
                    ))}
                  </div>
                  {source === "image" && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1 text-xs font-medium text-text-faint transition-colors hover:border-accent/50 hover:text-accent-hi"
                      >
                        <UploadCloud size={12} />
                        {uploadName ?? "Upload image"}
                      </button>
                    </>
                  )}
                  {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.shiftKey) return;
                  e.preventDefault();
                  if (status !== "loading" && !disabledReason) handleGenerate();
                }}
                placeholder={isVideo ? "Describe the motion (optional)…" : "What do you want to create?"}
                rows={expanded ? 5 : 1}
                className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-6 text-text outline-none placeholder:text-text-faint focus:ring-0"
              />

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-label="Toggle expanded prompt"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-surface-2 hover:text-text-muted"
                  >
                    <ChevronDown size={15} className={cn("transition-transform", expanded && "rotate-180")} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnhance("enhance")}
                    disabled={!prompt.trim() || !!enhanceBusy}
                    title="Enhance prompt"
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-accent-hi disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {enhanceBusy === "enhance" ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                    Enhance
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnhance("variation")}
                    disabled={!prompt.trim() || !!enhanceBusy}
                    title="Try a variation"
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-accent-hi disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {enhanceBusy === "variation" ? <Loader2 size={13} className="animate-spin" /> : <Shuffle size={13} />}
                    Variation
                  </button>
                </div>

                <div className="flex items-end gap-2">
                  <span className="hidden max-w-32 truncate text-xs font-medium text-text-faint sm:inline">
                    {model.name}
                  </span>
                  <div className="flex flex-row-reverse items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={status === "loading" || !!disabledReason}
                      title={disabledReason ?? `${cost} ${cost === 1 ? "credit" : "credits"}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-sm shadow-accent/25 transition-colors hover:bg-accent-hi disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {status === "loading" ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ArrowUp size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(true)}
                      aria-label="Open generation settings and choose a model"
                      title="Generation settings"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft bg-bg text-text-muted shadow-sm transition-all hover:border-accent/40 hover:bg-accent-wash hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      <SlidersHorizontal size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings slide-over */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-x-0 bottom-0 top-20 z-40 bg-black/45 backdrop-blur-[2px]"
            />
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-20 z-50 flex h-[calc(100svh-5rem)] w-full max-w-md flex-col border-l border-border-soft bg-background shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border-soft px-6 py-5">
                <h2 className="text-base font-semibold text-text">Generation settings</h2>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-7">
                  <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">Model</p>
                    <div className="flex flex-col gap-2">
                      {models.map((m) => (
                        <ModelCard
                          key={m.id}
                          model={m}
                          selected={m.id === modelId}
                          onSelect={() => setModelId(m.id)}
                          disabled={catalog[m.id] ? !catalog[m.id].unlocked : false}
                          disabledReason={t.studio.upgradeToUseModel}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="border-t border-border-soft pt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">
                      Aspect ratio
                    </p>
                    <AspectRatioPicker options={ASPECT_RATIOS} value={aspect} onChange={setAspect} />
                  </section>

                  {isVideo ? (
                    <section className="border-t border-border-soft pt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">Duration</p>
                      <div className="flex gap-2">
                        {durations.map((d) => (
                          <button
                            key={d}
                            type="button"
                            aria-pressed={duration === d}
                            onClick={() => setDuration(d)}
                            className={cn(
                              "flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all",
                              duration === d
                                ? "border-accent bg-accent-wash text-accent-hi"
                                : "border-border-soft bg-surface text-text-faint hover:border-border hover:bg-surface-2",
                            )}
                          >
                            {d}s
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : (
                    <section className="border-t border-border-soft pt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-faint">Style</p>
                      <StyleCards options={IMAGE_STYLES} value={style} onChange={setStyle} />
                    </section>
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-border-soft bg-surface px-6 py-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-text-faint">{t.studio.estimatedCost}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-text">
                    <Zap size={13} className="text-accent-hi" />
                    {cost} {cost === 1 ? t.studio.credit : t.studio.credits}
                  </span>
                </div>
                <InteractiveHoverButton
                  type="button"
                  text={t.studio.done}
                  fullWidth
                  size="lg"
                  onClick={() => setSettingsOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

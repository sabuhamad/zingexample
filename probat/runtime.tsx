// probat/runtime.tsx

import * as React from "react";

declare global {
interface Window {
    __PROBAT_API?: string;
}
}

const ENV_BASE: string =
(typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PROBAT_API) ||
(typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_PROBAT_API) ||
(typeof window !== "undefined" && window.__PROBAT_API) ||
"https://gushi.onrender.com";

const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const KEY = (proposalId: string) => `probat_choice_v3:${proposalId}`;
const VISIT_KEY = (proposalId: string, label: string) => `probat_visit_v1:${proposalId}:${label}`;
const visitMemo = new Set<string>();

// Shared promise cache to prevent multiple simultaneous API calls for the same proposal
const pendingFetches = new Map<string, Promise<{ experiment_id: string; label: string }>>();

type RetrieveResponse = {
proposal_id: string;
experiment_id: string | null;
label: string | null;
};

type Choice = {
experiment_id: string;
label: string;
ts: number;
};

function safeGet(k: string): any | null {
try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
} catch {
    return null;
}
}
function safeSet(k: string, v: any) {
try {
    localStorage.setItem(k, JSON.stringify(v));
} catch {}
}
function now() { return Date.now(); }
function fresh(ts: number) { return now() - ts <= TTL_MS; }
function readChoice(proposalId: string): Choice | null {
const c = safeGet(KEY(proposalId)) as Choice | null;
return c && fresh(c.ts) ? c : null;
}
function writeChoice(proposalId: string, experiment_id: string, label: string) {
safeSet(KEY(proposalId), { experiment_id, label, ts: now() } as Choice);
}

async function fetchDecision(baseUrl: string, proposalId: string): Promise<{ experiment_id: string; label: string }> {
// Check if there's already a pending fetch for this proposal
const existingFetch = pendingFetches.get(proposalId);
if (existingFetch) {
    return existingFetch;
}

// Check cache first (double-check after potential race)
const cached = readChoice(proposalId);
if (cached) {
    return { experiment_id: cached.experiment_id, label: cached.label };
}

// Create new fetch promise
const fetchPromise = (async () => {
    try {
        const url = `${baseUrl.replace(/\/$/, "")}/retrieve_react_experiment/${encodeURIComponent(proposalId)}`;
        const res = await fetch(url, { 
            method: "POST", 
            headers: { Accept: "application/json" },
            credentials: "include" // Include cookies for user identification
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as RetrieveResponse;

        const experiment_id = (data.experiment_id || `exp_${proposalId}`).toString();
        const label = data.label && data.label.trim() ? data.label : "control";

        writeChoice(proposalId, experiment_id, label);
        return { experiment_id, label };
    } finally {
        // Remove from pending cache after completion
        pendingFetches.delete(proposalId);
    }
})();

// Store the promise so other components can wait for the same call
pendingFetches.set(proposalId, fetchPromise);
return fetchPromise;
}

function hasTrackedVisit(proposalId: string, label: string): boolean {
const key = VISIT_KEY(proposalId, label);
if (visitMemo.has(key)) return true;
try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts) || ts <= 0) return false;
    if (now() - ts > TTL_MS) {
    localStorage.removeItem(key);
    return false;
    }
    visitMemo.add(key);
    return true;
} catch {
    return false;
}
}

function markTrackedVisit(proposalId: string, label: string) {
const key = VISIT_KEY(proposalId, label);
visitMemo.add(key);
try {
    localStorage.setItem(key, now().toString());
} catch {}
}

/**
 * Detect if the code is running on localhost (development environment).
 * Returns "dev" for localhost, "prod" for production.
 */
function detectEnvironment(): "dev" | "prod" {
if (typeof window === "undefined") {
    return "prod"; // Server-side, default to prod
}

const hostname = window.location.hostname;

// Check for localhost, 127.0.0.1, or local IP addresses
if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.16.") ||
    hostname.startsWith("172.17.") ||
    hostname.startsWith("172.18.") ||
    hostname.startsWith("172.19.") ||
    hostname.startsWith("172.20.") ||
    hostname.startsWith("172.21.") ||
    hostname.startsWith("172.22.") ||
    hostname.startsWith("172.23.") ||
    hostname.startsWith("172.24.") ||
    hostname.startsWith("172.25.") ||
    hostname.startsWith("172.26.") ||
    hostname.startsWith("172.27.") ||
    hostname.startsWith("172.28.") ||
    hostname.startsWith("172.29.") ||
    hostname.startsWith("172.30.") ||
    hostname.startsWith("172.31.")
) {
    return "dev";
}

return "prod";
}

async function sendVisitMetric(baseUrl: string, proposalId: string, experiment_id?: string, variant_label?: string) {
const url = `${baseUrl.replace(/\/$/, "")}/send_metrics/${encodeURIComponent(proposalId)}`;
const body = {
    experiment_id: experiment_id ?? null,
    variant_label: variant_label ?? "control",
    metric_name: "visit",
    metric_value: 1,
    metric_unit: "count",
    source: "react",
    environment: detectEnvironment(), // Include environment (dev or prod)
    dimensions: {},
    captured_at: new Date().toISOString(),
};
try {
    await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    credentials: "include", // CRITICAL: Include cookies to distinguish different users
    body: JSON.stringify(body),
    });
} catch {}
}

function recordVisit(baseUrl: string, proposalId: string, experiment_id?: string, variant_label?: string) {
const label = variant_label ?? "control";
if (hasTrackedVisit(proposalId, label)) return;
markTrackedVisit(proposalId, label);
void sendVisitMetric(baseUrl, proposalId, experiment_id, label);
}

function extractClickMeta(event?: React.MouseEvent): Record<string, any> | undefined {
if (!event) return undefined;
const rawTarget = event.target as HTMLElement | null;
if (!rawTarget) return undefined;
const actionable = rawTarget.closest("[data-probat-conversion='true'], button, a, [role='button']");
if (!actionable) return undefined;
const meta: Record<string, any> = {
    target_tag: actionable.tagName,
};
if (actionable.id) meta.target_id = actionable.id;
const attr = actionable.getAttribute("data-probat-conversion");
if (attr) meta.conversion_attr = attr;
const text = actionable.textContent?.trim();
if (text) meta.target_text = text.slice(0, 120);
return meta;
}

async function sendClickMetric(baseUrl: string, proposalId: string, _experiment_id?: string, variant_label?: string, meta?: Record<string, any>) {
const url = `${baseUrl.replace(/\/$/, "")}/send_metrics/${encodeURIComponent(proposalId)}`;
const body = {
    experiment_id: null,
    variant_label: variant_label ?? "control",
    metric_name: "click",
    metric_value: 1,
    metric_unit: "count",
    source: "react",
    environment: detectEnvironment(), // Include environment (dev or prod)
    dimensions: meta ?? {},
    captured_at: new Date().toISOString(),
};
try {
    await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    credentials: "include", // CRITICAL: Include cookies to distinguish different users
    body: JSON.stringify(body),
    });
} catch {}
}

type WithExperimentOpts = {
proposalId: string;
registry: Record<string, React.ComponentType<any>>;
};

export function withExperiment<P = any>(
    Control: React.ComponentType<P>,
    opts: WithExperimentOpts
): React.ComponentType<P & { probat?: { trackClick: () => void } }> {
const { proposalId, registry } = opts;

function Wrapped(props: P) {
    const [choice, setChoice] = React.useState<{ experiment_id: string; label: string } | null>(null);

    React.useEffect(() => {
    let alive = true;

    const cached = readChoice(proposalId);
    if (cached) {
        setChoice({ experiment_id: cached.experiment_id, label: cached.label });
    }

    if (!cached) {
        (async () => {
        try {
            const { experiment_id, label } = await fetchDecision(ENV_BASE, proposalId);
            if (!alive) return;
            setChoice({ experiment_id, label });
        } catch (e) {
            if (!alive) return;
            setChoice({ experiment_id: `exp_${proposalId}`, label: "control" });
        }
        })();
    }

    return () => { alive = false; };
    }, [proposalId]);

    React.useEffect(() => {
    const exp = choice?.experiment_id;
    const lbl = choice?.label ?? "control";
    if (!lbl) return;
    recordVisit(ENV_BASE, proposalId, exp ?? undefined, lbl);
    }, [proposalId, choice?.experiment_id, choice?.label]);

    const trackClick = React.useCallback(
    (event?: React.MouseEvent | null, options?: { force?: boolean }) => {
        const exp = choice?.experiment_id;
        const lbl = choice?.label ?? "control";
        const meta = extractClickMeta(event ?? undefined);
        if (!options?.force && event && !meta) {
        return false;
        }
        void sendClickMetric(ENV_BASE, proposalId, exp, lbl, meta);
        return true;
    },
    [proposalId, choice?.experiment_id, choice?.label]
    );

    const label = choice?.label ?? "control";
    const Variant = registry[label] || Control;

    const key = `${proposalId}:${label}`;
    return (
    <div
        onClick={(event) => {
        trackClick(event);
        }}
        data-probat-proposal={proposalId}
    >
        {React.createElement(Variant, {
        key,
        ...(props as any),
        probat: { trackClick: () => trackClick(null, { force: true }) },
        })}
    </div>
    );
}

(Wrapped as any).displayName = `withExperiment(${(Control as any).displayName || Control.name || "Component"})`;
return Wrapped as any;
}

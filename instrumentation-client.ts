import posthog from "posthog-js";

// Guard PostHog initialization to avoid noisy AbortError in dev and when key is missing
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (typeof window !== "undefined" && key) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    capture_exceptions: true, // Enable Error Tracking
    debug: false, // keep quiet to avoid console noise in dev
  });
}

export {};

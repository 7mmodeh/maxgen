"use client";

import { useEffect, useMemo, useState } from "react";

function msToParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / (24 * 3600));
  const hours = Math.floor((total % (24 * 3600)) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function ResetCountdown({
  unlockAtIso,
}: {
  unlockAtIso: string;
}) {
  const unlockAtMs = useMemo(() => {
    const t = Date.parse(unlockAtIso);
    return Number.isFinite(t) ? t : null;
  }, [unlockAtIso]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!unlockAtMs) return;
    const remaining = unlockAtMs - now;
    if (remaining <= 0) {
      // Auto refresh once we pass the unlock time
      window.location.reload();
    }
  }, [unlockAtMs, now]);

  if (!unlockAtMs) return null;

  const remaining = unlockAtMs - now;
  if (remaining <= 0) return null;

  const { days, hours, minutes, seconds } = msToParts(remaining);

  const label =
    days > 0
      ? `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
      : `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-semibold">Next reset</div>
      <div className="mt-1 text-sm text-white/70">
        You can create again in{" "}
        <span className="font-semibold text-white">{label}</span>
        <span className="text-white/50"> (auto-refresh)</span>
      </div>
      <div className="mt-2 text-xs text-white/50">
        Unlock time (UTC):{" "}
        <span className="font-mono text-white/70">{unlockAtIso}</span>
      </div>
    </div>
  );
}

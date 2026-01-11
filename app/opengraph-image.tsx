import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0F172A",
          display: "flex",
          padding: 64,
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>
            Maxgen Systems
          </div>
          <div style={{ fontSize: 28, color: "rgba(156,163,175,0.95)" }}>
            Engineering systems that scale with certainty.
          </div>
          <div style={{ fontSize: 20, color: "rgba(56,189,248,0.95)" }}>
            maxgensys.com
          </div>
        </div>

        <div
          style={{
            width: 420,
            height: 420,
            borderRadius: 28,
            background: "rgba(30,41,59,0.85)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 0 0 1px rgba(37,99,235,0.18) inset",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "rgba(156,163,175,0.95)",
          }}
        >
          Systems-grade framework
        </div>
      </div>
    ),
    size
  );
}

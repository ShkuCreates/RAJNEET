import { ImageResponse } from "next/og";

export const runtime = "edge";

const accentMap: Record<string, string> = {
  POLITICAL: "#1D4ED8",
  CRIMINAL: "#991B1B",
  FINANCE: "#166534",
  INFRASTRUCTURE: "#B45309",
  HEALTH: "#0F766E",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "RAJNEET News Update").slice(0, 140);
  const category = (searchParams.get("category") || "POLITICAL").toUpperCase();
  const geo = searchParams.get("geo") || "National";
  const accent = accentMap[category] || "#1D4ED8";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #020617 0%, #111827 55%, #1f2937 100%)",
          color: "#fff",
          padding: "44px",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            borderTop: `8px solid ${accent}`,
            borderLeft: `8px solid ${accent}`,
            opacity: 0.9,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              background: accent,
              borderRadius: "999px",
              padding: "8px 16px",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "62px", fontWeight: 800, lineHeight: 1.12 }}>
          {title}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
          <div style={{ color: "#cbd5e1", fontSize: "30px" }}>{geo}</div>
          <div style={{ color: "#f8fafc", fontSize: "34px", letterSpacing: "0.06em" }}>RAJNEET</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// Shared visual for opengraph-image.tsx and twitter-image.tsx — kept as
// plain divs (no SVG, no external fonts) since ImageResponse renders with
// Satori, which needs fonts supplied explicitly for anything but its
// built-in default.
export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";
export const ogImageAlt = "Only Good Deals — deals actually worth buying, tracked live.";

export function OgImageContent() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f0e7",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "#d7ff43",
            border: "9px solid #161616",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 46,
              height: 24,
              borderLeft: "17px solid #161616",
              borderBottom: "17px solid #161616",
              transform: "rotate(-45deg)",
              marginTop: -10,
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 74, fontWeight: 900, letterSpacing: -3, color: "#161616" }}>
          ONLY GOOD DEALS<span style={{ color: "#ff4f2f" }}>.</span>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#6f6b64" }}>
        Deals actually worth buying — tracked live.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 36,
          background: "#d7ff43",
          border: "3px solid #161616",
          borderRadius: 999,
          padding: "10px 26px",
          fontSize: 22,
          fontWeight: 700,
          color: "#161616",
          transform: "rotate(-3deg)",
        }}
      >
        100% GOOD
      </div>
    </div>
  );
}

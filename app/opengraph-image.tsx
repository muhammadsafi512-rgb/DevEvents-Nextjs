import { ImageResponse } from "next/og";

export const alt = "DevEvents: The hub for every dev event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#030708",
                    backgroundImage: "radial-gradient(circle at 50% 0%, #0f4a43 0%, #030708 65%)",
                    color: "#ffffff",
                }}
            >
                <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>DevEvents</div>
                <div style={{ fontSize: 40, marginTop: 24, color: "#5dfcea" }}>
                    The Hub for Every Dev Event You Can&apos;t Miss
                </div>
            </div>
        ),
        { ...size }
    );
}
'use client';

import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import LightRays from "@/components/LightRays";

const ThemedLightRays = () => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        setMounted(true);
        setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, []);

    if (!mounted) return null;

    const light = resolvedTheme === "light";

    return (
        <LightRays
            raysOrigin="top-center-offset"
            raysColor={light ? "#0fb5a0" : "#5dfeca"}
            raysSpeed={reduceMotion ? 0 : 0.5}
            lightSpread={0.9}
            rayLength={1.5}
            followMouse={!reduceMotion}
            mouseInfluence={0.05}
            noiseAmount={0}
            distortion={0.1}
            pulsating={false}
            fadeDistance={1}
            saturation={1}
            className={light ? "opacity-60" : ""}
        />
    );
};

export default ThemedLightRays;
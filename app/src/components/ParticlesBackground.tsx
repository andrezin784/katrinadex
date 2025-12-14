'use client';

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "grab",
          },
        },
        modes: {
          push: {
            quantity: 2,
          },
          grab: {
            distance: 140,
            links: {
              opacity: 0.5,
              color: "#06b6d4",
            },
          },
        },
      },
      particles: {
        color: {
          value: ["#06b6d4", "#8b5cf6", "#f0abfc"],
        },
        links: {
          color: {
            value: "#06b6d4",
          },
          distance: 150,
          enable: true,
          opacity: 0.15,
          width: 1,
          triangles: {
            enable: true,
            opacity: 0.02,
          },
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "bounce" as const,
          },
          random: true,
          speed: 0.8,
          straight: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
          },
        },
        number: {
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
          value: 60,
        },
        opacity: {
          value: { min: 0.2, max: 0.5 },
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.1,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.5,
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <>
      {/* Aurora Background */}
      <div className="aurora-bg" />
      
      {/* Grid Pattern */}
      <div className="arc-grid" />
      
      {/* Mesh Gradient */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none z-0" />
      
      {/* Particles */}
      {init && (
        <Particles
          id="tsparticles"
          options={options}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}
      
      {/* Subtle Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Top Glow */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
        }}
      />
    </>
  );
}

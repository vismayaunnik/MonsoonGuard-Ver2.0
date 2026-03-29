"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDisasterData } from "@/components/providers/DisasterProvider";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Image from "next/image";

type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: {
    [key: string]: {
      value: number[] | number[][] | number;
      type: string;
    };
  };
  maxFps?: number;
}

interface SignInPageProps {
  className?: string;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "ml", label: "മലയാളം (Malayalam)" },
  { value: "te", label: "తెలుగు (Telugu)" },
];

export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
          shader={`
            ${reverse ? "u_reverse_active" : "false"}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d1f] to-transparent" />
      )}
    </div>
  );
};

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length === 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [color[0] / 255, color[1] / 255, color[2] / 255]),
        type: "uniform3fv",
      },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: {
        value: shader.includes("u_reverse_active") ? 1 : 0,
        type: "uniform1i",
      },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        out vec4 fragColor;
        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }
        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
            ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}
            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
            vec3 color = u_colors[int(show_offset * 6.0)];
            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);
            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);
            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }
            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  );
};

const ShaderMaterial = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  source: string;
  hovered?: boolean;
  maxFps?: number;
  uniforms: Uniforms;
}) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const material: any = ref.current.material;
    material.uniforms.u_time.value = clock.getElapsedTime();
  });

  const getUniforms = () => {
    const preparedUniforms: any = {};
    for (const uniformName in uniforms) {
      const uniform: any = uniforms[uniformName];
      switch (uniform.type) {
        case "uniform1f":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
          break;
        case "uniform1i":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
          break;
        case "uniform3f":
          preparedUniforms[uniformName] = { value: new THREE.Vector3().fromArray(uniform.value), type: "3f" };
          break;
        case "uniform1fv":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
          break;
        case "uniform3fv":
          preparedUniforms[uniformName] = {
            value: uniform.value.map((v: number[]) => new THREE.Vector3().fromArray(v)),
            type: "3fv",
          };
          break;
        case "uniform2f":
          preparedUniforms[uniformName] = { value: new THREE.Vector2().fromArray(uniform.value), type: "2f" };
          break;
        default:
          console.error(`Invalid uniform type for '${uniformName}'.`);
          break;
      }
    }
    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return preparedUniforms;
  };

  const material = useMemo(() => {
    const materialObject = new THREE.ShaderMaterial({
      vertexShader: `
        precision mediump float;
        in vec2 coordinates;
        uniform vec2 u_resolution;
        out vec2 fragCoord;
        void main(){
          float x = position.x;
          float y = position.y;
          gl_Position = vec4(x, y, 0.0, 1.0);
          fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
          fragCoord.y = u_resolution.y - fragCoord.y;
        }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
    return materialObject;
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref as any}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
function MiniNavbar({ onSignInClick = () => {} }: { onSignInClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinksData = [
    { label: "Monitoring", href: "#" },
    { label: "Alerts", href: "#" },
    { label: "Evacuation", href: "#" },
  ];

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center px-8 py-3 backdrop-blur-md rounded-full border border-blue-900/40 bg-[#040814cc] w-auto max-w-5xl shadow-2xl shadow-blue-900/20">
      <div className="flex items-center justify-between gap-x-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="MonsoonGuard Logo" width={48} height={48} className="object-contain" />
          </div>
          <div className="flex flex-col text-left justify-center">
            <span className="text-white font-black text-3xl tracking-tighter leading-none">MonsoonGuard</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Main Sign-In Page ─────────────────────────────────────────────────────────
export const SignInPage = ({ className }: SignInPageProps) => {
  const { language, setLanguage, t } = useDisasterData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone.length === 10) {
      // Persist user data like original login page
      const userData = {
        userName: name,
        phoneNumber: phone,
        language,
        role: "citizen",
        loginTime: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("appLanguage", language);
      }
      // Trigger canvas reverse animation then show success
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      setTimeout(() => setStep("success"), 1800);
    }
  };

  const handleQuickLogin = () => {
    const userData = {
      userName: "Demo User",
      phoneNumber: "9876543210",
      language: "en",
      role: "citizen",
      loginTime: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(userData));
    }
    setReverseCanvasVisible(true);
    setTimeout(() => setInitialCanvasVisible(false), 50);
    setTimeout(() => setStep("success"), 1800);
  };
  
  const handleNavSignIn = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Focus the first input (name) after a short delay
    setTimeout(() => {
      const inputs = formRef.current?.getElementsByTagName("input");
      if (inputs && inputs.length > 0) inputs[0].focus();
    }, 300);
  };

  return (
    <div className={cn("flex w-full flex-col min-h-screen bg-[#050d1f] relative", className)}>
      {/* ── Background canvas ── */}
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-[#050d1f]"
              colors={[[56, 139, 253], [100, 180, 255]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-[#050d1f]"
              colors={[[56, 139, 253], [100, 180, 255]]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(5,13,31,0.85)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#050d1f] to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1">
        <MiniNavbar onSignInClick={handleNavSignIn} />

        <div className="flex flex-1 flex-col justify-center items-center">
          <div className="w-full mt-[100px] max-w-sm px-4">
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form-step"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-5 text-center"
                >
                  {/* Title */}
                  <div className="space-y-1 mb-6 mt-12">
                    <h1 className="text-[3.2rem] font-bold leading-tight tracking-tight text-white">
                      {t('welcome-user') ? t('welcome-user').split(' ')[0] : 'Welcome'}
                    </h1>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Language selector */}
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-blue-950/40 text-white border border-blue-800/50 rounded-full py-3 px-5 focus:outline-none focus:border-blue-500/70 appearance-none cursor-pointer text-sm"
                        style={{ WebkitAppearance: "none" }}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value} style={{ background: "#0a1628", color: "white" }}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      {/* dropdown chevron */}
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder={t('full-name') || "Full Name"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-blue-950/30 text-white border border-blue-800/50 rounded-full py-3 px-5 focus:outline-none focus:border-blue-500/70 text-center placeholder:text-blue-400/40 text-sm"
                      required
                    />

                    {/* Phone */}
                    <input
                      type="tel"
                      placeholder={t('phone-number-10') || "10-digit Phone Number"}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      pattern="[0-9]{10}"
                      className="w-full bg-blue-950/30 text-white border border-blue-800/50 rounded-full py-3 px-5 focus:outline-none focus:border-blue-500/70 text-center placeholder:text-blue-400/40 text-sm"
                      required
                    />

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-full bg-blue-600 text-white font-semibold py-3 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                    >
                      {t('enter-system') || 'Enter System'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </motion.button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="h-px bg-blue-900/50 flex-1" />
                    <span className="text-blue-300/40 text-xs">or</span>
                    <div className="h-px bg-blue-900/50 flex-1" />
                  </div>

                  {/* Quick Demo Login */}
                  <button
                    onClick={handleQuickLogin}
                    className="w-full rounded-full border border-blue-700/40 bg-blue-950/30 text-blue-200 py-3 text-sm hover:bg-blue-900/40 hover:border-blue-500/60 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    {t('quick-demo-login') || 'Quick Demo Login'}
                  </button>

                  <p className="text-xs text-blue-400/30 pt-2">
                    Quick access for testing purposes
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight text-white">
                      {t('youre-in') || "You're in!"}
                    </h1>
                    <p className="text-[1.15rem] text-blue-300/60 font-light">
                      {t('welcome-user')?.replace('{name}', name || 'Demo User') || `Welcome, ${name || "Demo User"}`}
                    </p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="py-8"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => { if (typeof window !== "undefined") window.location.href = "/dashboard"; }}
                    className="w-full rounded-full bg-blue-600 text-white font-medium py-3 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50"
                  >
                    {t('continue-dashboard') || 'Continue to Dashboard'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

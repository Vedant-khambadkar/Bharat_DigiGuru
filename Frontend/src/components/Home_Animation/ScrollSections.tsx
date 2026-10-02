import React from 'react'
import {
  ChevronDown,
  Sparkles,
  Cpu,
  Monitor,
  Compass,
  Zap,
  Atom
} from 'lucide-react'

interface ScrollSectionsProps {
  scrollProgress: number
  themeName: string
  onSelectTheme: (idx: number) => void
  onSelectTexture: (type: 'crystal' | 'cyber' | 'aurora' | 'matrix') => void
}

export const ScrollSections: React.FC<ScrollSectionsProps> = ({
  onSelectTheme,
  onSelectTexture
}) => {
  return (
    <div className="relative z-20 pointer-events-none">
      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center max-w-5xl mx-auto pt-24 pb-16">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-xl shadow-lg shadow-cyan-500/10 pointer-events-auto">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Three.js • Custom GLSL • Ref Dynamics
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 tracking-tight leading-[1.08]">
            MacBook Pro
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
              Crystal Edition
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Engineered with real-time <strong>GLSL chromatic dispersion shaders</strong>, precision <strong>React refs</strong>, and scroll-reactive hinge kinematics.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>Scroll to Open Display</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <a
              href="#shaders"
              className="px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/90 font-medium text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              Inspect GLSL Shader
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce pointer-events-auto">
          <span className="text-[11px] font-mono tracking-widest uppercase">Scroll Down</span>
          <ChevronDown className="w-4 h-4 text-cyan-400" />
        </div>
      </section>

      {/* SECTION 2: CRYSTAL SHADER CRAFTSMANSHIP */}
      <section id="shaders" className="min-h-screen flex items-center px-6 py-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl pointer-events-auto bg-[#070b16]/75 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-cyan-950/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Atom className="w-3.5 h-3.5" />
              <span>Raytraced Crystal Dispersion</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Pure GLSL Iridescent Refraction
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every floating facet and crystal shard computes chromatic refraction in real-time. By splitting red, green, and blue wavelengths with customized Fresnel coefficients, light scatters into pure spectrums as you scroll.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-cyan-400 text-2xl font-mono font-bold">1.52</div>
                <div className="text-xs text-white/60">Refraction Index (IOR)</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-purple-400 text-2xl font-mono font-bold">0.65λ</div>
                <div className="text-xs text-white/60">Chromatic Split Dispersion</div>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-200/90 leading-normal overflow-x-auto">
              <div className="text-white/40 pb-1">// GLSL Fragment Calculation</div>
              <div>float rFresnel = pow(1.0 - dot(V, N), uFresnel * (1.0 - uDispersion));</div>
              <div>vec3 rainbow = 0.5 + 0.5 * cos(6.28 * (dot(V, N) * 2.0 + uTime * 0.15));</div>
              <div className="text-purple-300">gl_FragColor = vec4(finalColor, uOpacity);</div>
            </div>
          </div>
          <div className="hidden lg:block"></div>
        </div>
      </section>

      {/* SECTION 3: LIQUID RETINA DISPLAY & TEXTURES */}
      <section className="min-h-screen flex items-center justify-end px-6 py-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="hidden lg:block"></div>
          <div className="space-y-6 max-w-xl pointer-events-auto bg-[#070b16]/75 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 ml-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Monitor className="w-3.5 h-3.5" />
              <span>Retina Screen Texture Mapping</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Live Texture Mapping on Opened Hinge
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              As the screen opens smoothly to 105 degrees, the screen mesh updates dynamically with crisp 2K textures. Choose from dynamic procedural OS workspaces, neon cyber grids, or upload your own images.
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wider">Quick Texture Presets:</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'crystal', name: '💎 Crystal OS' },
                  { id: 'cyber', name: '⚡ Neon Cyber' },
                  { id: 'aurora', name: '🌌 Emerald Aurora' },
                  { id: 'matrix', name: '📟 Quantum Matrix' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTexture(t.id as any)}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 text-xs text-white/80 hover:text-white font-medium text-left transition-all cursor-pointer"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THREE.JS & REF KINEMATICS */}
      <section className="min-h-screen flex items-center px-6 py-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl pointer-events-auto bg-[#070b16]/75 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-cyan-950/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>React Ref Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Smooth 60FPS Scroll Kinematics
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We leverage direct Three.js object refs rather than React state churn to maintain butter-smooth 60+ FPS animation during scroll gestures.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Hierarchical Scene Graph</h4>
                  <p className="text-[11px] text-white/60">Top lid mesh is parented to the hinge pivot node for natural rotation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Instanced Mesh Particle Burst</h4>
                  <p className="text-[11px] text-white/60">Single draw-call rendering for 70+ crystalline prisms floating in 3D space.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block"></div>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE STUDIO CALLOUT */}
      <section id="experience-studio" className="min-h-screen flex flex-col justify-center items-center px-6 text-center max-w-4xl mx-auto py-24">
        <div className="space-y-6 pointer-events-auto bg-[#070b16]/85 border border-cyan-500/30 p-10 sm:p-14 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-cyan-950/60 w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-8 h-8 text-cyan-300" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Take Full Interactive Control
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Use the <strong>Crystal GLSL Studio</strong> widget in the bottom-right corner to toggle 360° orbit rotation, switch diamond palettes, and adjust shader dispersion.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all cursor-pointer"
            >
              Back to Top
            </button>
            <button
              onClick={() => onSelectTheme(1)}
              className="px-5 py-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 font-medium text-xs transition-all cursor-pointer"
            >
              Try Amethyst Violet
            </button>
            <button
              onClick={() => onSelectTheme(2)}
              className="px-5 py-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-medium text-xs transition-all cursor-pointer"
            >
              Try Emerald Aurora
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

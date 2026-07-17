"use client";

import { motion } from "framer-motion";

export default function MathGraphSVG({ type, color = "#6366f1" }) {
  // Common variants for path drawing
  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    hover: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.2, ease: "easeInOut" } 
    }
  };

  const axisVariants = {
    initial: { pathLength: 0, opacity: 0 },
    hover: { 
      pathLength: 1, 
      opacity: 0.4,
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const fillVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 0.25,
      transition: { delay: 0.8, duration: 0.6 } 
    }
  };

  const pointVariants = {
    initial: { scale: 0, opacity: 0 },
    hover: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.6, type: "spring", stiffness: 200 } 
    }
  };

  switch (type) {
    case "venn": // Propositions & Sets (Chapter 1)
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">
          {/* Intersection fill */}
          <motion.path
            d="M 50 17.3 A 15 15 0 0 0 50 42.7 A 15 15 0 0 0 50 17.3"
            fill="currentColor"
            variants={fillVariants}
            initial="initial"
          />
          {/* Circle A */}
          <motion.circle
            cx="42.5"
            cy="30"
            r="15"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            variants={pathVariants}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
          />
          {/* Circle B */}
          <motion.circle
            cx="57.5"
            cy="30"
            r="15"
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            variants={pathVariants}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
          />
          {/* Labels */}
          <motion.text
            x="24"
            y="33"
            fill="currentColor"
            fontSize="7"
            fontWeight="bold"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 0.7 } }}
          >
            A
          </motion.text>
          <motion.text
            x="71"
            y="33"
            fill={color}
            fontSize="7"
            fontWeight="bold"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 0.7 } }}
          >
            B
          </motion.text>
          <motion.text
            x="45.5"
            y="32.5"
            fill="white"
            fontSize="6"
            fontWeight="bold"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9, transition: { delay: 0.9 } } }}
          >
            A∩B
          </motion.text>
        </svg>
      );

    case "inequality": // Linear inequalities (Chapter 2)
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.2)]">
          {/* Cartesian Grid lines */}
          <motion.line x1="10" y1="50" x2="90" y2="50" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          <motion.line x1="30" y1="10" x2="30" y2="55" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          
          {/* Feasible Region shade */}
          <motion.polygon
            points="30,15 70,50 30,50"
            fill="currentColor"
            variants={fillVariants}
            initial="initial"
          />

          {/* Boundary Line: y = x/2 + 5 */}
          <motion.line
            x1="20"
            y1="6.25"
            x2="80"
            y2="51.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            variants={pathVariants}
            initial="initial"
          />

          <motion.text
            x="36"
            y="42"
            fill="currentColor"
            fontSize="5.5"
            fontWeight="bold"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9, transition: { delay: 0.8 } } }}
          >
            x - 2y + 10 ≥ 0
          </motion.text>
        </svg>
      );

    case "parabola": // Quadratic functions (Chapter 3)
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]">
          {/* Cartesian Grid lines */}
          <motion.line x1="10" y1="45" x2="90" y2="45" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          <motion.line x1="50" y1="5" x2="50" y2="55" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          
          {/* Axis of Symmetry (dashed) */}
          <motion.line
            x1="50"
            y1="8"
            x2="50"
            y2="48"
            stroke="#c084fc"
            strokeWidth="1"
            strokeDasharray="3,3"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 0.5, transition: { delay: 0.5 } } }}
          />

          {/* Parabol path: y = (x-50)^2/40 + 15 */}
          <motion.path
            d="M 20 15 Q 50 48 80 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            variants={pathVariants}
            initial="initial"
          />

          {/* Vertex point */}
          <motion.circle
            cx="50"
            cy="48"
            r="3"
            fill="#c084fc"
            variants={pointVariants}
            initial="initial"
          />

          <motion.text
            x="54"
            y="51"
            fill="#c084fc"
            fontSize="5"
            fontWeight="bold"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9, transition: { delay: 0.8 } } }}
          >
            Vertex I(h, k)
          </motion.text>
        </svg>
      );

    case "vectors": // Vectors (Chapter 5)
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.25)]">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
            <marker id="arrow-color" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
            <marker id="arrow-white" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
            </marker>
          </defs>

          {/* Origin dot */}
          <motion.circle cx="30" cy="45" r="2.5" fill="white" variants={pointVariants} initial="initial" />
          
          {/* Vector u */}
          <motion.line
            x1="30"
            y1="45"
            x2="55"
            y2="20"
            stroke="currentColor"
            strokeWidth="2.5"
            markerEnd="url(#arrow)"
            variants={pathVariants}
            initial="initial"
          />
          
          {/* Vector v */}
          <motion.line
            x1="30"
            y1="45"
            x2="70"
            y2="45"
            stroke={color}
            strokeWidth="2.5"
            markerEnd="url(#arrow-color)"
            variants={pathVariants}
            initial="initial"
          />

          {/* Parallelogram dashed borders */}
          <motion.line
            x1="55"
            y1="20"
            x2="95"
            y2="20"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.6, duration: 0.5 } } }}
          />
          <motion.line
            x1="70"
            y1="45"
            x2="95"
            y2="20"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.6, duration: 0.5 } } }}
          />

          {/* Resultant vector: u + v */}
          <motion.line
            x1="30"
            y1="45"
            x2="93"
            y2="21"
            stroke="white"
            strokeWidth="2"
            markerEnd="url(#arrow-white)"
            variants={{
              initial: { pathLength: 0, opacity: 0 },
              hover: { pathLength: 1, opacity: 1, transition: { delay: 0.8, duration: 0.8 } }
            }}
          />

          <motion.text x="40" y="16" fill="currentColor" fontSize="5.5" fontWeight="bold" variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9 } }}>u</motion.text>
          <motion.text x="50" y="52" fill={color} fontSize="5.5" fontWeight="bold" variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9 } }}>v</motion.text>
          <motion.text x="68" y="27" fill="white" fontSize="5.5" fontWeight="bold" variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9, transition: { delay: 1 } } }}>u+v</motion.text>
        </svg>
      );

    case "ellipse": // Ellipse (Chapter 9)
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]">
          {/* Axes */}
          <motion.line x1="10" y1="30" x2="90" y2="30" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          <motion.line x1="50" y1="5" x2="50" y2="55" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />

          {/* Ellipse path */}
          <motion.ellipse
            cx="50"
            cy="30"
            rx="35"
            ry="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            variants={pathVariants}
            initial="initial"
          />

          {/* Focus points F1, F2 */}
          {/* c^2 = a^2 - b^2 => 35^2 - 18^2 = 1225 - 324 = 901 => c ≈ 30 */}
          <motion.circle cx="20" cy="30" r="2.5" fill="#f43f5e" variants={pointVariants} initial="initial" />
          <motion.circle cx="80" cy="30" r="2.5" fill="#f43f5e" variants={pointVariants} initial="initial" />

          {/* Trailing string to point M on ellipse */}
          <motion.line
            x1="20"
            y1="30"
            x2="68"
            y2="14"
            stroke="rgba(244,63,94,0.6)"
            strokeWidth="1"
            strokeDasharray="2,2"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.7 } } }}
          />
          <motion.line
            x1="80"
            y1="30"
            x2="68"
            y2="14"
            stroke="rgba(244,63,94,0.6)"
            strokeWidth="1"
            strokeDasharray="2,2"
            variants={{ initial: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.7 } } }}
          />
          <motion.circle cx="68" cy="14" r="2.5" fill="white" variants={pointVariants} initial="initial" />

          <motion.text x="17" y="38" fill="#f43f5e" fontSize="5" fontWeight="bold" variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9 } }}>F₁</motion.text>
          <motion.text x="77" y="38" fill="#f43f5e" fontSize="5" fontWeight="bold" variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9 } }}>F₂</motion.text>
          <motion.text x="68" y="9" fill="white" fontSize="5.5" fontWeight="bold" variants={{ initial: { opacity: 0 }, hover: { opacity: 0.9 } }}>M</motion.text>
        </svg>
      );

    default: // Default fallback (Chapter 4 unit circle / trig)
      return (
        <svg viewBox="0 0 100 60" className="w-full h-full text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]">
          <motion.line x1="10" y1="30" x2="90" y2="30" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          <motion.line x1="50" y1="5" x2="50" y2="55" stroke="#3f3f46" strokeWidth="0.8" variants={axisVariants} initial="initial" />
          
          <motion.circle
            cx="50"
            cy="30"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            variants={pathVariants}
            initial="initial"
          />

          <motion.circle cx="50" cy="30" r="2" fill="white" variants={pointVariants} initial="initial" />
          {/* Angle ray */}
          <motion.line
            x1="50"
            y1="30"
            x2="67.3"
            y2="20"
            stroke="white"
            strokeWidth="1.5"
            variants={pathVariants}
            initial="initial"
          />
          <motion.circle cx="67.3" cy="20" r="2" fill="currentColor" variants={pointVariants} initial="initial" />
        </svg>
      );
  }
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Handshake, FileSignature, Users, Grid, Globe } from "lucide-react";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  formatting?: boolean;
}

function AnimatedCounter({ end, duration = 2, suffix = "", formatting = false }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out cubic
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  const formattedValue = formatting
    ? count.toLocaleString()
    : count.toString();

  return (
    <span ref={ref} className="font-black">
      {formattedValue}
      {suffix}
    </span>
  );
}

export default function CounterGrid() {
  const counters = [
    {
      label: "Sponsors Joined",
      value: 45,
      suffix: "+",
      icon: Handshake,
      color: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-500/10 text-amber-400",
    },
    {
      label: "MOUs Signed",
      value: 120,
      suffix: "+",
      icon: FileSignature,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Happy Clients",
      value: 25000,
      suffix: "+",
      formatting: true,
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Product Categories",
      value: 18,
      suffix: "",
      icon: Grid,
      color: "from-purple-500 to-violet-600",
      iconBg: "bg-purple-500/10 text-purple-400",
    },
    {
      label: "Global Shipping Destinations",
      value: 30,
      suffix: "+",
      icon: Globe,
      color: "from-rose-500 to-pink-600",
      iconBg: "bg-rose-500/10 text-rose-400",
    },
  ];

  return (
    <section className="py-16 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
            Institutional alliances &amp; <span className="text-amber-400 font-semibold">retail performance</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {counters.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${item.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
                    <AnimatedCounter
                      end={item.value}
                      suffix={item.suffix}
                      formatting={item.formatting}
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

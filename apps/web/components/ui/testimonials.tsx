"use client";

import React from "react";
import { motion } from "framer-motion";

interface Testimonial {
  text: string;
  initials: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: "I storyboarded a 30-second spot in the morning and had a finished cut by lunch. Gen-4 Turbo's motion holds up even on fast cuts.",
    initials: "RM",
    name: "Renee Marsh",
    role: "Independent Filmmaker",
  },
  {
    text: "The model picker actually tells you what you're trading off — speed vs. quality vs. cost. No other studio I've used bothers with that.",
    initials: "DK",
    name: "Devon Kaur",
    role: "Motion Designer",
  },
  {
    text: "We generate thumbnail variations for every upload now. Nano Banana 2 is fast enough that it doesn't break our publishing schedule.",
    initials: "JT",
    name: "Jules Tanaka",
    role: "Social Media Manager",
  },
  {
    text: "Clean exports with no watermark on the Pro plan made this an easy switch from our old tool. Client work looks client-ready immediately.",
    initials: "AO",
    name: "Amara Osei",
    role: "Creative Director",
  },
  {
    text: "Image-to-video on Veo 3 turned a single product photo into a usable ad loop. Saved us an entire shoot day.",
    initials: "CB",
    name: "Caleb Bright",
    role: "E-commerce Founder",
  },
  {
    text: "The enhance tool rewrites vague prompts into something the model actually understands. My hit rate on first generation roughly doubled.",
    initials: "SL",
    name: "Sofia Lindqvist",
    role: "Concept Artist",
  },
  {
    text: "Priority render queue on Business is the difference between a 2-minute wait and a 15-second one during crunch weeks.",
    initials: "MH",
    name: "Marcus Huang",
    role: "Studio Producer",
  },
  {
    text: "History keeps every version searchable, so I stopped losing good generations in a folder of 400 unlabeled files.",
    initials: "PN",
    name: "Priya Nair",
    role: "Content Strategist",
  },
  {
    text: "Our whole team shares one studio now instead of five different tools stitched together. Onboarding a new editor takes an afternoon.",
    initials: "TW",
    name: "Theo Walsh",
    role: "Post-Production Lead",
  },
  {
    text: "Switching between video and image models without leaving the tab keeps our whole team in one workflow instead of five browser windows.",
    initials: "NF",
    name: "Nadia Farrow",
    role: "Brand Designer",
  },
  {
    text: "The aspect-ratio presets alone saved us hours of manual cropping for every platform we publish to.",
    initials: "KO",
    name: "Kenji Osato",
    role: "Video Editor",
  },
  {
    text: "Support actually answers. We had a rendering question at 11pm and got a real reply before we finished our coffee the next morning.",
    initials: "EW",
    name: "Elena Whitfield",
    role: "Agency Owner",
  },
];

const columns = [
  testimonials.slice(0, 2),
  testimonials.slice(2, 4),
  testimonials.slice(4, 6),
  testimonials.slice(6, 8),
  testimonials.slice(8, 10),
  testimonials.slice(10, 12),
];

const columnVisibility = [
  "",
  "hidden sm:block",
  "hidden md:block",
  "hidden lg:block",
  "hidden xl:block",
  "hidden 2xl:block",
];

const TestimonialsColumn = (props: { className?: string; testimonials: Testimonial[]; duration?: number }) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, initials, name, role }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 },
                  }}
                  whileFocus={{
                    scale: 1.03,
                    y: -8,
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 },
                  }}
                  className="w-full max-w-xs cursor-default select-none rounded-3xl border border-border-soft bg-surface p-8 shadow-lg shadow-black/5 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-text/20"
                >
                  <blockquote className="m-0 p-0">
                    <p className="m-0 font-normal leading-relaxed text-text-muted transition-colors duration-300">
                      {text}
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <div
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-text text-xs font-bold text-bg ring-2 ring-border-soft transition-all duration-300 ease-in-out group-hover:ring-text/30"
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <cite className="not-italic font-semibold leading-5 tracking-tight text-text transition-colors duration-300">
                          {name}
                        </cite>
                        <span className="mt-0.5 text-sm leading-5 tracking-tight text-text-faint transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonials-heading" className="relative overflow-hidden bg-bg py-24">
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="container z-10 mx-auto px-4"
      >
        <div className="mx-auto mb-16 flex max-w-[540px] flex-col items-center justify-center">
          <div className="flex justify-center">
            <div className="rounded-full border border-border-soft bg-surface-2 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted transition-colors">
              Testimonials
            </div>
          </div>

          <h2
            id="testimonials-heading"
            className="mt-6 text-center font-display text-4xl font-medium tracking-tight text-text transition-colors md:text-5xl"
          >
            What creators say
          </h2>
          <p className="mt-5 max-w-sm text-center text-lg leading-relaxed text-text-muted transition-colors">
            Illustrative feedback from the kind of workflows AzaisAi is built for.
          </p>
        </div>

        <div
          className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          {columns.map((col, i) => (
            <TestimonialsColumn
              key={i}
              testimonials={col}
              className={columnVisibility[i]}
              duration={13 + i * 2}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

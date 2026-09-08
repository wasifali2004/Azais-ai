"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: "Switching between image and video models used to mean three different tabs. Here it's one prompt box and the render just shows up.",
    image: "https://cdn.21st.dev/assets/mirror/9a/9aa2356c92e8798347a846b3f5ec5c4eecb7d0349130a0ac8b99d064fb925874.jpg",
    name: "Briana Patton",
    role: "Independent filmmaker",
  },
  {
    text: "The cost is shown before I generate, not after. That alone has saved me from blowing through a month's credits in a week.",
    image: "https://cdn.21st.dev/assets/mirror/11/11134d472e245bb9dcef8595979c5c375a8ad40d3adf72e03cf67b959415ea6f.jpg",
    name: "Bilal Ahmed",
    role: "Motion designer",
  },
  {
    text: "Every version I've ever generated is still in my history. Comparing five takes of the same shot is finally easy.",
    image: "https://cdn.21st.dev/assets/mirror/2f/2fbc7af54dccfd5fa3821f259c9b6c42eca0458948be89bbd7cf2e8c97c50930.jpg",
    name: "Saman Malik",
    role: "Content strategist",
  },
  {
    text: "We onboarded our whole design team in a single afternoon. The controls are exactly as complex as they need to be, no more.",
    image: "https://cdn.21st.dev/assets/mirror/e0/e037bf69983d4b3792507a980afa576f7c76798a2b360f56d43a190a382e8acd.jpg",
    name: "Omar Raza",
    role: "Creative director",
  },
  {
    text: "I generate cover art and short teasers from the same account now. Having one studio for both media types changed my workflow completely.",
    image: "https://cdn.21st.dev/assets/mirror/96/9604967cdf4e4e0a351e601540b98e76aae71959e9cbe650f24184041848147d.jpg",
    name: "Zainab Hussain",
    role: "Album artist",
  },
  {
    text: "Aspect ratio, duration, and style are all visible up front. Nothing gets buried behind a settings icon I have to hunt for.",
    image: "https://cdn.21st.dev/assets/mirror/9e/9e606c4f1d8147ecda157277cbbcdf0409228ee64d28da1a9e74e9c8cdee92f2.jpg",
    name: "Aliza Khan",
    role: "Brand designer",
  },
  {
    text: "The output quality from the video models here beats every other generator I've tried, and the render times are honestly surprising.",
    image: "https://cdn.21st.dev/assets/mirror/2c/2cfa4aba4bfefc920aa635f1bde5dab467c583463be9b13d93df6e18db5262f8.jpg",
    name: "Farhan Siddiqui",
    role: "Marketing lead",
  },
  {
    text: "Support answered a model-selection question at 2am and actually knew what they were talking about. Rare for a tool this new.",
    image: "https://cdn.21st.dev/assets/mirror/21/211cb0e449e9bc8d24952d0bc62b660c1b7209b9c6a77a39ca6628e47ba178be.jpg",
    name: "Sana Sheikh",
    role: "Studio owner",
  },
  {
    text: "Our product shots went from a two-day photoshoot to a twenty minute prompt session. The client couldn't tell the difference.",
    image: "https://cdn.21st.dev/assets/mirror/37/377641f9868ec7fcd6e73ff1302f139857f8b4c203db487d0ca1296f031dadf4.jpg",
    name: "Hassan Ali",
    role: "E-commerce founder",
  },
  {
    text: "I moved my whole storyboard process here. Drafting ten variations of a scene now takes less time than one round of revisions used to.",
    image: "https://cdn.21st.dev/assets/mirror/9a/9aa2356c92e8798347a846b3f5ec5c4eecb7d0349130a0ac8b99d064fb925874.jpg",
    name: "Layla Farooq",
    role: "Storyboard artist",
  },
];

const columns = [
  testimonials.slice(0, 2),
  testimonials.slice(2, 4),
  testimonials.slice(4, 6),
  testimonials.slice(6, 8),
  testimonials.slice(8, 10),
];

function TestimonialsColumn(props: { className?: string; testimonials: Testimonial[]; duration?: number }) {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="m-0 flex list-none flex-col gap-6 bg-transparent p-0 pb-6"
      >
        {new Array(2).fill(0).map((_, index) => (
          <Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <motion.li
                key={`${index}-${i}`}
                aria-hidden={index === 1 ? "true" : "false"}
                tabIndex={index === 1 ? -1 : 0}
                whileHover={{
                  scale: 1.03,
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                whileFocus={{
                  scale: 1.03,
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                className="group w-full max-w-md cursor-default select-none rounded-3xl border border-border bg-surface p-8 shadow-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <blockquote className="m-0 p-0">
                  <p className="m-0 text-sm leading-relaxed text-text-muted transition-colors duration-300">{text}</p>
                  <footer className="mt-6 flex items-center gap-3">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={`Avatar of ${name}`}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-border-soft transition-all duration-300 ease-in-out group-hover:ring-accent/30"
                    />
                    <div className="flex flex-col">
                      <cite className="text-sm font-semibold not-italic leading-5 tracking-tight text-text transition-colors duration-300">
                        {name}
                      </cite>
                      <span className="mt-0.5 text-xs leading-5 tracking-tight text-text-faint transition-colors duration-300">
                        {role}
                      </span>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </Fragment>
        ))}
      </motion.ul>
    </div>
  );
}

export default function TestimonialsSectionV2() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="testimonials-v2-heading"
      className="relative overflow-hidden bg-bg py-20 sm:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 mx-auto max-w-[1800px] px-5 sm:px-8"
      >
        <div className="mx-auto mb-16 flex max-w-xl flex-col items-center justify-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{t.testimonials.eyebrow}</p>
          <h2
            id="testimonials-v2-heading"
            className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl"
          >
            {t.testimonials.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-text-muted">{t.testimonials.subtitle}</p>
        </div>

        <div
          className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          role="region"
          aria-label="Scrolling testimonials"
        >
          <TestimonialsColumn testimonials={columns[0]} duration={15} />
          <TestimonialsColumn testimonials={columns[1]} className="hidden sm:block" duration={19} />
          <TestimonialsColumn testimonials={columns[2]} className="hidden md:block" duration={17} />
          <TestimonialsColumn testimonials={columns[3]} className="hidden lg:block" duration={21} />
          <TestimonialsColumn testimonials={columns[4]} className="hidden xl:block" duration={13} />
        </div>
      </motion.div>
    </section>
  );
}

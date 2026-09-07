export type PricingPlan = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  credits: number;
  popular?: boolean;
  features: string[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Core",
    price: 16.9,
    credits: 60,
    features: [
      "60 credits / month",
      "Sora 2 video generation",
      "Nano Banana image generation",
      "Clean downloads, no watermark",
      "Standard queue priority",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Popular",
    price: 32.9,
    credits: 180,
    popular: true,
    features: [
      "180 credits / month",
      "All video & image models",
      "Premium models (Gen-4.5, GPT Image)",
      "Clean downloads, no watermark",
      "Priority render queue",
      "Enhance & variation tools",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Power",
    price: 65.9,
    credits: 420,
    features: [
      "420 credits / month",
      "All video & image models",
      "4K upscale on image models",
      "Clean downloads, no watermark",
      "Fastest render queue",
      "Team seats (up to 5)",
    ],
  },
];

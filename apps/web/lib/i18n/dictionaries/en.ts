export type Dictionary = {
  nav: {
    home: string;
    features: string;
    video: string;
    image: string;
    history: string;
    pricing: string;
    faq: string;
    credits: string;
    signIn: string;
    getStarted: string;
    startFree: string;
    openStudio: string;
    logOut: string;
    account: string;
    create: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaStart: string;
    ctaExplore: string;
    freeCredits: string;
  };
  features: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string }[];
  };
  videoShowcase: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    timestamp: string;
    items: { question: string; answer: string }[];
  };
  ctaMarquee: {
    title: string;
    subtitle: string;
    ctaStart: string;
    ctaExplore: string;
    items: string[];
  };
  footer: {
    tagline: string;
    product: string;
    linkVideo: string;
    linkImage: string;
    linkPricing: string;
    linkHistory: string;
    rights: string;
    subtitle: string;
  };
  pricing: {
    bannerTitle: string;
    bannerDesc: string;
    perkVideo: string;
    perkImage: string;
    perkPremium: string;
    perkDownloads: string;
    startTrial: string;
    testMode: string;
    plansTitle: string;
    plansDesc: string;
    plans: {
      starter: { description: string; buttonText: string };
      pro: { description: string; buttonText: string };
      business: { description: string; buttonText: string };
    };
  };
  auth: {
    backHome: string;
    sideHeading: string;
    sideSubtitle: string;
    perkCredits: string;
    perkNoCard: string;
    perkHistory: string;
    welcomeBack: string;
    startFree: string;
    signInSubtitle: string;
    signUpSubtitle: string;
    email: string;
    password: string;
    signIn: string;
    createAccount: string;
    continueWithGoogle: string;
    newToSite: string;
    alreadyHave: string;
    createAccountLink: string;
    signInLink: string;
    terms: string;
    checkEmail: string;
    verifySubtitle: string;
    verificationCode: string;
    verifyContinue: string;
    sendNewCode: string;
  };
  studio: {
    allMedia: string;
    image: string;
    video: string;
    signInToGenerate: string;
    generating: string;
    estimatedCost: string;
    credit: string;
    credits: string;
    tryAgain: string;
    showExample: string;
    hideExample: string;
    generated: string;
    download: string;
    new: string;
    generationWillAppear: string;
    done: string;
    generationFailed: string;
    example: string;
    history: string;
    logOut: string;
    backToStudio: string;
    uploadImageToGenerate: string;
    enterPromptToGenerate: string;
    upgradeToUseModel: string;
    notEnoughCredits: string;
  };
  toast: {
    loggedIn: string;
    loggedOut: string;
    accountCreated: string;
    emailVerified: string;
    codeResent: string;
    generationReady: string;
    generationFailed: string;
    uploadInvalidType: string;
    uploadTooLarge: string;
  };
  cinematicFooter: {
    marquee: string[];
    heading: string;
    ctaStart: string;
    ctaExplore: string;
    privacy: string;
    terms: string;
    support: string;
    rights: string;
    craftedWith: string;
    by: string;
  };
  historyPage: {
    title: string;
    subtitle: string;
    loading: string;
    filterAll: string;
  };
};

export const en: Dictionary = {
  nav: {
    home: "Home",
    features: "Features",
    video: "Video",
    image: "Image",
    history: "History",
    pricing: "Pricing",
    faq: "FAQ",
    credits: "credits",
    signIn: "Sign in",
    getStarted: "Get started",
    startFree: "Start free",
    openStudio: "Open studio",
    logOut: "Log out",
    account: "Account",
    create: "Create",
  },
  hero: {
    title: "Create the shot you imagined.",
    subtitle:
      "From a single spark of an idea to a fully realized frame — generate cinematic video and gallery-ready images with the world's leading AI models, all inside one focused workspace built to keep you creating.",
    ctaStart: "Start creating free",
    ctaExplore: "Explore the studio",
    freeCredits: "8 free credits. No card required.",
  },
  features: {
    eyebrow: "A complete creative loop",
    title: "Everything needed to go from prompt to final frame.",
    items: [
      {
        title: "Rendered in seconds",
        description: "Go from prompt to finished frame without waiting on a render queue.",
      },
      {
        title: "Leading models, one place",
        description:
          "Choose the right image or video model without rebuilding your workflow in another tool.",
      },
      {
        title: "Controls that stay clear",
        description:
          "Set aspect ratio, duration, style, and source with the cost visible before you generate.",
      },
      {
        title: "A history you can use",
        description: "Review completed generations, filter by media type, and download the result you need.",
      },
      {
        title: "Private by default",
        description: "Your prompts and generations stay yours — nothing trains another model.",
      },
      {
        title: "Built for creators",
        description: "Made for people who ship finished work, not just experiments.",
      },
    ],
  },
  videoShowcase: {
    eyebrow: "Generated in AzaisAi",
    title: "Every frame, brought to life.",
    subtitle:
      "A live stream of clips generated in the studio — swap in your own prompt and the next one is yours.",
  },
  testimonials: {
    eyebrow: "Creator workflows",
    title: "What creators are saying",
    subtitle: "Real feedback from people generating cinematic image and video content every day.",
  },
  faq: {
    eyebrow: "Questions",
    title: "Everything you're wondering about.",
    subtitle: "Can't find the answer you're looking for? Reach out to our support team.",
    timestamp: "Support · usually replies in minutes",
    items: [
      {
        question: "What can I generate with AzaisAi?",
        answer:
          "Cinematic video and polished images with leading models like Veo 3 and Gen-4.5, all from one prompt box.",
      },
      {
        question: "Do I need a card to start?",
        answer: "No. Sign up and get 8 free credits to explore the full studio — no card required.",
      },
      {
        question: "What happens if a generation fails?",
        answer: "Failed generations are never charged — any spent credits are refunded automatically.",
      },
      {
        question: "Can I switch between image and video models?",
        answer:
          "Yes. Both live in the same studio, so you can move from a still concept to a video pass without changing tools.",
      },
      {
        question: "Is my data kept private?",
        answer: "Your prompts and generations stay yours — nothing you create is used to train another model.",
      },
    ],
  },
  ctaMarquee: {
    title: "Start With One Prompt",
    subtitle:
      "Pick a model, describe the shot, and AzaisAi renders it in one focused studio. Free to try — 8 credits, no card required.",
    ctaStart: "Start creating free",
    ctaExplore: "Explore the studio",
    items: ["Image generation", "Video generation", "Prompt to render", "Style presets", "Instant renders"],
  },
  footer: {
    tagline: "Cinematic video and image generation, built for people who finish what they start.",
    product: "Product",
    linkVideo: "Video generation",
    linkImage: "Image generation",
    linkPricing: "Pricing",
    linkHistory: "History",
    rights: "All rights reserved.",
    subtitle: "Image and video generation in one studio.",
  },
  pricing: {
    bannerTitle: "Start your free trial",
    bannerDesc: "Create an account and verify your email to get 8 free credits. No card required.",
    perkVideo: "Video generation",
    perkImage: "Image generation",
    perkPremium: "Premium models",
    perkDownloads: "Clean downloads",
    startTrial: "Start free trial",
    testMode: "Test mode is active. Plan changes are simulated and no card will be charged.",
    plansTitle: "Simple, transparent pricing",
    plansDesc: "Choose the plan that fits your workload. Cancel anytime, with no hidden fees.",
    plans: {
      starter: {
        description: "For individuals beginning their AI generation workflow.",
        buttonText: "Choose Starter",
      },
      pro: {
        description: "For creators who need every model, priority, and clean exports.",
        buttonText: "Choose Pro",
      },
      business: {
        description: "For teams producing a high volume of image and video work.",
        buttonText: "Choose Business",
      },
    },
  },
  auth: {
    backHome: "Back home",
    sideHeading: "One account. Every image and video model.",
    sideSubtitle:
      "Start with 8 free credits, create in the studio, and keep every completed result in your history.",
    perkCredits: "8 free credits",
    perkNoCard: "No card required",
    perkHistory: "Image and video history",
    welcomeBack: "Welcome back",
    startFree: "Start creating for free",
    signInSubtitle: "Sign in to continue to your studio.",
    signUpSubtitle: "Create your account and get 8 free credits.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    createAccount: "Create account",
    continueWithGoogle: "Continue with Google",
    newToSite: "New to AzaisAi?",
    alreadyHave: "Already have an account?",
    createAccountLink: "Create an account",
    signInLink: "Sign in",
    terms: "By continuing, you agree to the terms and privacy policy.",
    checkEmail: "Check your email",
    verifySubtitle: "Enter the six-digit code sent to",
    verificationCode: "Verification code",
    verifyContinue: "Verify and continue",
    sendNewCode: "Send a new code",
  },
  studio: {
    allMedia: "All media",
    image: "Image",
    video: "Video",
    signInToGenerate: "Sign in to generate",
    generating: "Generating...",
    estimatedCost: "Estimated cost",
    credit: "credit",
    credits: "credits",
    tryAgain: "Try again",
    showExample: "Show example",
    hideExample: "Hide example",
    generated: "Generated",
    download: "Download",
    new: "New",
    generationWillAppear: "Your generation will appear here",
    done: "Done",
    generationFailed: "We couldn't generate that — your credits have been refunded.",
    example: "Example",
    history: "History",
    logOut: "Log out",
    backToStudio: "Back to studio",
    uploadImageToGenerate: "Upload a starting image to generate",
    enterPromptToGenerate: "Enter a prompt to generate",
    upgradeToUseModel: "Upgrade your plan to use this model",
    notEnoughCredits: "Not enough credits",
  },
  toast: {
    loggedIn: "Welcome back!",
    loggedOut: "You've been signed out.",
    accountCreated: "Account created — check your email for a code.",
    emailVerified: "Email verified. Welcome to AzaisAi!",
    codeResent: "A new verification code was sent.",
    generationReady: "Your generation is ready.",
    generationFailed: "That generation failed.",
    uploadInvalidType: "Only JPG, PNG, or WEBP images are supported.",
    uploadTooLarge: "Image must be 10MB or smaller.",
  },
  cinematicFooter: {
    marquee: [
      "Cinematic Generation",
      "Every Model, One Studio",
      "Zero Watermarks",
      "Instant Renders",
      "Built For Creators",
    ],
    heading: "Ready to begin?",
    ctaStart: "Start Free — 8 Credits",
    ctaExplore: "Explore the Studio",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    support: "Support",
    rights: "All rights reserved.",
    craftedWith: "Crafted with",
    by: "by",
  },
  historyPage: {
    title: "History",
    subtitle: "Every video and image you've generated, in one place.",
    loading: "Loading your history…",
    filterAll: "All",
  },
};

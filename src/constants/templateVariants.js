const basicsTemplates = {
  hero: ["default", "content", "minimal", "carousel", "agenda"],
  carousel: ["simple", "partners", "details", "deces"],
  "2-col": [
    "with-ss",
    "with-ss-2",
    "without-ss",
    "without-ss-inverse",
    "2-images",
    "membres",
    "posts",
  ],
  calltoaction: ["contact", "centered", "2-col", "left", "newsletter"],
  grid: ["cards", "blog-cards", "missions", "projets", "galeries"],
  faq: ["accordeon", "list"],
};

export const templateTypeVariants = {
  default: {
    ...basicsTemplates,
  },

  detail: {
    ...basicsTemplates,
  },

  avec_sidebar_rdv: {
    hero: ["minimal", "split"],
    calltoaction: ["contact", "newsletter"],
  },
};

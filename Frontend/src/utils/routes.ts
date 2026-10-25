/**
 * Route to Section ID mapping and deep-linking navigation utilities
 * Supports direct URL routing (e.g. /services, /about, /portfolio) on single-page architecture.
 */

export const ROUTE_SECTION_MAP: Record<string, string> = {
  "/": "home-section",
  "/home": "home-section",
  "/services": "services-section",
  "/service": "services-section",
  "/services-list": "services-section",
  "/portfolio": "portfolio-section",
  "/work": "portfolio-section",
  "/works": "portfolio-section",
  "/about": "about-section",
  "/about-us": "about-section",
  "/analytics": "analytics-section",
  "/mission-vision": "analytics-section",
  "/mission": "analytics-section",
  "/vision": "analytics-section",
  "/team": "our-team-section",
  "/our-team": "our-team-section",
  "/why-us": "work-with-us-section",
  "/whyus": "work-with-us-section",
  "/work-with-us": "work-with-us-section",
  "/careers": "work-with-us-section",
  "/stories": "stories-section",
  "/blogs": "stories-section",
  "/blog": "stories-section",
  "/contact": "contact-section",
  "/contact-us": "contact-section",
  "/platforms": "platforms-we-manage-section",
  "/platforms-we-manage": "platforms-we-manage-section",
  "/3d-projects": "threed-section",
  "/threed": "threed-section",
  "/projects": "threed-section",
  "/process": "process-section",
  "/how-we-work": "process-section",
  "/tools": "tools-and-technology",
  "/technologies": "tools-and-technology",
  "/tools-and-technology": "tools-and-technology",
  "/brands": "brand-collaborations",
  "/brand-collaborations": "brand-collaborations",
  "/collaborations": "brand-collaborations",
  "/milestones": "milestone-showcase",
  "/milestone-showcase": "milestone-showcase",
  "/case-studies": "milestone-showcase",
  "/footer": "footer-section",
};

export const SECTION_ROUTE_MAP: Record<string, string> = {
  "home-section": "/",
  "services-section": "/services",
  "portfolio-section": "/portfolio",
  "about-section": "/about",
  "analytics-section": "/analytics",
  "our-team-section": "/team",
  "work-with-us-section": "/why-us",
  "stories-section": "/stories",
  "blogs-section": "/stories",
  "contact-section": "/contact",
  "platforms-we-manage-section": "/platforms",
  "threed-section": "/3d-projects",
  "process-section": "/process",
  "tools-and-technology": "/tools",
  "brand-collaborations": "/brands",
  "milestone-showcase": "/milestones",
  "footer-section": "/footer",
};

export function normalizePath(path: string): string {
  if (!path) return "/";
  const clean = path.split("?")[0].split("#")[0].trim();
  const stripped = clean.replace(/\/+$/, "").toLowerCase();
  return stripped === "" ? "/" : stripped;
}

export function getSectionIdFromPath(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  if (normalized in ROUTE_SECTION_MAP) {
    return ROUTE_SECTION_MAP[normalized];
  }
  if (typeof window !== "undefined" && window.location.hash) {
    const hashId = window.location.hash.replace(/^#/, "");
    if (hashId) return hashId;
  }
  return null;
}

export function getPathFromSectionId(sectionId: string): string {
  const cleanId = sectionId.replace(/^#/, "");
  if (cleanId in SECTION_ROUTE_MAP) {
    return SECTION_ROUTE_MAP[cleanId];
  }
  return `/${cleanId.replace(/-section$/, "")}`;
}

export function getNavTabFromPath(pathname: string): string {
  const normalized = normalizePath(pathname);
  switch (normalized) {
    case "/":
    case "/home":
      return "home";
    case "/services":
    case "/service":
    case "/services-list":
      return "services";
    case "/portfolio":
    case "/work":
    case "/works":
      return "portfolio";
    case "/about":
    case "/about-us":
      return "about";
    case "/analytics":
    case "/mission-vision":
    case "/vision":
    case "/mission":
      return "analytics";
    case "/team":
    case "/our-team":
      return "team";
    case "/why-us":
    case "/whyus":
    case "/work-with-us":
    case "/careers":
      return "whyus";
    case "/stories":
    case "/blogs":
    case "/blog":
      return "stories";
    case "/contact":
    case "/contact-us":
      return "contact";
    default:
      return "home";
  }
}

export function scrollToSection(
  target: string | HTMLElement,
  options: {
    immediate?: boolean;
    updateUrl?: boolean;
    replaceState?: boolean;
    offset?: number;
  } = {}
): boolean {
  const { immediate = false, updateUrl = false, replaceState = false, offset = 0 } = options;

  let targetEl: HTMLElement | null = null;
  let sectionId = "";

  if (typeof target === "string") {
    sectionId = target.replace(/^#/, "");
    if (sectionId === "home-section" || sectionId === "home") {
      targetEl = document.getElementById("home-section");
    } else {
      targetEl = document.getElementById(sectionId);
    }
  } else if (target instanceof HTMLElement) {
    targetEl = target;
    sectionId = target.id;
  }

  if (updateUrl && sectionId) {
    const route = getPathFromSectionId(sectionId);
    if (window.location.pathname !== route && !window.location.pathname.startsWith("/admin")) {
      if (replaceState) {
        window.history.replaceState(null, "", route);
      } else {
        window.history.pushState(null, "", route);
      }
    }
  }

  const lenis = (window as any).lenis;

  if (sectionId === "home-section" || sectionId === "home") {
    if (lenis?.scrollTo) {
      lenis.scrollTo(0, {
        immediate,
        duration: immediate ? 0 : 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: immediate ? "instant" : "smooth",
      });
    }
    return true;
  }

  if (!targetEl) return false;

  if (lenis?.scrollTo) {
    lenis.scrollTo(targetEl, {
      offset,
      immediate,
      duration: immediate ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    targetEl.scrollIntoView({
      behavior: immediate ? "instant" : "smooth",
    });
  }

  return true;
}

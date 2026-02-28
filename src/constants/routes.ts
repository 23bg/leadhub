const ROUTES = {
	ROOT: "/",
	HOME: "/",
	DASHBOARD: {
		ROOT: "/",
		LEADS: "/leads",
		LEAD_DETAILS: (id: string) => `/lead/${id}`,
		PRODUCTS: "/products",
		IMPORT: "/import",
		SCRAPER: "/scraper",
		DIRECTORY: (category: string, city: string) => `/directory/${category}/${city}`,
		TEAM: "/team",
		SETTINGS: "/settings",
		BILLING: "/billing",
		PROFILE: "/profile",
		PUBLIC_INSTITUTE: (slug: string) => `/i/${slug}`,
	},
	AUTH: {
		LOG_IN: "/login",
		SIGN_UP: "/signup",
		VERIFICATION: "/verification",
	},
	PRICING: "/pricing",
	FEATURES: "/features",
	DEMO_INSTITUTE: "/demo-institute",
	ABOUT: "/about",
	CONTACT: "/contact",
	PRIVACY: "/privacy",
	TERMS: "/terms",
};

export default ROUTES;

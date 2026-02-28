export const API = {
    BASE_V1: '/api/v1',
    LEADHUB: {
        LEADS: '/api/leads',
        LEAD_BY_ID: (id: string) => `/api/leads/${id}`,
        PRODUCTS: '/api/products',
        PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
        LEAD_PRODUCTS: '/api/lead-products',
        LEAD_PRODUCT_BY_ID: (id: string) => `/api/lead-products/${id}`,
        CONTACT_LOG: '/api/contact-log',
        MAPS_IMPORT: '/api/maps-import',
    },
    ONCAMPUS: {
        AUTH: {
            REQUEST_OTP: '/auth/request-otp',
            VERIFY_OTP: '/auth/verify-otp',
            LOG_OUT: '/auth/logout',
            ME: '/auth/me',
            REFRESH_TOKEN: '/auth/refresh-token',
        },
        DASHBOARD: {
            METRICS: '/dashboard/metrics',
        },
        PUBLIC: {
            LEAD: (slug: string) => `/public/${slug}/lead`,
        },
        WEBHOOKS: {
            RAZORPAY: '/webhooks/razorpay',
        },
    },
    AUTH: {
        LOG_IN: '/auth/request-otp',
        LOG_OUT: '/auth/logout',
        SIGN_UP: '/auth/request-otp',
        VERIFY: '/auth/verify-otp',
        REFRESH_TOKEN: '/auth/refresh-token',
        ME: '/auth/me',
    },
    INTERNAL: {

        AUTH: {
            ME: '/auth/me',
        },
        DASHBOARD: {
            METRICS: '/dashboard/metrics',
            DEFAULTERS: '/dashboard/defaulters',
        },
        INSTITUTE: {
            ROOT: '/institute',
            ONBOARDING: '/institute/onboarding',
        },
        PUBLIC: {
            LEAD: (slug: string) => `/public/${slug}/lead`,
        },
        BILLING: {
            ROOT: '/billing',
        },
        TEAMS: {
            ROOT: '/teams',
            BY_ID: (id: string) => `/teams/${id}`,
        },
        TEACHERS: {
            ROOT: '/teachers',
            BY_ID: (id: string) => `/teachers/${id}`,
        },
        STUDENTS: {
            ROOT: '/students',
            BY_ID: (id: string) => `/students/${id}`,
            UPLOAD: '/students/upload',
        },
        COURSES: {
            ROOT: '/courses',
            BY_ID: (id: string) => `/courses/${id}`,
        },
        BATCHES: {
            ROOT: '/batches',
            BY_ID: (id: string) => `/batches/${id}`,
        },
        FEES: {
            ROOT: '/fees',
            BY_ID: (id: string) => `/fees/${id}`,
            INSTALLMENTS: (id: string) => `/fees/${id}/installments`,
            WITH_STUDENT: (studentId: string) => `/fees?studentId=${studentId}`,
        },
        PAYMENTS: {
            ROOT: '/payments',
        },
        LEADS: {
            ROOT: '/leads',
            BY_ID: (id: string) => `/leads/${id}`,
        },
    },
}

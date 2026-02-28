import { z } from "zod";
import { instituteRepository } from "@/features/institute/repositories/institute.repo";
import { userRepository } from "@/features/auth/repositories/user.repo";
import { courseRepository } from "@/features/course/repositories/course.repo";
import { AppError } from "@/lib/utils/error";

const phoneSchema = z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone must be a valid Indian mobile number")
    .optional()
    .or(z.literal(""));

const urlSchema = z.string().url().optional().or(z.literal(""));
const optionalText = z.string().trim().optional().or(z.literal(""));

const normalizeSlug = (name: string): string =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const normalizeIndianPhone = (value: string | undefined): string | undefined => {
    if (value === undefined) return undefined;

    const trimmed = value.trim();
    if (!trimmed) return "";

    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        return digitsOnly.slice(2);
    }

    return digitsOnly;
};

const withSocialLinks = <T extends {
    websiteUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
}>(institute: T) => ({
    ...institute,
    socialLinks: {
        website: institute.websiteUrl ?? "",
        instagram: institute.instagramUrl ?? "",
        facebook: institute.facebookUrl ?? "",
        youtube: institute.youtubeUrl ?? "",
        linkedin: institute.linkedinUrl ?? "",
    },
});

const hasText = (value: string | null | undefined): boolean => Boolean(value && value.trim().length > 0);

export const instituteService = {
    async getInstitute(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user?.instituteId) {
            throw new AppError("Institute not found for user", 404, "INSTITUTE_NOT_FOUND");
        }

        const institute = await instituteRepository.findById(user.instituteId);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        return withSocialLinks(institute);
    },

    async getOverview(instituteId: string) {
        const institute = await instituteRepository.findById(instituteId);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }
        return withSocialLinks(institute);
    },

    async updateProfile(
        instituteId: string,
        payload: {
            name?: string;
            slug?: string;
            description?: string;
            phone?: string;
            whatsapp?: string;
            city?: string;
            state?: string;
            address?: string;
            timings?: string;
            logo?: string;
            banner?: string;
            socialLinks?: {
                website?: string;
                instagram?: string;
                facebook?: string;
                youtube?: string;
                linkedin?: string;
            };
            websiteUrl?: string;
            instagramUrl?: string;
            facebookUrl?: string;
            youtubeUrl?: string;
            linkedinUrl?: string;
        }
    ) {
        const normalizedPhone = normalizeIndianPhone(payload.phone);
        const normalizedWhatsapp = normalizeIndianPhone(payload.whatsapp);

        if (normalizedPhone !== undefined) {
            phoneSchema.parse(normalizedPhone);
        }

        if (normalizedWhatsapp !== undefined) {
            phoneSchema.parse(normalizedWhatsapp);
        }

        [payload.description, payload.city, payload.state, payload.address, payload.timings]
            .filter((value) => value !== undefined)
            .forEach((text) => optionalText.parse(text));

        const websiteUrl = payload.socialLinks?.website ?? payload.websiteUrl;
        const instagramUrl = payload.socialLinks?.instagram ?? payload.instagramUrl;
        const facebookUrl = payload.socialLinks?.facebook ?? payload.facebookUrl;
        const youtubeUrl = payload.socialLinks?.youtube ?? payload.youtubeUrl;
        const linkedinUrl = payload.socialLinks?.linkedin ?? payload.linkedinUrl;

        [websiteUrl, instagramUrl, facebookUrl, youtubeUrl, linkedinUrl]
            .filter(Boolean)
            .forEach((url) => urlSchema.parse(url));

        const nextSlug = payload.slug
            ? normalizeSlug(payload.slug)
            : payload.name
                ? normalizeSlug(payload.name)
                : undefined;

        if (nextSlug) {
            const isTaken = await instituteRepository.isSlugTaken(nextSlug, instituteId);
            if (isTaken) {
                throw new AppError("Slug already in use", 409, "SLUG_ALREADY_EXISTS");
            }
        }

        const current = await instituteRepository.findById(instituteId);
        if (!current) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        const effectiveName = payload.name ?? current.name ?? "";
        const effectivePhone = normalizedPhone ?? current.phone;
        const effectiveCity = payload.city ?? current.city;
        const effectiveState = payload.state ?? current.state;
        const effectiveAddress = payload.address ?? current.address;
        const isOnboarded =
            hasText(effectiveName) &&
            hasText(effectivePhone) &&
            hasText(effectiveCity) &&
            hasText(effectiveState) &&
            hasText(effectiveAddress);

        const updated = await instituteRepository.updateById(instituteId, {
            name: payload.name,
            slug: nextSlug,
            description: payload.description || null,
            phone: normalizedPhone || null,
            whatsapp: normalizedWhatsapp || null,
            city: payload.city || null,
            state: payload.state || null,
            address: payload.address || null,
            timings: payload.timings || null,
            logo: payload.logo || null,
            banner: payload.banner || null,
            websiteUrl: websiteUrl || null,
            instagramUrl: instagramUrl || null,
            facebookUrl: facebookUrl || null,
            youtubeUrl: youtubeUrl || null,
            linkedinUrl: linkedinUrl || null,
            isOnboarded,
        });

        return withSocialLinks(updated);
    },

    async completeOnboarding(
        instituteId: string,
        payload: {
            name: string;
            phone: string;
            city: string;
            state: string;
            address: string;
            whatsapp?: string;
            description?: string;
            website?: string;
            facebook?: string;
            instagram?: string;
            youtube?: string;
            linkedin?: string;
        }
    ) {
        const normalizedPhone = normalizeIndianPhone(payload.phone);
        const normalizedWhatsapp = normalizeIndianPhone(payload.whatsapp);

        if (!normalizedPhone) {
            throw new AppError("Phone is required", 400, "INVALID_PHONE");
        }

        phoneSchema.parse(normalizedPhone);
        if (normalizedWhatsapp !== undefined) {
            phoneSchema.parse(normalizedWhatsapp);
        }

        const requiredFields = [payload.name, payload.city, payload.state, payload.address];
        requiredFields.forEach((field) => {
            if (!field || !field.trim()) {
                throw new AppError("Name, city, state and address are required", 400, "ONBOARDING_REQUIRED_FIELDS");
            }
        });

        const socialUrls = [payload.website, payload.facebook, payload.instagram, payload.youtube, payload.linkedin].filter(Boolean);
        socialUrls.forEach((url) => urlSchema.parse(url));

        const nextSlug = normalizeSlug(payload.name);
        const isTaken = await instituteRepository.isSlugTaken(nextSlug, instituteId);
        if (isTaken) {
            throw new AppError("Slug already in use", 409, "SLUG_ALREADY_EXISTS");
        }

        const updated = await instituteRepository.updateById(instituteId, {
            name: payload.name.trim(),
            slug: nextSlug,
            phone: normalizedPhone,
            whatsapp: normalizedWhatsapp || null,
            city: payload.city.trim(),
            state: payload.state.trim(),
            address: payload.address.trim(),
            description: payload.description?.trim() || null,
            websiteUrl: payload.website?.trim() || null,
            facebookUrl: payload.facebook?.trim() || null,
            instagramUrl: payload.instagram?.trim() || null,
            youtubeUrl: payload.youtube?.trim() || null,
            linkedinUrl: payload.linkedin?.trim() || null,
            isOnboarded: true,
        });

        return withSocialLinks(updated);
    },

    async getPublicPage(slug: string) {
        const institute = await instituteRepository.findBySlug(slug);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }
        const courses = await courseRepository.listByInstitute(institute.id);
        return { ...withSocialLinks(institute), courses };
    },
};

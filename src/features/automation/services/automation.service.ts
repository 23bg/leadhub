import { LeadVisibilityStatus, TenantStatus } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { prisma } from "@/lib/db/prisma";

const scoreLead = (lead: {
    primaryPhone: string | null;
    website: string | null;
    email: string | null;
    address: string | null;
    verified: boolean;
}): number => {
    let score = 0;
    if (lead.primaryPhone) score += 40;
    if (lead.website) score += 20;
    if (lead.email) score += 10;
    if (lead.address) score += 10;
    if (lead.verified) score += 20;
    return score;
};

export const automationService = {
    async recalculateScore(leadId: string) {
        const lead = await prisma.globalLead.findUnique({
            where: { id: leadId },
            select: {
                id: true,
                primaryPhone: true,
                website: true,
                email: true,
                address: true,
                verified: true,
            },
        });

        if (!lead) {
            throw new AppError("Global lead not found", 404, "GLOBAL_LEAD_NOT_FOUND");
        }

        const score = scoreLead(lead);
        const updated = await prisma.globalLead.update({
            where: { id: lead.id },
            data: { score },
        });

        return updated;
    },

    async distributeLead(leadId: string) {
        const lead = await prisma.globalLead.findUnique({
            where: { id: leadId },
            select: {
                id: true,
                city: true,
                category: true,
                score: true,
            },
        });

        if (!lead) {
            throw new AppError("Global lead not found", 404, "GLOBAL_LEAD_NOT_FOUND");
        }

        const tenants = await prisma.tenant.findMany({
            where: {
                status: TenantStatus.ACTIVE,
                minimumScore: { lte: lead.score },
                OR: [
                    { targetCities: { isEmpty: true } },
                    ...(lead.city ? [{ targetCities: { has: lead.city } }] : []),
                ],
                AND: [
                    {
                        OR: [
                            { targetCategories: { isEmpty: true } },
                            ...(lead.category ? [{ targetCategories: { has: lead.category } }] : []),
                        ],
                    },
                ],
            },
            select: {
                id: true,
                minimumScore: true,
            },
        });

        if (tenants.length === 0) {
            return { distributed: 0 };
        }

        await Promise.all(
            tenants.map((tenant) =>
                prisma.tenantLeadAccess.upsert({
                    where: {
                        tenantId_leadId: {
                            tenantId: tenant.id,
                            leadId: lead.id,
                        },
                    },
                    update: {
                        fitScore: Math.max(0, Math.min(100, lead.score - tenant.minimumScore + 50)),
                        ...(lead.score >= tenant.minimumScore
                            ? { visibilityStatus: LeadVisibilityStatus.AVAILABLE }
                            : {}),
                    },
                    create: {
                        tenantId: tenant.id,
                        leadId: lead.id,
                        visibilityStatus: LeadVisibilityStatus.AVAILABLE,
                        fitScore: Math.max(0, Math.min(100, lead.score - tenant.minimumScore + 50)),
                    },
                })
            )
        );

        return {
            distributed: tenants.length,
        };
    },
};

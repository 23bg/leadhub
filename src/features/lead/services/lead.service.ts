import { z } from "zod";
import { LeadSource, LeadStatus } from "@prisma/client";
import { leadRepository } from "@/features/lead/repositories/lead.repo";
import { studentRepository } from "@/features/student/repositories/student.repo";
import { instituteRepository } from "@/features/institute/repositories/institute.repo";
import { AppError } from "@/lib/utils/error";

const leadInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional(),
    source: z.nativeEnum(LeadSource).optional(),
    course: z.string().optional(),
    message: z.string().optional(),
    followUpAt: z.string().optional(),
});

const listInputSchema = z.object({
    status: z.nativeEnum(LeadStatus).optional(),
    query: z.string().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

export const leadService = {
    async createLead(payload: unknown) {
        const input = leadInputSchema.parse(payload);
        return leadRepository.create({
            ...input,
            followUpAt: input.followUpAt ? new Date(input.followUpAt) : undefined,
            status: "NEW",
        });
    },

    async createLeadBySlug(
        slug: string,
        payload: {
            name: string;
            phone: string;
            email?: string;
            source?: LeadSource;
            course?: string;
            message?: string;
        }
    ) {
        const institute = await instituteRepository.findBySlug(slug);
        if (!institute) {
            throw new AppError("Institute not found", 404, "INSTITUTE_NOT_FOUND");
        }

        return this.createLead({
            instituteId: institute.id,
            ...payload,
        });
    },

    async updateStatus(instituteId: string, leadId: string, status: LeadStatus) {
        await leadRepository.updateStatus({ instituteId, leadId, status });
        const updated = await leadRepository.findByIdInInstitute(instituteId, leadId);

        if (!updated) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        if (status === "ADMITTED") {
            if (!updated.phone) {
                throw new AppError("Lead phone is required to admit", 400, "LEAD_PHONE_REQUIRED");
            }

            const duplicate = await studentRepository.findByPhoneInInstitute(instituteId, updated.phone);
            if (duplicate) {
                throw new AppError("Student already exists with this phone", 409, "DUPLICATE_STUDENT");
            }

            await studentRepository.create({
                instituteId,
                name: updated.name,
                phone: updated.phone,
                email: updated.email ?? undefined,
            });
        }

        return updated;
    },

    async updateLeadStatus(instituteId: string, leadId: string, status: LeadStatus) {
        return this.updateStatus(instituteId, leadId, status);
    },

    async updateLead(
        instituteId: string,
        leadId: string,
        payload: { status?: LeadStatus; message?: string | null; followUpAt?: string | null }
    ) {
        if (!payload.status && payload.message === undefined && payload.followUpAt === undefined) {
            throw new AppError("Nothing to update", 400, "INVALID_UPDATE");
        }

        if (payload.status) {
            return this.updateStatus(instituteId, leadId, payload.status);
        }

        const followUpAt =
            payload.followUpAt === undefined
                ? undefined
                : payload.followUpAt
                    ? new Date(payload.followUpAt)
                    : null;

        await leadRepository.updateByIdInInstitute(instituteId, leadId, {
            message: payload.message,
            followUpAt,
        });

        const updated = await leadRepository.findByIdInInstitute(instituteId, leadId);
        if (!updated) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        return updated;
    },

    async searchLeads(
        instituteId: string,
        query?: string,
        status?: LeadStatus,
        from?: Date,
        to?: Date
    ) {
        return leadRepository.list({
            instituteId,
            query,
            status,
            from,
            to,
        });
    },

    async getLeads(
        instituteId: string,
        filters: { status?: LeadStatus; query?: string; from?: string; to?: string }
    ) {
        const parsed = listInputSchema.parse(filters);
        return this.searchLeads(instituteId, parsed.query, parsed.status, parsed.from, parsed.to);
    },

    async filterLeads(instituteId: string, status: LeadStatus) {
        return leadRepository.list({ instituteId, status });
    },

    async exportLeads(instituteId: string) {
        const leads = await leadRepository.list({ instituteId });
        return leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email ?? "",
            status: lead.status,
            source: lead.source ?? "",
            createdAt: lead.createdAt.toISOString(),
        }));
    },
};

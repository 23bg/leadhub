import { z } from "zod";
import { batchRepository } from "@/features/batch/repositories/batch.repo";
import { AppError } from "@/lib/utils/error";

const batchInputSchema = z.object({
    instituteId: z.string().min(1),
    courseId: z.string().min(1),
    name: z.string().min(2, "Batch name must be at least 2 characters"),
    startDate: z.string().optional(),
    schedule: z.string().optional(),
    teacherId: z.string().optional(),
});

export const batchService = {
    async createBatch(payload: unknown) {
        const input = batchInputSchema.parse(payload);
        return batchRepository.create({
            ...input,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
        });
    },

    async updateBatch(
        instituteId: string,
        batchId: string,
        payload: { name?: string; startDate?: string | null; schedule?: string | null; teacherId?: string | null }
    ) {
        if (payload.name !== undefined) {
            z.string().min(2).parse(payload.name);
        }
        return batchRepository.update(instituteId, batchId, {
            name: payload.name,
            startDate: payload.startDate ? new Date(payload.startDate) : payload.startDate === null ? null : undefined,
            schedule: payload.schedule,
            teacherId: payload.teacherId,
        });
    },

    async deleteBatch(instituteId: string, batchId: string) {
        await batchRepository.remove(instituteId, batchId);
        return { success: true };
    },

    async getBatches(instituteId: string) {
        return batchRepository.listByInstitute(instituteId);
    },

    async getBatchesByCourse(instituteId: string, courseId: string) {
        return batchRepository.listByCourse(instituteId, courseId);
    },

    async getBatchById(instituteId: string, batchId: string) {
        const batch = await batchRepository.findById(instituteId, batchId);
        if (!batch) {
            throw new AppError("Batch not found", 404, "BATCH_NOT_FOUND");
        }
        return batch;
    },
};

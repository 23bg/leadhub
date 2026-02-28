import { z } from "zod";
import { teacherRepository } from "@/features/teacher/repositories/teacher.repo";
import { AppError } from "@/lib/utils/error";

const teacherInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().min(2),
    subject: z.string().optional(),
    bio: z.string().optional(),
});

const MAX_TEACHERS_PER_INSTITUTE = 20;

export const teacherService = {
    async createTeacher(payload: unknown) {
        const input = teacherInputSchema.parse(payload);
        const count = await teacherRepository.countByInstitute(input.instituteId);

        if (count >= MAX_TEACHERS_PER_INSTITUTE) {
            throw new AppError(
                `Maximum ${MAX_TEACHERS_PER_INSTITUTE} teachers allowed`,
                400,
                "TEACHER_LIMIT_REACHED"
            );
        }

        return teacherRepository.create(input);
    },

    async listTeachers(instituteId: string) {
        return teacherRepository.listByInstitute(instituteId);
    },

    async updateTeacher(
        instituteId: string,
        teacherId: string,
        payload: { name?: string; subject?: string | null; bio?: string | null }
    ) {
        if (payload.name !== undefined) {
            z.string().min(2).parse(payload.name);
        }

        await teacherRepository.update({
            instituteId,
            teacherId,
            ...payload,
        });

        const teachers = await teacherRepository.listByInstitute(instituteId);
        return teachers.find((teacher) => teacher.id === teacherId) ?? null;
    },

    async deleteTeacher(instituteId: string, teacherId: string) {
        await teacherRepository.remove(instituteId, teacherId);
        return { success: true };
    },
};

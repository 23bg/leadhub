import { z } from "zod";
import { courseRepository } from "@/features/course/repositories/course.repo";
import { AppError } from "@/lib/utils/error";

const courseInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().min(2, "Course name must be at least 2 characters"),
    banner: z.string().url().optional().or(z.literal("")),
    duration: z.string().optional(),
    defaultFees: z.number().min(0).optional(),
    description: z.string().optional(),
});

export const courseService = {
    async createCourse(payload: unknown) {
        const input = courseInputSchema.parse(payload);
        return courseRepository.create(input);
    },

    async updateCourse(
        instituteId: string,
        courseId: string,
        payload: { name?: string; banner?: string | null; duration?: string | null; defaultFees?: number | null; description?: string | null }
    ) {
        if (payload.name !== undefined) {
            z.string().min(2).parse(payload.name);
        }
        if (payload.banner !== undefined && payload.banner !== null && payload.banner !== "") {
            z.string().url().parse(payload.banner);
        }
        return courseRepository.update(instituteId, courseId, {
            ...payload,
            banner: payload.banner === "" ? null : payload.banner,
        });
    },

    async deleteCourse(instituteId: string, courseId: string) {
        await courseRepository.remove(instituteId, courseId);
        return { success: true };
    },

    async getCourses(instituteId: string) {
        return courseRepository.listByInstitute(instituteId);
    },

    async getCourseById(instituteId: string, courseId: string) {
        const course = await courseRepository.findById(instituteId, courseId);
        if (!course) {
            throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
        }
        return course;
    },
};

import { prisma } from "@/lib/db/prisma";

type CreateCourseInput = {
    instituteId: string;
    name: string;
    banner?: string;
    duration?: string;
    defaultFees?: number;
    description?: string;
};

type UpdateCourseInput = {
    name?: string;
    banner?: string | null;
    duration?: string | null;
    defaultFees?: number | null;
    description?: string | null;
};

export const courseRepository = {
    create: async (payload: CreateCourseInput) =>
        prisma.course.create({ data: payload }),

    listByInstitute: async (instituteId: string) =>
        prisma.course.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    findById: async (instituteId: string, courseId: string) =>
        prisma.course.findFirst({
            where: { id: courseId, instituteId },
        }),

    update: async (instituteId: string, courseId: string, data: UpdateCourseInput) =>
        prisma.course.updateMany({
            where: { id: courseId, instituteId },
            data,
        }),

    remove: async (instituteId: string, courseId: string) =>
        prisma.course.deleteMany({
            where: { id: courseId, instituteId },
        }),
};

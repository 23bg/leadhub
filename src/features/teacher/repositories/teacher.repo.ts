import { prisma } from "@/lib/db/prisma";

type CreateTeacherInput = {
    instituteId: string;
    name: string;
    subject?: string;
    bio?: string;
};

type UpdateTeacherInput = {
    instituteId: string;
    teacherId: string;
    name?: string;
    subject?: string | null;
    bio?: string | null;
};

export const teacherRepository = {
    create: async (payload: CreateTeacherInput) =>
        prisma.teacher.create({
            data: payload,
        }),

    countByInstitute: async (instituteId: string) =>
        prisma.teacher.count({
            where: { instituteId },
        }),

    listByInstitute: async (instituteId: string) =>
        prisma.teacher.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    update: async (payload: UpdateTeacherInput) =>
        prisma.teacher.updateMany({
            where: { id: payload.teacherId, instituteId: payload.instituteId },
            data: {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.subject !== undefined ? { subject: payload.subject } : {}),
                ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
            },
        }),

    remove: async (instituteId: string, teacherId: string) =>
        prisma.teacher.deleteMany({
            where: { id: teacherId, instituteId },
        }),
};

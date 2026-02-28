import { prisma } from "@/lib/db/prisma";

type CreateStudentInput = {
    instituteId: string;
    name: string;
    phone: string;
    email?: string;
    courseId?: string;
    batchId?: string;
    admissionDate?: Date;
};

type UpdateStudentInput = {
    instituteId: string;
    studentId: string;
    name?: string;
    phone?: string;
    email?: string | null;
    courseId?: string | null;
    batchId?: string | null;
};

export const studentRepository = {
    create: async (payload: CreateStudentInput) =>
        prisma.student.create({
            data: payload,
        }),

    findByPhoneInInstitute: async (instituteId: string, phone: string) =>
        prisma.student.findFirst({
            where: { instituteId, phone },
        }),

    listByInstitute: async (instituteId: string) =>
        prisma.student.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    bulkCreate: async (rows: CreateStudentInput[]) =>
        prisma.student.createMany({
            data: rows,
        }),

    update: async (payload: UpdateStudentInput) =>
        prisma.student.updateMany({
            where: { id: payload.studentId, instituteId: payload.instituteId },
            data: {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
                ...(payload.email !== undefined ? { email: payload.email } : {}),
                ...(payload.courseId !== undefined ? { courseId: payload.courseId } : {}),
                ...(payload.batchId !== undefined ? { batchId: payload.batchId } : {}),
            },
        }),

    remove: async (instituteId: string, studentId: string) =>
        prisma.student.deleteMany({
            where: { id: studentId, instituteId },
        }),
};

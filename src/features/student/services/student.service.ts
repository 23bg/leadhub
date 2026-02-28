import { z } from "zod";
import { studentRepository } from "@/features/student/repositories/student.repo";
import { courseRepository } from "@/features/course/repositories/course.repo";
import { feeRepository } from "@/features/fee/repositories/fee.repo";
import { AppError } from "@/lib/utils/error";

const studentInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional(),
    courseId: z.string().optional(),
    batchId: z.string().optional(),
    admissionDate: z.string().optional(),
    fees: z.number().min(0).optional(),
});

export const studentService = {
    async createStudent(payload: unknown) {
        const input = studentInputSchema.parse(payload);

        const duplicate = await studentRepository.findByPhoneInInstitute(input.instituteId, input.phone);
        if (duplicate) {
            throw new AppError("Student already exists with this phone", 409, "DUPLICATE_STUDENT");
        }

        const student = await studentRepository.create({
            instituteId: input.instituteId,
            name: input.name,
            phone: input.phone,
            email: input.email,
            courseId: input.courseId,
            batchId: input.batchId,
            admissionDate: input.admissionDate ? new Date(input.admissionDate) : undefined,
        });

        // Auto-create FeePlan if fees provided or course has defaultFees
        let feeAmount = input.fees;
        if (feeAmount === undefined && input.courseId) {
            const course = await courseRepository.findById(input.instituteId, input.courseId);
            if (course?.defaultFees) {
                feeAmount = course.defaultFees;
            }
        }

        if (feeAmount && feeAmount > 0) {
            await feeRepository.createPlan({
                studentId: student.id,
                instituteId: input.instituteId,
                totalAmount: feeAmount,
            });
        }

        return student;
    },

    async updateStudent(
        instituteId: string,
        studentId: string,
        payload: { name?: string; phone?: string; email?: string | null; courseId?: string | null; batchId?: string | null }
    ) {
        if (payload.phone) {
            z.string().regex(/^[6-9]\d{9}$/).parse(payload.phone);
        }
        if (payload.email) {
            z.string().email().parse(payload.email);
        }

        return studentRepository.update({
            instituteId,
            studentId,
            ...payload,
        });
    },

    async listStudents(instituteId: string) {
        return studentRepository.listByInstitute(instituteId);
    },

    async deleteStudent(instituteId: string, studentId: string) {
        await studentRepository.remove(instituteId, studentId);
        return { success: true };
    },

    async uploadCsv(
        instituteId: string,
        csvText: string,
        courseMap?: Map<string, string>,
        batchMap?: Map<string, string>,
        courseFeesMap?: Map<string, number>
    ): Promise<{ inserted: number; errors: Array<{ row: number; message: string }> }> {
        const rows = csvText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (rows.length < 2) {
            throw new AppError("CSV must include header and at least one row", 400, "CSV_INVALID");
        }

        const header = rows[0].split(",").map((col) => col.trim().toLowerCase());
        const nameIndex = header.indexOf("name");
        const phoneIndex = header.indexOf("phone");
        const emailIndex = header.indexOf("email");
        const courseIndex = header.indexOf("course");
        const batchIndex = header.indexOf("batch");
        const feesIndex = header.indexOf("fees");

        if (nameIndex === -1 || phoneIndex === -1) {
            throw new AppError("CSV must contain name and phone columns", 400, "CSV_HEADER_INVALID");
        }

        const errors: Array<{ row: number; message: string }> = [];
        const accepted: Array<{ instituteId: string; name: string; phone: string; email?: string; courseId?: string; batchId?: string; fees?: number }> = [];
        const seenPhones = new Set<string>();

        for (let i = 1; i < rows.length; i += 1) {
            const values = rows[i].split(",").map((value) => value.trim());
            const rowNumber = i + 1;

            const name = values[nameIndex] ?? "";
            const phone = values[phoneIndex] ?? "";
            const email = emailIndex >= 0 ? values[emailIndex] : undefined;
            const courseName = courseIndex >= 0 ? values[courseIndex] : undefined;
            const batchName = batchIndex >= 0 ? values[batchIndex] : undefined;
            const feesStr = feesIndex >= 0 ? values[feesIndex] : undefined;

            if (!name || name.length < 2) {
                errors.push({ row: rowNumber, message: "Invalid name" });
                continue;
            }

            if (!/^[6-9]\d{9}$/.test(phone)) {
                errors.push({ row: rowNumber, message: "Invalid phone" });
                continue;
            }

            if (email && !z.string().email().safeParse(email).success) {
                errors.push({ row: rowNumber, message: "Invalid email" });
                continue;
            }

            if (seenPhones.has(phone)) {
                errors.push({ row: rowNumber, message: "Duplicate phone in CSV" });
                continue;
            }

            const duplicate = await studentRepository.findByPhoneInInstitute(instituteId, phone);
            if (duplicate) {
                errors.push({ row: rowNumber, message: "Duplicate phone already exists" });
                continue;
            }

            // Resolve course name to courseId
            const courseId = courseName && courseMap ? courseMap.get(courseName.toLowerCase()) : undefined;
            // Resolve batch name to batchId
            const batchId = batchName && batchMap ? batchMap.get(batchName.toLowerCase()) : undefined;
            // Parse fees — explicit fees column, or fallback to course defaultFees
            let fees: number | undefined;
            if (feesStr && feesStr.length > 0) {
                const parsed = parseFloat(feesStr);
                if (!isNaN(parsed) && parsed > 0) {
                    fees = parsed;
                }
            } else if (courseId && courseFeesMap) {
                fees = courseFeesMap.get(courseId);
            }

            seenPhones.add(phone);
            accepted.push({
                instituteId,
                name,
                phone,
                email: email || undefined,
                courseId,
                batchId,
                fees,
            });
        }

        // Bulk create students
        if (accepted.length > 0) {
            await studentRepository.bulkCreate(
                accepted.map(({ fees: _fees, ...rest }) => rest)
            );

            // Create fee plans for students with fees
            const studentsWithFees = accepted.filter((a) => a.fees && a.fees > 0);
            if (studentsWithFees.length > 0) {
                // Re-fetch newly created students to get IDs
                for (const entry of studentsWithFees) {
                    const student = await studentRepository.findByPhoneInInstitute(instituteId, entry.phone);
                    if (student && entry.fees) {
                        await feeRepository.createPlan({
                            studentId: student.id,
                            instituteId,
                            totalAmount: entry.fees,
                        });
                    }
                }
            }
        }

        return {
            inserted: accepted.length,
            errors,
        };
    },
};

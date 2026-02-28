import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { studentService } from "@/features/student/services/student.service";
import { courseRepository } from "@/features/course/repositories/course.repo";
import { batchRepository } from "@/features/batch/repositories/batch.repo";
import { toAppError } from "@/lib/utils/error";

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const contentType = req.headers.get("content-type") ?? "";
        let csvText = "";

        if (contentType.includes("application/json")) {
            const body = (await req.json()) as { csv?: string };
            csvText = body.csv ?? "";
        } else {
            const formData = await req.formData();
            const file = formData.get("file");
            if (!file || !(file instanceof File)) {
                return NextResponse.json(
                    { success: false, error: { code: "FILE_REQUIRED", message: "CSV file is required" } },
                    { status: 400 }
                );
            }
            csvText = await file.text();
        }

        // Build course/batch name-to-id maps for CSV resolution
        const [courses, batches] = await Promise.all([
            courseRepository.listByInstitute(session.instituteId),
            batchRepository.listByInstitute(session.instituteId),
        ]);
        const courseMap = new Map(courses.map((c) => [c.name.toLowerCase(), c.id]));
        const batchMap = new Map(batches.map((b) => [b.name.toLowerCase(), b.id]));
        // Map courseId → defaultFees for auto fee plan creation
        const courseFeesMap = new Map<string, number>();
        for (const c of courses) {
            if (c.defaultFees && c.defaultFees > 0) {
                courseFeesMap.set(c.id, c.defaultFees);
            }
        }

        const data = await studentService.uploadCsv(session.instituteId, csvText, courseMap, batchMap, courseFeesMap);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

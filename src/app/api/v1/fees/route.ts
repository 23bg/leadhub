import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { feeService } from "@/features/fee/services/fee.service";
import { toAppError } from "@/lib/utils/error";

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const studentId = req.nextUrl.searchParams.get("studentId");
        if (studentId) {
            const data = await feeService.getStudentPaymentSummary(studentId);
            return NextResponse.json({ success: true, data });
        }

        const data = await feeService.listPlans(session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const body = await req.json();
        const data = await feeService.createPlan({ instituteId: session.instituteId, ...body });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

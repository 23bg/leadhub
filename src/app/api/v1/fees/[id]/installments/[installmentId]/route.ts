import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { feeService } from "@/features/fee/services/fee.service";
import { toAppError } from "@/lib/utils/error";

type RouteContext = { params: Promise<{ id: string; installmentId: string }> };

// Mark installment as paid / update status
export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const { installmentId } = await context.params;
        const body = await req.json();

        const data = body.status === "PAID"
            ? await feeService.markInstallmentPaid(installmentId)
            : await feeService.updateInstallmentStatus(installmentId, body.status);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const { installmentId } = await context.params;
        const data = await feeService.deleteInstallment(installmentId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

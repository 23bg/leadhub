import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { leadService } from "@/features/lead/services/lead.service";
import { toAppError } from "@/lib/utils/error";

const patchLeadSchema = z
    .object({
        status: z.enum(["NEW", "CONTACTED", "INTERESTED", "TRIAL", "CUSTOMER", "REJECTED", "ADMITTED"]).optional(),
        message: z.string().nullable().optional(),
        followUpAt: z.string().nullable().optional(),
    })
    .refine((payload) => payload.status !== undefined || payload.message !== undefined || payload.followUpAt !== undefined, {
        message: "status, message, or followUpAt is required",
    });

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const parsed = patchLeadSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_PAYLOAD", message: "status, message, or followUpAt is required" } },
                { status: 400 }
            );
        }
        const body = parsed.data;

        const data = await leadService.updateLead(session.instituteId, id, {
            status: body.status,
            message: body.message,
            followUpAt: body.followUpAt,
        });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

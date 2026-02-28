import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { leadService } from "@/features/lead/services/lead.service";
import { toAppError } from "@/lib/utils/error";

const leadListQuerySchema = z.object({
    status: z.enum(["NEW", "CONTACTED", "INTERESTED", "TRIAL", "CUSTOMER", "REJECTED", "ADMITTED"]).optional(),
    query: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const parsed = leadListQuerySchema.parse({
            status: req.nextUrl.searchParams.get("status") ?? undefined,
            query: req.nextUrl.searchParams.get("query") ?? undefined,
            from: req.nextUrl.searchParams.get("from") ?? undefined,
            to: req.nextUrl.searchParams.get("to") ?? undefined,
        });

        const data = await leadService.getLeads(session.instituteId, parsed);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { instituteService } from "@/features/institute/services/institute.service";
import { toAppError } from "@/lib/utils/error";

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        const { slug } = await context.params;
        const data = await instituteService.getPublicPage(slug);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

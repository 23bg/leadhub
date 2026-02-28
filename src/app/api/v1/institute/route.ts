import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { instituteService } from "@/features/institute/services/institute.service";
import { toAppError } from "@/lib/utils/error";

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await instituteService.getInstitute(session.userId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const body = (await req.json()) as {
            name?: string;
            slug?: string;
            description?: string;
            phone?: string;
            whatsapp?: string;
            city?: string;
            state?: string;
            address?: string;
            timings?: string;
            logo?: string;
            banner?: string;
            socialLinks?: {
                website?: string;
                instagram?: string;
                facebook?: string;
                youtube?: string;
                linkedin?: string;
            };
            websiteUrl?: string;
            instagramUrl?: string;
            facebookUrl?: string;
            youtubeUrl?: string;
            linkedinUrl?: string;
        };

        const data = await instituteService.updateProfile(session.instituteId, body);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

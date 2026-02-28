import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, readSessionFromCookie, setSessionCookie } from "@/lib/auth/auth";
import { instituteService } from "@/features/institute/services/institute.service";
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

        const body = (await req.json()) as {
            name: string;
            phone: string;
            city: string;
            state: string;
            address: string;
            whatsapp?: string;
            description?: string;
            website?: string;
            facebook?: string;
            instagram?: string;
            youtube?: string;
            linkedin?: string;
        };

        const data = await instituteService.completeOnboarding(session.instituteId, body);

        const nextToken = createSessionToken({
            ...session,
            isOnboarded: true,
        });
        await setSessionCookie(nextToken);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

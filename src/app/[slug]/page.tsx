import { redirect } from "next/navigation";

interface InstitutePageProps {
    params: Promise<{ slug: string }>;
}

export default async function InstitutePublicPage({ params }: InstitutePageProps) {
    const { slug } = await params;
    redirect(`/i/${slug}`);
}

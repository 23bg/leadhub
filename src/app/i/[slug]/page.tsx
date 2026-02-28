import { notFound } from "next/navigation";
import { instituteService } from "@/features/institute/services/institute.service";
import InstitutePublicView from "@/modules/institute/components/InstitutePublicView";

type InstituteSlugPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function InstituteSlugPage({ params }: InstituteSlugPageProps) {
    const { slug } = await params;

    const institute = await instituteService.getPublicPage(slug).catch(() => null);
    if (!institute) {
        notFound();
    }

    return <InstitutePublicView slug={slug} institute={institute} />;
}

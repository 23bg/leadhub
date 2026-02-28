import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        q: "Do I need a website?",
        a: "No. OnCampus provides your institute page.",
    },
    {
        q: "Can students submit enquiry?",
        a: "Yes via QR or link.",
    },
    {
        q: "Is this mobile friendly?",
        a: "Yes.",
    },
    {
        q: "Is there a free trial?",
        a: "Yes.",
    },
    {
        q: "Can I export students?",
        a: "Yes Excel export.",
    },
];

export default function FAQ() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-4xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">FAQ</h2>
                <Accordion type="single" collapsible className="mt-6 w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={faq.q} value={`item-${index + 1}`}>
                            <AccordionTrigger>{faq.q}</AccordionTrigger>
                            <AccordionContent>{faq.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}


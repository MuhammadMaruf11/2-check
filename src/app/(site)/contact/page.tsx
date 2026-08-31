import { Metadata } from "next";
import ContactForm from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the TechToCheck team — questions, tips, or review requests.",
};

export default function ContactPage() {
  return <ContactForm />;
}

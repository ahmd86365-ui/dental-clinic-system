import { Hero } from "@/components/home/hero";
import { AboutDoctor } from "@/components/home/about-doctor";
import { Services } from "@/components/home/services";
import { WhyUs } from "@/components/home/why-us";
import { TreatmentSteps } from "@/components/home/treatment-steps";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutDoctor />
      <Services />
      <WhyUs />
      <TreatmentSteps />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}

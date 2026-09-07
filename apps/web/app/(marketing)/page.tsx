import HeroSection from "@/components/ui/hero-section";
import { WorldMap } from "@/components/ui/map";
import { GenerationGallery } from "@/components/marketing/generation-gallery";
import { TestimonialsSection } from "@/components/ui/testimonials";
import { CinematicFooter } from "@/components/ui/motion-footer";

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <div className="w-full border-t border-border-soft bg-bg py-32">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-display text-2xl md:text-4xl font-medium text-text">Global network</p>
          <p className="text-sm md:text-lg text-text-muted max-w-2xl mx-auto py-4">
            Connect with teams and clients worldwide. Our platform enables seamless collaboration
            across continents, bringing the world to your workspace.
          </p>
        </div>
        <WorldMap
          lineColor="#8a8a8a"
          dots={[
            {
              start: { lat: 64.2008, lng: -149.4937, label: "Fairbanks" },
              end: { lat: 34.0522, lng: -118.2437, label: "Los Angeles" },
            },
            {
              start: { lat: 64.2008, lng: -149.4937, label: "Fairbanks" },
              end: { lat: -15.7975, lng: -47.8919, label: "Brasília" },
            },
            {
              start: { lat: -15.7975, lng: -47.8919, label: "Brasília" },
              end: { lat: 38.7223, lng: -9.1393, label: "Lisbon" },
            },
            {
              start: { lat: 51.5074, lng: -0.1278, label: "London" },
              end: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
            },
            {
              start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
              end: { lat: 43.1332, lng: 131.9113, label: "Vladivostok" },
            },
            {
              start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
              end: { lat: -1.2921, lng: 36.8219, label: "Nairobi" },
            },
          ]}
        />
      </div>

      <GenerationGallery />

      <TestimonialsSection />

      <CinematicFooter />
    </>
  );
}

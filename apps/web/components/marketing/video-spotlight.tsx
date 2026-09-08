const SPOTLIGHT_SRC =
  "https://res.cloudinary.com/dvqs3grvi/video/upload/v1788800455/AI_interviews_the_people_onboard_the_Titanic_1080p_wofxmt.mp4";

export function VideoSpotlight() {
  return (
    <section className="relative overflow-hidden bg-bg">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pb-36 sm:pt-24">
        <div
          style={{ animationDelay: "80ms" }}
          className="animate-fade-up overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-2xl"
        >
          <video
            src={SPOTLIGHT_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

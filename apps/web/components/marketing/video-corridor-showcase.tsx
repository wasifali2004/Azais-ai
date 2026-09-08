"use client";

import { ImageStreamHero, type StreamImage } from "@/components/ui/image-stream-hero";
import { useLanguage } from "@/lib/i18n/context";

const CLOUDINARY = "https://res.cloudinary.com/dvqs3grvi/video/upload";

const VIDEOS: StreamImage[] = [
  {
    src: `${CLOUDINARY}/v1788798787/social_skunkamatic_nuclear_explosion_in_the_desolate_dry_desert_the__c4e7b486-a9fc-4efd-82ec-3c9ada5a8236_0_npxxvv.mp4`,
    alt: "Nuclear explosion in a desolate desert landscape",
  },
  {
    src: `${CLOUDINARY}/v1788798779/social_u2116268223_Portrait_poster_5070_cm._Warm_hand_drawn_storyboo_f982102a-17b9-453f-8cf9-93277130a288_0_xxrmqv.mp4`,
    alt: "Warm hand-drawn storyboard style portrait poster",
  },
  {
    src: `${CLOUDINARY}/v1788798777/social_problesa_A_tale_of_a_latin_american_wise_old_man_who_owns_a_w_e1436b19-43d6-4fdb-893c-05a0412e5f6d_0_jgfblr.mp4`,
    alt: "A tale of a wise old Latin American man",
  },
  {
    src: `${CLOUDINARY}/v1788798772/social_u2938496453_A_candid_unposed_photograph_of_a_dapper_looking_m_89dc2560-8ea8-42bd-9ba6-b7e395757ca1_0_vzsjfo.mp4`,
    alt: "Candid unposed photograph of a dapper looking man",
  },
  {
    src: `${CLOUDINARY}/v1788798768/social_u3624149325_slow_documentary_push_across_the_silent_control_r_6739c9d5-82a0-484c-986b-a417a8a8283f_0_jyoxl5.mp4`,
    alt: "Slow documentary push across a silent control room",
  },
  {
    src: `${CLOUDINARY}/v1788798768/social_pesi_shaya_An_elderly_man_with_white_hair_and_a_long_gray_bea_8e514bab-3560-40d4-9c4c-934c99dc6f1e_0_pifhrg.mp4`,
    alt: "Elderly man with white hair and a long gray beard",
  },
  {
    src: `${CLOUDINARY}/v1788798770/social_big-e-mikey_portrait_of_Socrates_ancient_Greek_philosopher_50_5c59648e-f3d3-4ff3-a36d-8597aa0d9a8b_0_pivtmn.mp4`,
    alt: "Portrait of Socrates, the ancient Greek philosopher",
  },
  {
    src: `${CLOUDINARY}/v1788808586/social_Kiset_a_3d_digital_illustration_in_a_retro_low_poly_video_gam_65c7f2b7-df30-4622-82b2-ad287934fe21_0_qqslc1.mp4`,
    alt: "Retro low-poly 3D video game style illustration",
  },
  {
    src: `${CLOUDINARY}/v1788808586/social_u8188332146_Wide_cinematic_view_of_HD_189733_b_as_a_deep_coba_688b30f4-b5d0-487b-b0d8-e2296de1f8af_0_m3wcna.mp4`,
    alt: "Wide cinematic view of a deep cobalt exoplanet",
  },
  {
    src: `${CLOUDINARY}/v1788808598/social_garethh5768_subtle_bus_vibration_the_figure_stays_still_and_d_f2c021c3-81ec-47ef-8fcc-4bbaf735f888_0_mihxp3.mp4`,
    alt: "Figure staying still through a subtle bus vibration",
  },
  {
    src: `${CLOUDINARY}/v1788808635/social_muchtros_horse_strange_realistic_human_srreal_landscape_--ar__623e8830-67ed-41e9-93aa-d85e3370fb51_0_go9rpv.mp4`,
    alt: "Surreal horse in a strange, realistic landscape",
  },
];

export function VideoCorridorShowcase() {
  const { t } = useLanguage();

  return (
    <section className="bg-bg" aria-labelledby="video-showcase-title">
      <ImageStreamHero
        images={VIDEOS}
        cards={VIDEOS.length}
        // 9:16 to match the source clips — keeps every card gapless instead
        // of letterboxed or cropped at the sides.
        path={{ cardWidth: 14.06, cardHeight: 25 }}
        className="h-160 w-full sm:h-180"
      >
        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-between px-5 py-16 text-center sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{t.videoShowcase.eyebrow}</p>
            <h2
              id="video-showcase-title"
              className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-text sm:text-5xl"
            >
              {t.videoShowcase.title}
            </h2>
          </div>
          <p className="max-w-md text-balance text-sm leading-6 text-text-muted sm:text-base">
            {t.videoShowcase.subtitle}
          </p>
        </div>
      </ImageStreamHero>
    </section>
  );
}

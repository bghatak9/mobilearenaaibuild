import {
  getCatalogStatus,
  getDevices,
  getBulkUpcomingDevices,
  getBrandsGrouped,
  getNews,
  getReviews,
  getActiveAdvertisements,
} from "@/lib/api";
import { pickAdForPlacement } from "@/lib/ad-utils";
import AdUnit from "@/components/ads/AdUnit";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { HomeSpotlightGrid } from "@/components/home/arena/HomeSpotlightGrid";
import { buildHomeSpotlight } from "@/lib/home-spotlight";
import {
  AiRecommendationsSection,
  ArenaFooterEcosystem,
  ArenaPulseSection,
  CommunityStreamSection,
  EditorsArenaSection,
  EditorsChoiceSection,
  LaunchTimelineSection,
  TrendingArenaSection,
  UpcomingDevicesSection,
} from "@/components/home/arena/ArenaHomeSections";
import { BrandUniverseSection } from "@/components/home/arena/BrandUniverseSection";
import { HomePollWidget } from "@/components/home/arena/HomePollWidget";
import { NewsletterSignupSection } from "@/components/home/arena/NewsletterSignupSection";
import { ContactSection } from "@/components/home/arena/ContactSection";

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await safe(getCatalogStatus());
  const importedOnly = catalog?.importedOnly ?? false;

  const [news, reviews, devices, upcomingDevices, ads, brandGroups] =
    await Promise.all([
    safe(getNews()),
    importedOnly ? Promise.resolve(null) : safe(getReviews()),
    safe(getDevices()),
    safe(getBulkUpcomingDevices()),
    safe(getActiveAdvertisements()),
    safe(getBrandsGrouped()),
  ]);

  const adList = ads ?? [];
  const midAd =
    pickAdForPlacement(adList, "homepage-mid") ??
    pickAdForPlacement(adList, "native-sponsored-card") ??
    null;

  const deviceList = devices ?? [];
  const upcomingList = upcomingDevices ?? [];
  const reviewList = reviews ?? [];
  const newsList = news ?? [];

  const spotlight = buildHomeSpotlight(deviceList, reviewList, upcomingList);

  return (
    <ArenaShell>
      <main className="space-y-14">
        <HomeSpotlightGrid data={spotlight} />

        {!importedOnly ? (
          <>
            <ArenaPulseSection />
            <hr className="arena-home-divider" />
          </>
        ) : null}

        <TrendingArenaSection devices={deviceList} />
        <hr className="arena-home-divider" />

        <EditorsChoiceSection devices={deviceList} />
        <hr className="arena-home-divider" />

        <UpcomingDevicesSection devices={upcomingList} />
        <hr className="arena-home-divider" />

        <AiRecommendationsSection devices={deviceList} />

        {!importedOnly ? (
          <>
            <hr className="arena-home-divider" />
            <CommunityStreamSection />
          </>
        ) : null}

        <hr className="arena-home-divider" />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {!importedOnly ? <LaunchTimelineSection /> : null}
          <section aria-labelledby="reviews-polls">
            <HomePollWidget
              reviewsLink={reviewList[0] ? `/reviews/${reviewList[0].slug}` : "/reviews"}
            />
          </section>
        </div>

        <BrandUniverseSection
          brandGroups={brandGroups ?? []}
          devices={deviceList}
        />

        <hr className="arena-home-divider" />
        <EditorsArenaSection reviews={reviewList} news={newsList} />

        {midAd ? (
          <section aria-label="Sponsored">
            <AdUnit ad={midAd} variant="card" />
          </section>
        ) : null}

        <NewsletterSignupSection />

        <hr className="arena-home-divider" />
        <ContactSection />

        <ArenaFooterEcosystem />
      </main>
    </ArenaShell>
  );
}

import {
  getCatalogStatus,
  getDevices,
  getBulkUpcomingDevices,
  getBrandsGrouped,
  getNews,
  getReviews,
  getActiveAdvertisements,
} from "@/lib/api";
import { ArenaShell } from "@/components/layout/ArenaShell";
import { ArenaWireSection } from "@/components/home/arena/ArenaWireSection";
import { HomeSpotlightGrid } from "@/components/home/arena/HomeSpotlightGrid";
import { buildHomeSpotlight } from "@/lib/home-spotlight";
import {
  AiRecommendationsSection,
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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const catalog = await safe(getCatalogStatus());
  const importedOnly = catalog?.importedOnly ?? false;

  const [news, reviews, devices, upcomingDevices, ads, brandGroups] =
    await Promise.all([
      safe(getNews({ locale })),
      importedOnly ? Promise.resolve(null) : safe(getReviews(undefined, locale)),
      safe(getDevices(undefined, locale)),
      safe(getBulkUpcomingDevices(locale)),
      safe(getActiveAdvertisements()),
      safe(getBrandsGrouped(locale)),
    ]);

  const adList = ads ?? [];

  const deviceList = devices ?? [];
  const upcomingList = upcomingDevices ?? [];
  const reviewList = reviews ?? [];
  const newsList = news ?? [];

  const spotlight = buildHomeSpotlight(deviceList, reviewList, upcomingList);

  return (
    <ArenaShell
      ads={adList}
      afterAds={
        <>
          <NewsletterSignupSection />
          <hr className="arena-home-divider" />
          <ContactSection />
        </>
      }
    >
      <div className="space-y-14">
        {newsList.length > 0 ? <ArenaWireSection articles={newsList} /> : null}

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
      </div>
    </ArenaShell>
  );
}

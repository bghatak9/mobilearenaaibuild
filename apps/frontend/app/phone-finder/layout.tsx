import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phone Finder",
  description:
    "Filter MobileArena phones by price, battery, camera, display, 5G, and more. Find your next device with Arena Cards.",
};

export default function PhoneFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

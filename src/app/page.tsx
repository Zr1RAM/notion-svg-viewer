import { getAllHubItems } from "@/lib/content";
import { HubView } from "@/components/hub/HubView";

export default function HomePage() {
  const categories = getAllHubItems();
  return <HubView categories={categories} />;
}

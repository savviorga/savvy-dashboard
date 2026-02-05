import HomeDashboard from "./HomeDashboard";

export default function HomePage() {
  return <HomeDashboard initialDate={new Date().toISOString()} />;
}

import { Metadata } from "next";
import TVViewer from "./TVViewer";

export default function TVPage() {
  return <TVViewer />;
}

export const metadata: Metadata = {
  title: "TV Viewer | Dashboard",
  description: "View attachment group media in TV mode with real-time updates",
};

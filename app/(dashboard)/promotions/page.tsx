import { Metadata } from "next";
import AnimatedPromotionsPage from "./components/AnimatedPromotionsPage";
import { PromotionDTO } from "@/lib/api/v2/services/promotion";
import { createPromotionService } from "@/lib/api/v2/services/promotion";
import axios from "axios";
import { PromotionService } from "@/lib/api/v2";

export const metadata: Metadata = {
  title: "Promotions | Campaign Management",
  description:
    "Manage promotional campaigns, create and edit promotions for better customer engagement",
};

export default async function Page() {
  let promotions: PromotionDTO[] = [];
  let attachments: Record<string, string[]> = {};

  try {
    // const promotionService = createPromotionService(axiosInstance);
    const res = await PromotionService.getAllPromotions();
    promotions = res.promotions;
    attachments = res.attachments;
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    // Continue with empty arrays - the component will handle empty state
  }

  return (
    <AnimatedPromotionsPage promotions={promotions} attachments={attachments} />
  );
}

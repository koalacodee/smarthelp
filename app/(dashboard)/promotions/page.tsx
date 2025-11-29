import { Metadata } from "next";
import AnimatedPromotionsPage from "./components/AnimatedPromotionsPage";
import { PromotionDTO } from "@/lib/api/v2/services/promotion";
import { createPromotionService } from "@/lib/api/v2/services/promotion";
import axios from "axios";
import { PromotionService } from "@/lib/api/v2";
import { FileHubAttachment } from "@/lib/api/v2/services/shared/filehub";

export const metadata: Metadata = {
  title: "Promotions | Campaign Management",
  description:
    "Manage promotional campaigns, create and edit promotions for better customer engagement",
};

export default async function Page() {
  let promotions: PromotionDTO[] = [];
  let attachments: Record<string, string[]> = {};
  let fileHubAttachments: FileHubAttachment[] = [];
  try {
    // const promotionService = createPromotionService(axiosInstance);
    const res = await PromotionService.getAllPromotions();
    promotions = res.promotions;
    attachments = res.attachments;
    fileHubAttachments = res.fileHubAttachments;
  } catch (error) {
    // Continue with empty arrays - the component will handle empty state
  }

  return (
    <AnimatedPromotionsPage
      promotions={promotions}
      attachments={attachments}
      fileHubAttachments={fileHubAttachments}
    />
  );
}

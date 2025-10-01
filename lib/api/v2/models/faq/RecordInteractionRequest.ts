import type { UUID } from "./UUID";
import type { InteractionType } from "./InteractionType";

export interface RecordInteractionRequest {
  faqId: UUID;
  type: InteractionType;
}

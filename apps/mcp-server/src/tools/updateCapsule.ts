import { z } from "zod";

export const updateCapsuleInput = {
  id: z.string(),
  fields: z.record(z.unknown())
};

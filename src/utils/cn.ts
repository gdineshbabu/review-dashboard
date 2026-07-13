import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui's standard class-name helper: merge conditional + Tailwind classes. */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

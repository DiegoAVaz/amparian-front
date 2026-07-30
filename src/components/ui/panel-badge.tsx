import type { ReactNode } from "react";

import { cn, tv, type VariantProps } from "./variants";

const panelBadgeStyles = tv({
  base: "flex h-10 w-10 items-center justify-center rounded-full text-white",
  variants: {
    tone: {
      teal: "bg-brand-teal",
      danger: "bg-red-600",
    },
  },
  defaultVariants: {
    tone: "teal",
  },
});

export type PanelBadgeProps = VariantProps<typeof panelBadgeStyles> & {
  children: ReactNode;
  className?: string;
};

/**
 * Round coloured badge for the leading icon of a full-panel message.
 *
 * It exists so a lucide OUTLINE icon can carry the visual weight a filled mark
 * used to: the circle supplies the mass, lucide supplies the glyph. Before this,
 * the same effect was two hand-drawn SVGs.
 */
export function PanelBadge({ children, className, tone }: PanelBadgeProps) {
  return (
    <span className={cn(panelBadgeStyles({ tone }), className)}>{children}</span>
  );
}

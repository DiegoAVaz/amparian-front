/**
 * The Amparian brand shield.
 */
export type BrandShieldProps = {
  size?: number;
  /** `teal` on light surfaces; `white` on the brand-coloured header. */
  variant?: "teal" | "white";
};

export function BrandShield({ size = 36, variant = "teal" }: BrandShieldProps) {
  const outer = variant === "white" ? "white" : "#064e3b";
  const inner = variant === "white" ? "rgba(255,255,255,0.65)" : "#0d9488";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 3L5 8.5V17C5 24.18 10.64 30.9 18 33C25.36 30.9 31 24.18 31 17V8.5L18 3Z"
        fill={outer}
      />
      <path
        d="M18 6L8 10.8V17C8 23.12 12.56 28.78 18 30.6C23.44 28.78 28 23.12 28 17V10.8L18 6Z"
        fill={inner}
      />
    </svg>
  );
}

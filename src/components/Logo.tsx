/**
 * Brand mark for Only Good Deals: an acid-green "verified" stamp — a nod to
 * the site's real "Price verified" feature — paired with the wordmark and a
 * small tilted "100% GOOD" badge (the type-only concept folded into the
 * primary lockup).
 */
type StampMarkProps = {
  size?: number;
  className?: string;
};

export function StampMark({ size = 30, className }: StampMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Only Good Deals verified stamp"
      className={className}
    >
      <circle cx="100" cy="100" r="98" fill="var(--acid)" stroke="var(--ink)" strokeWidth="10" />
      <path
        d="M58 104 L86 132 L145 66"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type BrandProps = {
  size?: number;
  showBadge?: boolean;
  className?: string;
};

export function Brand({ size = 30, showBadge = true, className }: BrandProps) {
  return (
    <span className={["brand-lockup", className].filter(Boolean).join(" ")}>
      <StampMark size={size} />
      <span className="brand-word">
        ONLY GOOD DEALS<span className="brand-dot">.</span>
      </span>
      {showBadge && <span className="brand-badge">100% good</span>}
    </span>
  );
}

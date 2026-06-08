export default function BrandIcon({ size = 36, className = "", showBackground = true, bgFill = "#111113" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showBackground && <rect width="36" height="36" rx="8" fill={bgFill} />}
      <path
        d="M10 28 C10 18 14 8 18 8 C22 8 26 18 26 24"
        stroke="rgba(94, 106, 210, 0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 28 C13 20 15 12 18 12 C21 12 23 18 23 24"
        stroke="rgba(94, 106, 210, 0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 28 C16 22 17 16 18 16 C19 16 20 22 20 26"
        stroke="#5e6ad2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandLogo({ className = "" }) {
  return (
    <span className={`font-bold select-none tracking-tight ${className}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
      expos<span className="text-accent">.</span>ed
    </span>
  );
}

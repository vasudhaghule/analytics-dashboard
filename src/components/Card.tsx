interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className}`}>
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">{title}</h2>
      )}
      <div className="text-card-foreground">{children}</div>
    </div>
  );
} 
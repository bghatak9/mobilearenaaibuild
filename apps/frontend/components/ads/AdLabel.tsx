type AdLabelProps = {
  sponsored?: boolean;
  className?: string;
};

export default function AdLabel({ sponsored = false, className = "" }: AdLabelProps) {
  return (
    <p
      className={`text-[10px] uppercase tracking-widest text-gray-400 dark:text-zinc-500 ${className}`}
    >
      {sponsored ? "Sponsored" : "Advertisement"}
    </p>
  );
}

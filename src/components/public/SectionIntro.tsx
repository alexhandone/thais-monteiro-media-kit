type SectionIntroProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  tone?: "light" | "dark";
};

export function SectionIntro({
  eyebrow,
  title,
  copy,
  tone = "light",
}: SectionIntroProps) {
  const titleColor = tone === "dark" ? "text-paper" : "text-foreground";
  const copyColor = tone === "dark" ? "text-paper/70" : "text-muted";

  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        {eyebrow}
      </p>
      <h2
        className={`font-display text-4xl font-normal leading-[0.95] sm:text-5xl lg:text-6xl ${titleColor}`}
      >
        {title}
      </h2>
      {copy ? (
        <p className={`mt-5 max-w-2xl text-base leading-8 sm:text-lg ${copyColor}`}>
          {copy}
        </p>
      ) : null}
    </div>
  );
}

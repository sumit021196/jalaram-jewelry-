export default function Section({
  title,
  subtitle,
  children,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="py-12 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
               {title}
             </h2>
             {subtitle ? (
               <p className="mt-2 text-sm text-foreground/50 font-medium max-w-xl">
                 {subtitle}
               </p>
             ) : null}
           </div>
           {ctaHref && ctaLabel ? (
             <a
               href={ctaHref}
               className="inline-flex items-center text-[10px] font-serif font-bold uppercase tracking-[0.2em] text-foreground border-b-2 border-brand-accent pb-1 hover:text-brand-accent transition-all duration-300"
             >
              {ctaLabel}
            </a>
          ) : null}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

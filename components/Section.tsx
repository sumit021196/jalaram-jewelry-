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
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-medium text-gray-900 tracking-tight">
               {title}
             </h2>
             {subtitle ? (
               <p className="mt-3 text-sm md:text-base text-gray-400 font-light max-w-xl">
                 {subtitle}
               </p>
             ) : null}
           </div>
           {ctaHref && ctaLabel ? (
             <a
               href={ctaHref}
               className="inline-flex items-center text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-brand-red bg-[#fdf2f4] px-6 py-3 rounded-full hover:bg-brand-red hover:text-white transition-all duration-300 shadow-sm"
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

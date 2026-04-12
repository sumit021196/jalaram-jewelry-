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
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-heading font-medium text-gray-900 tracking-tight">
               {title}
             </h2>
             {subtitle ? (
               <p className="mt-2 text-xs md:text-base text-gray-400 font-light max-w-xl mx-auto md:mx-0">
                 {subtitle}
               </p>
             ) : null}
           </div>
           {ctaHref && ctaLabel ? (
             <div className="flex justify-center md:justify-end">
               <a
                 href={ctaHref}
                 className="inline-flex items-center text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-brand-red bg-[#fdf2f4] px-6 py-3 rounded-full hover:bg-brand-red hover:text-white transition-all duration-300 shadow-sm"
               >
                {ctaLabel}
              </a>
             </div>
           ) : null}
          <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

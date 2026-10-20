export default function StatsBand({ copy }) {
  return (
    <section id="stats" className="w-full border-b border-divider bg-bg-card px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-10 text-center text-[10px] font-black uppercase tracking-widest text-secondary-text">{copy.eyebrow}</p>
        <div className="grid grid-cols-2 gap-px bg-divider md:grid-cols-4">
          {copy.items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-2 bg-bg-card px-4 py-7 text-center md:py-9"
            >
              <span className="bg-gradient-to-r from-accent-text to-primary-text bg-clip-text font-display text-4xl font-black tracking-tight text-transparent md:text-5xl">
                {item.value}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-secondary-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

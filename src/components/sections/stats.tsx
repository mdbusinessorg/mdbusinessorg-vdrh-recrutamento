import { stats } from '@/data/site';

export function Stats() {
  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-vdrh-700 to-vdrh-900 text-white">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/20 blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-vdrh-400/20 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
            >
              <p className="text-5xl font-extrabold tracking-tight text-white">
                {stat.value}
                <span className="text-accent">{stat.suffix}</span>
              </p>
              <p className="mt-2 text-sm font-medium text-vdrh-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

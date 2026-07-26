import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Services } from '@/components/sections/services';
import { Stats } from '@/components/sections/stats';
import { JobsPreview } from '@/components/sections/jobs-preview';
import { Team } from '@/components/sections/team';
import { Testimonials } from '@/components/sections/testimonials';
import { CTA } from '@/components/sections/cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Stats />
      <Services />
      <JobsPreview />
      <Team />
      <Testimonials />
      <CTA />
    </>
  );
}

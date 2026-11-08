import { AboutPreview } from '@/components/home/AboutPreview';
import { Collaboration } from '@/components/home/Collaboration';
import { Hero } from '@/components/home/Hero';
import { Leadership } from '@/components/home/Leadership';
import { Objective } from '@/components/home/Objective';
import { ResearchPreview } from '@/components/home/ResearchPreview';
import { Statistics } from '@/components/home/Statistics';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle();

  return (
    <>
      <Hero />
      <Statistics />
      <AboutPreview />
      <ResearchPreview />
      <Objective />
      <Leadership spacing="pb-20 sm:pb-28" />
      <Collaboration />
    </>
  );
}

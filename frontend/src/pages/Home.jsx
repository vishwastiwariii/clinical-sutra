import Page from '../components/layout/Page.jsx';
import HeroSection from '../sections/HeroSection.jsx';
import SearchSection from '../sections/SearchSection.jsx';
import TrialsSection from '../sections/TrialsSection.jsx';

/**
 * The homepage is just an ordered list of self-contained sections — each one
 * pulls what it needs from TrialsContext, so adding or reordering a section is
 * a one-line change here.
 */
const SECTIONS = [
  { id: 'hero', Component: HeroSection },
  { id: 'search', Component: SearchSection },
  { id: 'trials', Component: TrialsSection },
];

export default function Home() {
  return (
    <Page className="pt-18">
      {SECTIONS.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </Page>
  );
}

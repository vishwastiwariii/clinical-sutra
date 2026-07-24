import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useAssistant, useRouter } from '../../state/contexts.js';

export default function Navbar() {
  const { navigate } = useRouter();
  const { open } = useAssistant();

  return (
    <nav className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-line bg-paper px-6 sm:px-12">
      <button
        type="button"
        onClick={() => navigate('home')}
        className="flex cursor-pointer items-center gap-2.5"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
          <span className="h-2.5 w-2.5 rounded-full bg-paper" />
        </span>
        <span className="font-serif text-xl font-medium tracking-[-0.01em] text-ink">Clinical Sutra</span>
      </button>

      <Button onClick={open}>
        <Icon name="sparkle" />
        Ask AI
      </Button>
    </nav>
  );
}

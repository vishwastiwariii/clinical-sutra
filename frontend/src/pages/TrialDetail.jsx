import { useEffect } from 'react';
import Page from '../components/layout/Page.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import Notice from '../components/ui/Notice.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import SectionLabel from '../components/ui/SectionLabel.jsx';
import StatusPill from '../components/ui/StatusPill.jsx';
import FactGrid from '../components/trials/FactGrid.jsx';
import TrialAside from '../components/trials/TrialAside.jsx';
import useTrial from '../hooks/useTrial.js';
import { useAssistant, useRouter } from '../state/contexts.js';

/** Only render a fact/meta entry when the API actually gave us the field. */
const present = (entries) => entries.filter((e) => e.value !== null && e.value !== undefined && e.value !== '');

function Section({ title, children }) {
  return (
    <section>
      <SectionLabel className="mb-3 block">{title}</SectionLabel>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-4/5" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function TrialDetail({ nctId }) {
  const { navigate } = useRouter();
  const { trial, loading, error, retry } = useTrial(nctId);
  const { setContextTrial } = useAssistant();

  // Scope the assistant to this trial while the page is mounted.
  useEffect(() => {
    setContextTrial(trial);
    return () => setContextTrial(null);
  }, [trial, setContextTrial]);

  const backButton = (
    <Button variant="ghost" size="sm" className="mb-10 px-0" onClick={() => navigate('home')}>
      <Icon name="arrowLeft" />
      All studies
    </Button>
  );

  if (loading || error || !trial) {
    return (
      <Page className="pt-12">
        {backButton}
        {loading ? (
          <DetailSkeleton />
        ) : (
          <Notice
            title={error || 'This study could not be found.'}
            description={`We looked for ${nctId}.`}
            action={{ label: 'Try again', onClick: retry }}
          />
        )}
      </Page>
    );
  }

  const facts = present([
    { label: 'Phase', value: trial.phase === 'N/A' ? 'Not applicable' : `Phase ${trial.phase}` },
    { label: 'Condition', value: trial.condition },
    { label: 'Enrollment', value: trial.enrollment ? `${trial.enrollment} participants` : null },
    { label: 'Sponsor', value: trial.sponsor },
    { label: 'Listed', value: trial.addedAt },
  ]).slice(0, 4);

  // Sidebar carries only what isn't already on the page above.
  const meta = present([
    { label: 'Locations', value: trial.locations },
    { label: 'Study period', value: trial.period },
    { label: 'Study type', value: trial.studyType },
  ]);

  return (
    <Page className="pt-12">
      {backButton}

      <div className="mb-4 flex items-center gap-3.5">
        <span className="font-mono text-sm text-accent">{trial.nctId}</span>
        <StatusPill status={trial.status} tone={trial.tone} size="sm" />
      </div>

      <h1 className="mb-8 max-w-[720px] font-serif text-[clamp(26px,4.5vw,34px)] leading-tight font-normal tracking-[-0.015em] text-pretty text-ink">
        {trial.title}
      </h1>

      <FactGrid facts={facts} />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_280px] lg:gap-16">
        <div className="flex flex-col gap-10">
          <Section title="About this study">
            <p className="text-base leading-[1.7] text-pretty text-ink-soft">
              {trial.summary || 'No plain-language summary has been published for this study yet.'}
            </p>
          </Section>

          {trial.eligibility.length > 0 && (
            <Section title="Who can join">
              <ul className="flex flex-col gap-2.5">
                {trial.eligibility.map((item) => (
                  <li key={item} className="flex items-baseline gap-3">
                    <span className="mt-0 h-[5px] w-[5px] shrink-0 -translate-y-[3px] rounded-full bg-accent" />
                    <span className="text-[15px] leading-relaxed text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {trial.involvement && (
            <Section title="What participation involves">
              <p className="text-[15px] leading-[1.7] text-pretty text-ink-soft">{trial.involvement}</p>
            </Section>
          )}
        </div>

        <TrialAside meta={meta} />
      </div>
    </Page>
  );
}

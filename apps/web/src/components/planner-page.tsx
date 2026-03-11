'use client';

import dynamic from 'next/dynamic';

const PlannerProvider = dynamic(
  () => import('./planner-provider').then((m) => m.PlannerProvider),
  { ssr: false },
);

interface Props {
  strategyId: string;
}

export function PlannerPage({ strategyId }: Props) {
  return <PlannerProvider strategyId={strategyId} />;
}

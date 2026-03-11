import { PlannerPage } from '../../../components/planner-page';

interface Props {
  params: Promise<{ strategyId: string }>;
}

// Static export: no paths pre-rendered; client-side routing handles all strategy IDs
export function generateStaticParams() {
  return [];
}

export const dynamicParams = false;

export default async function PlannerRoute({ params }: Props) {
  const { strategyId } = await params;
  return <PlannerPage strategyId={strategyId} />;
}

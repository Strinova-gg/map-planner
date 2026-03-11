import { PlannerPage } from '../../../components/planner-page';

interface Props {
  params: Promise<{ strategyId: string }>;
}

export default async function PlannerRoute({ params }: Props) {
  const { strategyId } = await params;
  return <PlannerPage strategyId={strategyId} />;
}

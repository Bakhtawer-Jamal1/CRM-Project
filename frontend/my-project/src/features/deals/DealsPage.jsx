import FeatureList from '../../components/layout/FeatureList';
import { dealsApi } from './dealsApi';

const fields = [
  { name: 'title', label: 'Deal name', required: true },
  { name: 'value', label: 'Value', type: 'number', required: true },
  { name: 'stage', label: 'Stage', defaultValue: 'prospecting', options: ['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost'] },
  { name: 'company', label: 'Company' },
  { name: 'expectedCloseDate', label: 'Expected close', type: 'date' },
];

const columns = [
  { label: 'Deal', key: 'title' },
  { label: 'Company', key: 'company' },
  { label: 'Stage', key: 'stage' },
  { label: 'Value', key: 'value' },
];

export default function DealsPage() {
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <FeatureList
        title="Deals"
        subtitle="Track opportunities from first contact to close."
        api={dealsApi}
        fields={fields}
        columns={columns}
        searchKeys={['title', 'company', 'stage']}
      />
    </div>
  );
}
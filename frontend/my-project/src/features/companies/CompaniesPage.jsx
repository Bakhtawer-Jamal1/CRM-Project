import FeatureList from '../../components/layout/FeatureList';
import { companiesApi } from './companiesApi';

const fields = [
  { name: 'name', label: 'Company name', required: true },
  { name: 'industry', label: 'Industry' },
  { name: 'website', label: 'Website', type: 'url' },
  { name: 'phone', label: 'Phone' },
  { name: 'address', label: 'Address', wide: true },
];

const columns = [
  { label: 'Company', key: 'name' },
  { label: 'Industry', key: 'industry' },
  { label: 'Website', key: 'website' },
  { label: 'Phone', key: 'phone' },
];

export default function CompaniesPage() {
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <FeatureList
        title="Companies"
        subtitle="Manage the organizations you work with."
        api={companiesApi}
        fields={fields}
        columns={columns}
        searchKeys={['name', 'industry', 'website']}
      />
    </div>
  );
}
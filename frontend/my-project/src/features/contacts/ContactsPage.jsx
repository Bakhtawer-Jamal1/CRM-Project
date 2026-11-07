import FeatureList from '../../components/layout/FeatureList';
import { contactsApi } from './contactsApi';

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'company', label: 'Company' },
  { name: 'jobTitle', label: 'Job title' },
  { name: 'status', label: 'Status', defaultValue: 'lead', options: ['lead', 'contacted', 'qualified', 'customer', 'lost'] },
];

const columns = [
  { label: 'Name', key: 'name' },
  { label: 'Email', key: 'email' },
  { label: 'Company', key: 'company' },
  { label: 'Status', key: 'status' },
];

export default function ContactsPage() {
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <FeatureList
        title="Contacts"
        subtitle="Keep every relationship organized."
        api={contactsApi}
        fields={fields}
        columns={columns}
        searchKeys={['name', 'email', 'company']}
      />
    </div>
  );
}
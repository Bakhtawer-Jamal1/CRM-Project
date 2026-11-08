import FeatureList from '../../components/layout/FeatureList';
import { employeesApi } from './employeesApi';

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Work email', type: 'email', required: true },
  { name: 'jobTitle', label: 'Job title', required: true },
  { name: 'department', label: 'Department', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'status', label: 'Status', defaultValue: 'active', options: ['active', 'on leave', 'inactive'] },
];

const columns = [
  { label: 'Employee', key: 'name' },
  { label: 'Job title', key: 'jobTitle' },
  { label: 'Department', key: 'department' },
  { label: 'Email', key: 'email' },
  { label: 'Status', key: 'status' },
];

export default function EmployeesPage() {
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <FeatureList
        title="Employees"
        subtitle="Manage your team and their work details."
        api={employeesApi}
        fields={fields}
        columns={columns}
        searchKeys={['name', 'email', 'jobTitle', 'department', 'status']}
      />
    </div>
  );
}

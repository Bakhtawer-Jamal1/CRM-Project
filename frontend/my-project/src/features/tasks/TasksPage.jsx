import FeatureList from '../../components/layout/FeatureList';
import { tasksApi } from './tasksApi';

const fields = [
  { name: 'title', label: 'Task title', required: true },
  { name: 'description', label: 'Description', wide: true },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'priority', label: 'Priority', defaultValue: 'medium', options: ['low', 'medium', 'high'] },
  { name: 'status', label: 'Status', defaultValue: 'pending', options: ['pending', 'in progress', 'completed'] },
];

const columns = [
  { label: 'Task', key: 'title' },
  { label: 'Due date', key: 'dueDate' },
  { label: 'Priority', key: 'priority' },
  { label: 'Status', key: 'status' },
];

export default function TasksPage() {
  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <FeatureList
        title="Tasks"
        subtitle="Plan follow-ups and keep work on schedule."
        api={tasksApi}
        fields={fields}
        columns={columns}
        searchKeys={['title', 'description', 'status']}
      />
    </div>
  );
}
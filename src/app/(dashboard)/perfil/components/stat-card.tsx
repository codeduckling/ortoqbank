import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  green: 'bg-green-50 text-green-800 border-green-200',
  red: 'bg-red-50 text-red-800 border-red-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
};

export function StatCard({ title, value, description, color }: StatCardProps) {
  return (
    <Card className={`border ${colorMap[color]} shadow-sm`}>
      <CardContent className="p-6">
        <h3 className="text-md font-medium">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold">{value}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}

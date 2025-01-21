'use client';

type CircularProgressProps = {
  value: number;
  label: string;
};

export function CircularProgress({ value, label }: CircularProgressProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90 transform">
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="64"
          cy="64"
        />
        <circle
          className="text-blue-600"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="64"
          cy="64"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    </div>
  );
}

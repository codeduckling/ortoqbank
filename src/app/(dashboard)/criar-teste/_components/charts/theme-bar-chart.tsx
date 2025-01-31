'use client';

import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
const chartData = [
  { theme: 'Ciências Básicas', percentage: 25 },
  { theme: 'Tumores', percentage: 30 },
  { theme: 'Coluna', percentage: 23 },
  { theme: 'Mão', percentage: 100 },
  { theme: 'Ombro e Cotovelo', percentage: 20 },
  { theme: 'Joelho', percentage: 80 },
];

const chartConfig = {
  percentage: {
    label: 'percentage',
    color: 'hsl(var(--chart-1))',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

export function ThemeBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por temas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 40,
              left: 8,
              top: 8,
              bottom: 8,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="theme"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={60}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: string) => {
                const words = value.split(' ');
                if (words.length === 1) return value;

                // Split into roughly equal parts
                const midpoint = Math.ceil(words.length / 2);
                const firstLine = words.slice(0, midpoint).join(' ');
                const secondLine = words.slice(midpoint).join(' ');

                return `${firstLine}\n${secondLine}`;
              }}
            />
            <XAxis
              dataKey="percentage"
              type="number"
              tickMargin={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => value.toString() + '%'}
              ticks={[0, 25, 50, 75, 100]}
              minTickGap={0}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="percentage"
              layout="vertical"
              fill="var(--color-percentage)"
              radius={4}
            >
              <LabelList
                dataKey="percentage"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => value.toString() + '%'}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

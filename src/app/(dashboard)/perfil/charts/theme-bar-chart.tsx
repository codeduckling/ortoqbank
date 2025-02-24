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
  { theme: 'Quadril', percentage: 100 },
  { theme: 'Pé e Tornozelo', percentage: 20 },
  { theme: 'Ortopedia Pediátrica', percentage: 80 },
];

const chartConfig = {
  percentage: {
    label: 'porcentagem',
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
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 40,
              left: 0,
              top: 16,
              bottom: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="theme"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={70}
              tick={{
                fontSize: 11,
                width: 65,
                fill: 'hsl(var(--muted-foreground))',
              }}
              tickFormatter={(value: string) => {
                const maxCharsPerLine = 14;
                const words = value.split(' ');
                let lines = [];
                let currentLine = words[0];

                for (let index = 1; index < words.length; index++) {
                  if (
                    (currentLine + ' ' + words[index]).length <= maxCharsPerLine
                  ) {
                    currentLine += ' ' + words[index];
                  } else {
                    lines.push(currentLine);
                    currentLine = words[index];
                  }
                }
                lines.push(currentLine);

                return lines.join('\n');
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

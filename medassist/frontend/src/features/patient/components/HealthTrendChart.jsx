import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { day: "Mon", score: 82 },
  { day: "Tue", score: 85 },
  { day: "Wed", score: 80 },
  { day: "Thu", score: 86 },
  { day: "Fri", score: 84 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 87 }
];

export default function HealthTrendChart() {

  return (

    <div className="bg-white rounded-xl p-4 shadow-sm">

      <h3 className="text-sm font-medium mb-3">
        Health Trend
      </h3>

      <ResponsiveContainer width="100%" height={200}>

        <AreaChart data={data}>

          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis dataKey="day"/>

          <YAxis/>

          <Tooltip/>

          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            fill="url(#healthGradient)"
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>

  );
}
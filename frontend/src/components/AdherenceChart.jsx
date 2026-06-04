import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function AdherenceChart({ taken = 0, missed = 0 }) {
  const data = [
    { name: 'Taken', value: taken, color: '#22c55e' },
    { name: 'Missed', value: missed, color: '#ef4444' },
  ]

  const hasData = taken > 0 || missed > 0
  const chartData = hasData ? data : [{ name: 'No Doses', value: 1, color: '#334155' }]

  return (
    <div className="w-full h-[110px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={45}
            paddingAngle={hasData ? 5 : 0}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {hasData && (
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.75rem',
                fontSize: '11px',
                color: '#f8fafc',
              }}
              itemStyle={{ color: '#f8fafc' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

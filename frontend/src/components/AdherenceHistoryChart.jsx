import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdherenceHistoryChart({ logs = [] }) {
  const groupLogsByDate = (logsList) => {
    const groups = {}
    const sortedLogs = [...logsList].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    
    sortedLogs.forEach(log => {
      if (!log.scheduledTime) return
      const dateObj = new Date(log.scheduledTime)
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      if (!groups[dateStr]) {
        groups[dateStr] = { date: dateStr, Taken: 0, Missed: 0 }
      }
      
      if (log.status === 'TAKEN') {
        groups[dateStr].Taken += 1
      } else if (log.status === 'MISSED') {
        groups[dateStr].Missed += 1
      }
    })
    
    return Object.values(groups)
  }

  const chartData = groupLogsByDate(logs)

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="section-header">
        <h2 className="section-title">📊 Daily Adherence Trends</h2>
        <span className="badge badge-primary text-xs">Taken vs Missed</span>
      </div>
      
      <div className="w-full h-[220px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              allowDecimals={false} 
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconSize={10} 
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
            />
            <Bar dataKey="Taken" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

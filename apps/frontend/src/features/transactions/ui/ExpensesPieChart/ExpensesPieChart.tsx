import type { Transaction } from "@/entities/transaction"
import { useMemo } from "react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { formatMoney } from "@/shared/lib/formatMoney"
import styles from './ExpensesPieChart.module.css'

interface ExpensesPieChartProps {
  transactions: Transaction[]
}

export function ExpensesPieChart({ transactions }: ExpensesPieChartProps) {
  const { chartData, totalExpenseKopecks, categoryList } = useMemo(() => {
    const expenses = transactions.filter(tx => tx.type === 'expense')
    
    // Сумма всех расходов в копейках
    const totalKopecks = expenses.reduce((sum, tx) => sum + tx.amount, 0)

    if (totalKopecks === 0) {
      return { chartData: [], totalExpenseKopecks: 0, categoryList: [] }
    }

    // Группируем по категориям (в копейках)
    const map = expenses.reduce((acc, tx) => {
      const categoryName = tx.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = {
          amountKopecks: 0,
          color: tx.category.color,
          icon: tx.category.icon
        }
      }
      acc[categoryName].amountKopecks += tx.amount
      return acc
    }, {} as Record<string, { amountKopecks: number; color: string; icon?: string }>)

    // Сортируем по убыванию
    const sorted = Object.entries(map)
      .map(([name, data]) => ({
        name,
        amountKopecks: data.amountKopecks,
        color: data.color,
        icon: data.icon,
        percent: Math.round((data.amountKopecks / totalKopecks) * 100)
      }))
      .sort((a, b) => b.amountKopecks - a.amountKopecks)

    // Топ-5 категорий, а остальные объединяем в "Другие"
    const topCount = 5

    const finalChartData = sorted.length <= topCount + 1
      ? sorted.map(item => ({
          name: item.name,
          value: Math.round(item.amountKopecks / 100),
          fill: item.color,
          percent: item.percent,
          amountKopecks: item.amountKopecks
        }))
      : [
          ...sorted.slice(0, topCount).map(item => ({
            name: item.name,
            value: Math.round(item.amountKopecks / 100),
            fill: item.color,
            percent: item.percent,
            amountKopecks: item.amountKopecks
          })),
          {
            name: 'Другие расходы',
            value: Math.round(sorted.slice(topCount).reduce((sum, item) => sum + item.amountKopecks, 0) / 100),
            fill: '#71717a',
            percent: Math.round((sorted.slice(topCount).reduce((sum, item) => sum + item.amountKopecks, 0) / totalKopecks) * 100),
            amountKopecks: sorted.slice(topCount).reduce((sum, item) => sum + item.amountKopecks, 0)
          }
        ]

    return {
      chartData: finalChartData,
      totalExpenseKopecks: totalKopecks,
      categoryList: finalChartData
    }
  }, [transactions])

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Структура расходов</h3>
      </div>

      <div className={styles.contentRow}>
        {/* Бубликовый график с суммой расходов в центре */}
        <div className={styles.chartBox}>
          <div className={styles.chartWrapper}>
            {/* Текст внутри бублика */}
            <div className={styles.centerOverlay}>
              <span className={styles.centerLabel}>Всего расходов</span>
              <span className={styles.centerValue}>{formatMoney(totalExpenseKopecks)}</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={86}
                  paddingAngle={3}
                  cornerRadius={4}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  wrapperStyle={{ zIndex: 1000, outline: 'none' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className={styles.customTooltip}>
                          <div className={styles.tooltipHeader}>
                            <span className={styles.tooltipDot} style={{ backgroundColor: data.fill }} />
                            <span className={styles.tooltipName}>{data.name}</span>
                          </div>
                          <div className={styles.tooltipValue}>
                            {formatMoney(data.amountKopecks)} ({data.percent}%)
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Списочек категорий с процентами и барами */}
        <div className={styles.categoryList}>
          {categoryList.map((cat) => (
            <div key={cat.name} className={styles.categoryRow}>
              <div className={styles.catInfo}>
                <div className={styles.catNameRow}>
                  <span className={styles.catDot} style={{ backgroundColor: cat.fill }} />
                  <span className={styles.catName}>{cat.name}</span>
                </div>
                <span className={styles.catAmount}>{formatMoney(cat.amountKopecks)}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${cat.percent}%`, backgroundColor: cat.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import type { Transaction } from "@/entities/transaction";
import { useMemo } from "react";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import styles from './ExpensesPieChart.module.css'

export function ExpensesPieChart({ transactions }: { transactions: Transaction[] }) {

  const chartData = useMemo(() => {
    const expenses = transactions.filter(tx => tx.type === 'expense')

    const map = expenses.reduce((acc, tx) => {
      const categoryName = tx.category.name
      const amount = tx.amount / 100
      if (!acc[categoryName]) {
        acc[categoryName] = {
          amount: 0,
          color: tx.category.color
        }
      }
      acc[categoryName].amount += amount
      return acc
    }, {} as Record<string, { amount: number, color: string }>)

    const sortedData = Object.entries(map)
      .map(([name, data]) => ({ name, value: data.amount, fill: data.color }))
      .sort((a, b) => b.value - a.value)

    return sortedData

  }, [transactions])

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartWrapper}>
      <h3 className={styles.title}>Расходы по категориям</h3>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2} // Зазор между дольками
            />
            <Tooltip formatter={(value: any, name: any) => [`${value} ₽`, `${name}`]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
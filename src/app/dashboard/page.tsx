import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, TrendingUp } from "lucide-react"
import '../../app/globals.css'
export default async function DashboardHome() {
  const [count, total] = await Promise.all([
    prisma.quotation.count().catch(() => 0),
    prisma.quotation.aggregate({ _sum: { total: true } }).catch(() => ({ _sum: { total: 0 } })),
  ])

  const totalValue = Number(total._sum.total ?? 0)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here is an overview of your business.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <p className="text-xs text-gray-500 mt-1">Active quotations in system</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined value of all quotations</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{count > 0 ? (totalValue / count).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Average quotation value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

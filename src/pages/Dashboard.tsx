import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../api";

interface StatData {
  totalFund: number;
  totalIncome: number;
  totalExpense: number;
  membersCount: number;
  branches: Record<string, { name: string; income: number; expense: number }>;
  monthlyStats: Array<{ month: string; income: number; expense: number }>;
  recentEvents: Array<{
    id: number;
    name: string;
    date: string;
    budget: number;
    actualSpending: number;
    progress: number;
  }>;
  recentTransactions: Array<{
    id: number;
    description: string;
    type: string;
    amount: number;
    date: string;
    member?: { name: string };
  }>;
}

const StatCard = ({
  title,
  amount,
  icon: Icon,
  colorClass,
  bgColorClass,
  trend,
}: {
  title: string;
  amount: number;
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
  trend?: number;
}) => (
  <Card className="overflow-hidden transition-all hover:shadow-md border-border/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={cn("p-2.5 rounded-xl", bgColorClass, colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend > 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600",
            )}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight mt-1">
          {amount.toLocaleString("vi-VN")}{" "}
          <span className="text-lg font-normal text-muted-foreground">₫</span>
        </h3>
      </div>
    </CardContent>
  </Card>
);

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-border text-sm">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">
              {entry.name === "income" ? "Thu" : "Chi"}:
            </span>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatData | null>(null);
  const [timeRange, setTimeRange] = useState<"all" | "today" | "year">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        let params = {};
        if (timeRange === "today") {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const end = new Date();
          end.setHours(23, 59, 59, 999);
          params = {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          };
        } else if (timeRange === "year") {
          const start = new Date(new Date().getFullYear(), 0, 1);
          const end = new Date(
            new Date().getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999,
          );
          params = {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          };
        }

        const res = await api.get("/dashboard/summary", { params });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [timeRange]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return null;

  const lineChartData = data.monthlyStats.map((item) => ({
    name: item.month,
    income: item.income,
    expense: item.expense,
  }));

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#64748b"];
  const branchData = Object.keys(data.branches)
    .map((key) => ({
      name: data.branches[key].name,
      income: data.branches[key].income,
      expense: data.branches[key].expense,
    }))
    .filter((b) => b.income > 0 || b.expense > 0);

  return (
    <div
      className={cn(
        "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20",
        loading ? "opacity-50 pointer-events-none" : "",
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tổng quan tài chính
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi dòng tiền và tiến độ các công việc trong dòng họ.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
          <Button
            variant={timeRange === "all" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8",
              timeRange === "all"
                ? "shadow-none bg-background border border-border/50"
                : "",
            )}
            onClick={() => setTimeRange("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={timeRange === "today" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8",
              timeRange === "today"
                ? "shadow-none bg-background border border-border/50"
                : "",
            )}
            onClick={() => setTimeRange("today")}
          >
            Hôm nay
          </Button>
          <Button
            variant={timeRange === "year" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8",
              timeRange === "year"
                ? "shadow-none bg-background border border-border/50"
                : "",
            )}
            onClick={() => setTimeRange("year")}
          >
            Năm {new Date().getFullYear()}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Quỹ hiện tại"
          amount={data.totalFund}
          icon={Wallet}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-50"
        />
        <StatCard
          title="Tổng thu"
          amount={data.totalIncome}
          icon={TrendingUp}
          colorClass="text-emerald-600"
          bgColorClass="bg-emerald-50"
          trend={12}
        />
        <StatCard
          title="Tổng chi"
          amount={data.totalExpense}
          icon={TrendingDown}
          colorClass="text-rose-600"
          bgColorClass="bg-rose-50"
          trend={-5}
        />
        <StatCard
          title="Thành viên"
          amount={data.membersCount}
          icon={Users}
          colorClass="text-indigo-600"
          bgColorClass="bg-indigo-50"
        />
      </div>

      {/* Tiến độ sự kiện / Dự toán */}
      {data.recentEvents?.length > 0 && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tiến độ sự kiện & Dự toán
              </CardTitle>
              <CardDescription>
                Liên kết dự toán với dòng tiền thực tế.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.recentEvents.map((event) => (
                <div key={event.id} className="space-y-3 group">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    <div className="flex items-center text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      <Calendar className="w-3 h-3 mr-1" />{" "}
                      {format(new Date(event.date || Date.now()), "dd/MM")}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">
                        Chi tiêu:{" "}
                        {event.actualSpending?.toLocaleString("vi-VN")} ₫
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          event.actualSpending > event.budget
                            ? "text-destructive"
                            : "text-primary",
                        )}
                      >
                        {Math.round(event.progress)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          event.actualSpending > event.budget
                            ? "bg-destructive"
                            : "bg-primary",
                        )}
                        style={{ width: `${Math.min(100, event.progress)}%` }}
                      />
                    </div>
                  </div>
                    <p className="text-[10px] text-muted-foreground flex justify-between items-center">
                      <span>
                        Ngân sách: {event.budget?.toLocaleString("vi-VN")} ₫
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] font-medium hover:bg-primary/10 hover:text-primary"
                        onClick={() =>
                          navigate("/transactions", {
                            state: { eventId: event.id.toString() },
                          })
                        }
                      >
                        Xem thu chi <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </p>
                    {event.actualSpending > event.budget && (
                      <p className="text-[10px] text-destructive font-medium text-right mt-1">
                        Vượt{" "}
                        {(
                          ((event.actualSpending - event.budget) /
                            event.budget) *
                          100
                        ).toFixed(0)}
                        %
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Biến động thu chi</CardTitle>
            <CardDescription>
              Dữ liệu theo từng tháng trong năm.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--destructive))"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--destructive))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  name="Thu"
                  dataKey="income"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  name="Chi"
                  dataKey="expense"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Đóng góp theo chi</CardTitle>
            <CardDescription>
              So sánh giữa các chi nhánh trong họ.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={branchData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                  content={<CustomTooltip />}
                />
                <Bar
                  name="Thu"
                  dataKey="income"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  name="Chi"
                  dataKey="expense"
                  fill="#fb923c"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Tỷ trọng đóng góp</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={branchData.filter((b) => b.income > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="income"
                    stroke="none"
                  >
                    {branchData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(
                      val:
                        | string
                        | number
                        | readonly (string | number)[]
                        | undefined,
                    ) => [
                      `${Number(val || 0).toLocaleString("vi-VN")} ₫`,
                      "Đóng góp",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full px-2">
              {branchData
                .filter((b) => b.income > 0)
                .map((b, i) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {b.name}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle>Giao dịch gần nhất</CardTitle>
              <CardDescription>
                Lịch sử 5 hoạt động tài chính mới nhất.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => navigate("/transactions")}
            >
              Xem tất cả <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {data.recentTransactions?.length > 0 ? (
                data.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center",
                          tx.type === "EXPENSE"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-600",
                        )}
                      >
                        {tx.type === "EXPENSE" ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>
                            {format(new Date(tx.date), "dd MMMM, yyyy")}
                          </span>
                          {tx.member && (
                            <>
                              <span>•</span>
                              <span className="bg-muted px-1 rounded">
                                {tx.member.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        tx.type === "EXPENSE"
                          ? "text-rose-600"
                          : "text-emerald-600",
                      )}
                    >
                      {tx.type === "EXPENSE" ? "-" : "+"}
                      {tx.amount.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Chưa có giao dịch nào.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

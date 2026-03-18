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
import { vi } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChevronRight,
  Receipt,
  Target,
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
  <Card className="group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 border-border/40 bg-card/50 backdrop-blur-sm rounded-[2rem] border-none shadow-xl shadow-foreground/5">
    <CardContent className="p-7">
      <div className="flex items-center justify-between">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner", bgColorClass, colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
              trend > 0
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border-rose-500/20",
            )}
          >
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-6 space-y-1.5">
        <p className="text-sm font-bold text-muted-foreground tracking-tight">{title}</p>
        <h3 className="text-[28px] font-black tracking-tighter text-foreground leading-none tabular-nums">
          {amount.toLocaleString("vi-VN")}{" "}
          <span className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">đ</span>
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
      <div className="bg-background/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-border/40 animate-in zoom-in-95 duration-200 min-w-[160px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border/40">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-bold text-muted-foreground tracking-tight">
                  {entry.name === "income" ? "Thu" : "Chi"}:
                </span>
              </div>
              <span className="text-xs font-black tabular-nums" style={{ color: entry.color }}>
                {entry.value.toLocaleString("vi-VN")} đ
              </span>
            </div>
          ))}
        </div>
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
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
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
        "space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20",
        loading ? "opacity-50 pointer-events-none" : "",
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-6 sm:px-0 pb-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Dữ liệu trực quan
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
            Tổng quan
          </h1>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-xl font-bold opacity-60 leading-relaxed">
            Hệ thống quản lý tài chính dòng họ thông minh & minh bạch.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm self-start md:self-auto">
          {[
            { id: "all", label: "Tất cả" },
            { id: "today", label: "Hôm nay" },
            { id: "year", label: `Năm ${new Date().getFullYear()}` },
          ].map((range) => (
            <Button
              key={range.id}
              variant={timeRange === range.id ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                timeRange === range.id
                  ? "bg-background shadow-xl shadow-foreground/5 border border-border/40"
                  : "hover:bg-muted/50 text-muted-foreground/60 hover:text-foreground",
              )}
              onClick={() => setTimeRange(range.id as "all" | "today" | "year")}
            >
              {range.label}
            </Button>
          ))}
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
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-8 pt-10 px-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Target className="w-5 h-5" />
                  </div>
                  Sự kiện & Dự toán
                </CardTitle>
                <CardDescription className="text-[13px] font-medium text-muted-foreground/70 ml-13">
                  Theo dõi chi tiêu thực tế so với ngân sách dự kiến.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-muted/50 transition-all group"
                onClick={() => navigate("/events")}
              >
                Tất cả sự kiện <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.recentEvents.map((event) => {
                const isOverBudget = event.actualSpending > event.budget;
                return (
                  <div key={event.id} className="space-y-4 group/item">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-black text-sm tracking-tight text-foreground line-clamp-1 group-hover/item:text-primary transition-colors">
                          {event.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(event.date || Date.now()), "dd/MM", { locale: vi })}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest tabular-nums",
                          isOverBudget
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {Math.round(event.progress)}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="relative h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
                        <div
                          className={cn(
                            "h-full transition-all duration-1000 ease-out shadow-sm",
                            isOverBudget ? "bg-rose-500" : "bg-primary",
                          )}
                          style={{ width: `${Math.min(100, event.progress)}%` }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                         <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-muted-foreground font-semibold">THỰC CHI</span>
                          <span className={cn("tabular-nums decoration-2 font-bold", isOverBudget ? "text-rose-600" : "text-foreground")}>
                            {event.actualSpending?.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-muted-foreground font-semibold">DỰ TOÁN</span>
                          <span className="text-muted-foreground tabular-nums font-bold">
                            {event.budget?.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                      onClick={() =>
                        navigate("/transactions", {
                          state: { eventId: event.id.toString() },
                        })
                      }
                    >
                      Chi tiết thu chi <TrendingUp className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 pt-10 px-8">
            <CardTitle className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Biến động thu chi</CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground">
              Dữ liệu tài chính theo từng tháng.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] px-4 pb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineChartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.2}
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
                      stopColor="#f43f5e"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="#f43f5e"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  name="income"
                  dataKey="income"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  name="expense"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 pt-10 px-8">
            <CardTitle className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Đóng góp & Chi nhánh</CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground">
              So sánh ngân sách giữa các đơn vị.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] px-4 pb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={branchData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)", radius: 10 }}
                  content={<CustomTooltip />}
                />
                <Bar
                  name="income"
                  dataKey="income"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
                <Bar
                  name="expense"
                  dataKey="expense"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-2 pt-10 px-8">
            <CardTitle className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Tỷ trọng đóng góp</CardTitle>
            <CardDescription className="text-xs font-semibold text-muted-foreground/60">
              Phân bổ nguồn thu theo chi nhánh.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-8 pb-10">
            <div className="h-[220px] w-full mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={branchData.filter((b) => b.income > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="income"
                    stroke="none"
                  >
                    {branchData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number | string | readonly (number | string)[] | undefined) => [
                      `${Number(Array.isArray(val) ? val[0] : (val || 0)).toLocaleString("vi-VN")} đ`,
                      "Đóng góp",
                    ]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold text-muted-foreground">Tổng thu</span>
                <span className="text-xl font-black tracking-tighter tabular-nums">
                  {data.totalIncome.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-8 w-full">
              {branchData
                .filter((b) => b.income > 0)
                .map((b, i) => (
                  <div key={b.name} className="flex items-center gap-2.5 group/legend">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform group-hover/legend:scale-125"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-[11px] font-bold text-muted-foreground/80 group-hover/legend:text-foreground transition-colors truncate">
                      {b.name}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-6 pt-10 px-8">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Giao dịch gần nhất</CardTitle>
              <CardDescription className="text-xs font-semibold text-muted-foreground/60">
                5 hoạt động tài chính mới nhất.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-muted/50 transition-all group h-9"
              onClick={() => navigate("/transactions")}
            >
              Xem tất cả <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20">
              {data.recentTransactions?.length > 0 ? (
                data.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-8 py-5 hover:bg-muted/30 transition-all group/tx cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-inner group-hover/tx:scale-110",
                          tx.type === "EXPENSE"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-emerald-500/10 text-emerald-600",
                        )}
                      >
                        {tx.type === "EXPENSE" ? (
                          <TrendingDown className="w-5 h-5" />
                        ) : (
                          <TrendingUp className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black tracking-tight text-foreground group-hover/tx:text-primary transition-colors">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground/70">
                          <span>
                            {format(new Date(tx.date), "dd MMMM, yyyy", { locale: vi })}
                          </span>
                          {tx.member && (
                            <>
                              <div className="w-1 h-1 rounded-full bg-border" />
                              <span className="bg-muted/50 px-2 py-0.5 rounded-lg border border-border/30">
                                {tx.member.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                       <span
                        className={cn(
                          "text-base font-black tracking-tighter tabular-nums",
                          tx.type === "EXPENSE"
                            ? "text-rose-600"
                            : "text-emerald-600",
                        )}
                      >
                        {tx.type === "EXPENSE" ? "-" : "+"}
                        {tx.amount.toLocaleString("vi-VN")}
                      </span>
                      <p className="text-[11px] font-black text-muted-foreground/40 leading-none">VNĐ</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                    <Receipt className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Chưa có giao dịch nào được ghi nhận.
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

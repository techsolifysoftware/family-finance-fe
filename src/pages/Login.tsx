import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { username, password });
      login(data.access_token, data.refresh_token, data.user);
      navigate("/");
    } catch (err: unknown) {
      let message = "Đăng nhập thất bại. Kiểm tra lại thông tin.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        message = (err as { response: { data: { message: string } } }).response
          .data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] p-4 transition-colors duration-500">
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-900/10 pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card className="border-none shadow-2xl shadow-primary/5 bg-background/80 backdrop-blur-xl ring-1 ring-border/50">
          <CardHeader className="space-y-4 pt-10 pb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center ring-4 ring-primary/5 transition-transform hover:scale-110 duration-500">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Hệ thống Quỹ họ
              </CardTitle>
              <CardDescription className="text-base font-medium">
                Bảo mật - Minh bạch - Gắn kết
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm font-semibold p-3.5 rounded-xl border border-destructive/20 animate-in shake duration-500">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Tên đăng nhập
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all font-medium"
                    placeholder="Nhập tên đăng nhập (admin)"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  dangerouslySetInnerHTML={{ __html: "Mật khẩu" }}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                />
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-95 group rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Đăng nhập ngay
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8 pt-2">
            <p className="text-xs text-center text-muted-foreground font-medium px-4">
              Vui lòng liên hệ quản trị viên nếu bạn quên thông tin truy cập.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/40 text-sm font-semibold tracking-tighter uppercase">
          <div className="h-px w-8 bg-current" />
          <span>Family Clan Management System v2.0</span>
          <div className="h-px w-8 bg-current" />
        </div>
      </div>
    </div>
  );
}

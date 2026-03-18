import type { LucideIcon } from "lucide-react";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings as SettingsIcon,
  Target,
  UserCog,
  Users,
  X,
} from "lucide-react";
import React from "react";
import {
  Link,
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { cn } from "./lib/utils";
import Branches from "./pages/Branches";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import UsersPage from "./pages/Users";

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  to: string;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out flex-shrink-0",
        isActive
          ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5 active:scale-[0.98]"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]",
      )}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[2px_0_8px_rgba(var(--primary),0.4)]" />
      )}

      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-300",
          isActive
            ? "bg-primary text-white"
            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600",
        )}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>

      <span className="text-sm tracking-tight">{label}</span>

      {!isActive && (
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
      )}
    </Link>
  );
};

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navItems = [
    { path: "/", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/events", label: "Sự kiện & Dự toán", icon: Target },
    { path: "/transactions", label: "Quản lý thu chi", icon: Receipt },
    { path: "/members", label: "Thành viên", icon: Users },
  ];

  if (isAdmin) {
    navItems.push({ path: "/branches", label: "Quản lý Chi", icon: Building2 });
    navItems.push({ path: "/users", label: "Người dùng", icon: UserCog });
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-all duration-500 ease-in-out md:relative md:translate-x-0 leading-relaxed",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Branding Area */}
        <div className="flex items-center justify-between h-20 px-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-4 ring-primary/5">
              <Receipt className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">
                Gia Tộc
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none -mt-0.5">
                Quản lý chi tiêu
              </span>
            </div>
          </div>
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-hide">
          <div className="space-y-1.5">
            <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
              Menu chính
            </span>
            {navItems.map((item) => (
              <SidebarItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
                Hệ thống
              </span>
              {isAuthenticated && (
                <SidebarItem
                  to="/settings"
                  icon={SettingsIcon}
                  label="Cài đặt hệ thống"
                  onClick={() => setIsOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm md:hidden transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-4 md:px-8 shrink-0 justify-between">
          <button
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-gray-900">
                      {user?.name}
                    </span>
                    <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                </div>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group"
                  title="Đăng xuất"
                >
                  <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm shadow-sm"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

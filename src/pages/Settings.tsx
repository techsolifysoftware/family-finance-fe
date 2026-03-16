import { ChangePasswordModal } from "@/components/settings/ChangePasswordModal";
import type { Branch, Event, Member, Transaction } from "@/types";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import {
  ChevronRight,
  Download,
  Globe,
  Key,
  LogOut,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  badge?: string;
  onClick: () => void;
  danger?: boolean;
}

const SettingItem = ({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  danger,
}: SettingItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-2 rounded-xl flex items-center justify-center ${danger ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-600"}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-left">
        <h4
          className={`font-medium ${danger ? "text-rose-600" : "text-gray-900"}`}
        >
          {title}
        </h4>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {badge && (
        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
          {badge}
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </div>
  </button>
);

export default function Settings() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/branches");
        setBranches(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBranches();
  }, []);

  const handleExportFullData = async () => {
    if (
      !window.confirm(
        "Bạn có muốn xuất toàn bộ dữ liệu hệ thống ra file Excel không?",
      )
    )
      return;
    setIsExporting(true);
    try {
      const [txRes, membersRes, eventsRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/members"),
        api.get("/events"),
      ]);

      const workbook = XLSX.utils.book_new();

      // Sheet Sổ Quỹ (Transactions)
      const txData = txRes.data.map((tx: Transaction) => ({
        "ID Giao Dịch": tx.id,
        Loại: tx.type === "INCOME" ? "Thu" : "Chi",
        "Nội Dung": tx.description,
        "Số Tiền (VNĐ)": tx.amount,
        Ngày: format(new Date(tx.date), "dd/MM/yyyy HH:mm"),
        "Liên Quan Đến": tx.member
          ? tx.member.name
          : tx.branch?.name || "Không xác định",
        "Sự Kiện": tx.event?.name || "",
      }));
      const txSheet = XLSX.utils.json_to_sheet(txData);
      XLSX.utils.book_append_sheet(workbook, txSheet, "ThuChi");

      // Sheet Thành Viên
      const mdData = membersRes.data.map((m: Member) => ({
        "Mã TV": m.id,
        "Họ & Tên": m.name,
        "Thuộc Chi": m.branch?.name || "Chung",
      }));
      const mSheet = XLSX.utils.json_to_sheet(mdData);
      XLSX.utils.book_append_sheet(workbook, mSheet, "ThanhVien");

      // Sheet Sự Kiện
      const evData = eventsRes.data.map((ev: Event) => ({
        "Mã SK": ev.id,
        "Tên Sự Kiện": ev.name,
        Ngày: format(new Date(ev.date), "dd/MM/yyyy"),
        "Dự Toán (VNĐ)": ev.budget,
      }));
      const evSheet = XLSX.utils.json_to_sheet(evData);
      XLSX.utils.book_append_sheet(workbook, evSheet, "SuKien");

      // Sheet Chi Nhánh
      const brData = branches.map((br: Branch) => ({
        "Mã Chi": br.id,
        "Tên Chi": br.name,
        "Diễn Giải": br.description || "",
      }));
      const brSheet = XLSX.utils.json_to_sheet(brData);
      XLSX.utils.book_append_sheet(workbook, brSheet, "ChiNhanh");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const dataBlob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(
        dataBlob,
        `GiaPha_Finance_Backup_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`,
      );
      toast.success("Xuất dữ liệu thành công!");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi khi tải dữ liệu!");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-500 mt-1">
          Quản lý tài khoản và dữ liệu hệ thống
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-primary-100">
          <div className="p-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {user?.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary-700 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                @{user?.username} • Thành viên hệ thống
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() =>
                    toast.info("Liên hệ Admin để đổi thông tin cá nhân.")
                  }
                  className="px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-xl text-sm border border-gray-100 hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Sửa hồ sơ
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-50 text-rose-600 font-medium rounded-xl text-sm border border-rose-100 hover:bg-rose-100 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Security */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-500" />
              Bảo mật tài khoản
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            <SettingItem
              icon={Key}
              title="Đổi mật khẩu"
              description="Thay đổi mật khẩu đăng nhập của bạn"
              onClick={() => setShowChangePassword(true)}
            />
          </div>
        </section>

        {/* Data Management */}
        {isAdmin && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                Quản lý Dữ liệu Hệ thống (Admin)
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              <SettingItem
                icon={Download}
                title={
                  isExporting
                    ? "Đang xử lý..."
                    : "Sao lưu & Xuất toàn bộ dữ liệu"
                }
                description="Tải xuống tệp Excel chứa toàn bộ dữ liệu dòng họ"
                onClick={handleExportFullData}
              />
              <SettingItem
                icon={Trash2}
                danger={true}
                title="Dọn dẹp hệ thống"
                description="Tính năng này cho phép dọn dẹp các dữ liệu cũ (Tạm khóa)"
                onClick={() =>
                  toast.info(
                    "Vui lòng liên hệ bộ phận kỹ thuật để dọn dẹp dữ liệu lớn.",
                  )
                }
              />
            </div>
          </section>
        )}

        {/* Application Info */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Thông tin ứng dụng
            </h3>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-gray-500">Phiên bản</span>
              <span className="font-medium text-gray-900">2.1.0-secure</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-gray-500">Hệ thống</span>
              <span className="font-medium text-gray-900">
                Quản lý chi tiêu dòng họ v2026
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 text-center">
              <p className="text-xs text-gray-400">
                © 2026 Dòng Họ - Bảo lưu mọi quyền.
              </p>
            </div>
          </div>
        </section>
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}

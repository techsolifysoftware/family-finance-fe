import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import type { Branch, Event, Member, Transaction } from "@/types";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { Download, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function Transactions() {
  const { canManageTransactions } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
  });

  const [formData, setFormData] = useState({
    type: "INCOME",
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    memberId: "none",
    branchId: "none",
    eventId: "none",
    paymentRoundId: "none",
  });

  const [filters, setFilters] = useState({
    branchId: "ALL",
    startDate: "",
    endDate: "",
    search: "",
    eventId: "ALL",
    paymentRoundId: "ALL",
    page: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      interface QueryParams {
        branchId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        eventId?: string | number;
        paymentRoundId?: string | number;
        page?: number;
      }
      const qParams: QueryParams = { ...filters };
      if (qParams.eventId === "ALL") delete qParams.eventId;
      if (qParams.paymentRoundId === "ALL") delete qParams.paymentRoundId;

      const [txRes, memRes, evRes, brRes] = await Promise.all([
        api.get("/transactions", { params: qParams }),
        api.get("/members", { params: { page: 1, limit: 1000 } }),
        api.get("/events"),
        api.get("/branches"),
      ]);
      setTransactions(txRes.data?.data || []);
      setPagination(txRes.data?.meta || { total: 0, page: 1, lastPage: 1 });
      setMembers(memRes.data?.data || []);
      setEvents(evRes.data?.data || []);
      setBranches(brRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.eventId) {
      setFilters((prev) => ({
        ...prev,
        eventId: location.state.eventId,
        page: 1,
      }));
      // Clear state to avoid re-filtering on refresh or subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      type: "INCOME",
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      memberId: "none",
      branchId: "none",
      eventId: "none",
      paymentRoundId: "none",
    });
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setFormData({
      type: tx.type,
      amount: tx.amount.toLocaleString("vi-VN"),
      description: tx.description,
      date: format(new Date(tx.date), "yyyy-MM-dd"),
      memberId: tx.memberId?.toString() || "none",
      branchId: tx.branchId?.toString() || "none",
      eventId: tx.eventId?.toString() || "none",
      paymentRoundId: tx.paymentRoundId?.toString() || "none",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success("Đã xóa giao dịch thành công");
        fetchData();
      } catch {
        toast.error("Lỗi khi xóa giao dịch");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || formData.memberId === "none") {
      toast.error("Vui lòng chọn người đóng/chi");
      return;
    }
    if (!formData.eventId || formData.eventId === "none") {
      toast.error("Vui lòng chọn liên kết sự kiện");
      return;
    }

    const selectedEvent = events.find(e => e.id.toString() === formData.eventId);
    const showRounds = formData.type === "INCOME" && selectedEvent && selectedEvent.rounds && selectedEvent.rounds.length > 0;
    
    if (showRounds && (!formData.paymentRoundId || formData.paymentRoundId === "none")) {
      toast.error("Vui lòng chọn đợt đóng");
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount.replace(/\./g, "").replace(/,/g, "")),
      memberId: parseInt(formData.memberId),
      branchId:
        formData.branchId && formData.branchId !== "none"
          ? parseInt(formData.branchId)
          : null,
      eventId: parseInt(formData.eventId),
      paymentRoundId:
        formData.paymentRoundId && formData.paymentRoundId !== "none"
          ? parseInt(formData.paymentRoundId)
          : null,
    };

    try {
      if (editingId) {
        await api.patch(`/transactions/${editingId}`, payload);
        toast.success("Đã cập nhật giao dịch");
      } else {
        await api.post("/transactions", payload);
        toast.success("Đã thêm giao dịch mới");
      }
      closeModal();
      fetchData();
    } catch {
      toast.error("Lỗi khi lưu giao dịch");
    }
  };

  const exportToExcel = () => {
    const exportData = transactions.map((tx: Transaction) => ({
      Mã: tx.id,
      Loại: tx.type === "INCOME" ? "Thu" : "Chi",
      "Nội dung": tx.description || "-",
      "Số Tiền (₫)": tx.amount,
      "Người thực hiện": tx.member ? tx.member.name : "Hệ thống",
      "Chi nhánh": tx.branch?.name || "N/A",
      "Sự kiện": tx.event?.name || "-",
      Ngày: format(new Date(tx.date), "dd/MM/yyyy"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Bao_cao_thu_chi_${format(new Date(), "yyyyMMdd")}.xlsx`);
    toast.success("Đã xuất file Excel thành công");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
            Sổ thu chi
          </h1>
          <p className="text-sm font-bold text-muted-foreground/60 mt-1">
            Quản lý dòng tiền và các đóng góp của thành viên.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="h-12 px-6 rounded-2xl bg-background/50 backdrop-blur-sm border-border/40 font-bold hover:bg-muted/50 transition-all shadow-sm"
          >
            <Download className="w-5 h-5 mr-2 opacity-70" /> Xuất Excel
          </Button>
          {canManageTransactions && (
            <Button
              onClick={() => setShowModal(true)}
              className="h-12 px-8 rounded-2xl font-black tracking-tight shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Thêm giao dịch
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        <TransactionFilters
          search={filters.search}
          onSearchChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
          branchId={filters.branchId}
          onBranchChange={(val) => setFilters({ ...filters, branchId: val, page: 1 })}
          branches={branches}
          eventId={filters.eventId.toString()}
          onEventChange={(val) => setFilters({ ...filters, eventId: val, paymentRoundId: "ALL", page: 1 })}
          events={events}
          paymentRoundId={filters.paymentRoundId.toString()}
          onRoundChange={(val) => setFilters({ ...filters, paymentRoundId: val, page: 1 })}
        />
        <CardContent className="p-0">
          <TransactionTable
            transactions={transactions}
            loading={loading && transactions.length === 0}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canManage={canManageTransactions}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-sm text-muted-foreground">
          Hiển thị <span className="font-bold text-foreground">{transactions.length}</span> trên <span className="font-bold text-foreground">{pagination.total}</span> giao dịch
        </p>
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.lastPage}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      </div>

      <TransactionFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        members={members}
        events={events}
      />
    </div>
  );
}

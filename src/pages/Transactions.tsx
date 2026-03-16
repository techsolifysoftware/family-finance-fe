import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Branch, Event, Member, Transaction } from "@/types";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
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

  const [formData, setFormData] = useState({
    type: "INCOME",
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    memberId: "none",
    branchId: "none",
    eventId: "none",
  });

  const [filters, setFilters] = useState({
    branchId: "ALL",
    startDate: "",
    endDate: "",
    search: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, memRes, evRes, brRes] = await Promise.all([
        api.get("/transactions", { params: filters }),
        api.get("/members"),
        api.get("/events"),
        api.get("/branches"),
      ]);
      setTransactions(txRes.data);
      setMembers(memRes.data);
      setEvents(evRes.data);
      setBranches(brRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount.replace(/\./g, "").replace(/,/g, "")),
      memberId:
        formData.memberId && formData.memberId !== "none"
          ? parseInt(formData.memberId)
          : null,
      branchId:
        formData.branchId && formData.branchId !== "none"
          ? parseInt(formData.branchId)
          : null,
      eventId:
        formData.eventId && formData.eventId !== "none"
          ? parseInt(formData.eventId)
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
      "Nội dung": tx.description,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sổ thu chi</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý dòng tiền và các đóng góp của thành viên.
          </p>
        </div>
        {canManageTransactions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
            <Button onClick={() => setShowModal(true)} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Thêm giao dịch
            </Button>
          </div>
        )}
        {!canManageTransactions && (
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" /> Xuất Excel
          </Button>
        )}
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <TransactionFilters
          search={filters.search}
          onSearchChange={(val) => setFilters({ ...filters, search: val })}
          branchId={filters.branchId}
          onBranchChange={(val) => setFilters({ ...filters, branchId: val })}
          branches={branches}
        />
        <CardContent className="p-0">
          <TransactionTable
            transactions={transactions}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canManage={canManageTransactions}
          />
        </CardContent>
      </Card>

      <TransactionFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        members={members}
        branches={branches}
        events={events}
      />
    </div>
  );
}

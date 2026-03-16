import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardHeader } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import type { Branch } from "@/types";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  branchId: string;
  onBranchChange: (value: string) => void;
  branches: Branch[];
}

export function TransactionFilters({
  search,
  onSearchChange,
  branchId,
  onBranchChange,
  branches,
}: TransactionFiltersProps) {
  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nội dung..."
            className="pl-10 h-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={branchId} onValueChange={onBranchChange}>
            <SelectTrigger className="w-[180px] h-10">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Theo chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chi nhánh</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
  );
}

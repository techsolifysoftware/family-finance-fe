import * as React from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  onSearch?: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Chọn một mục...",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy kết quả.",
  loading = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 rounded-2xl bg-muted/20 border-border/40 hover:bg-muted/30 hover:border-border/60 transition-all font-medium text-left px-4",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[1.5rem] mt-2 shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl overflow-hidden" align="start">
        <div className="flex flex-col max-h-[300px]">
          <div className="flex items-center border-b px-3 h-10 shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              className="border-0 focus-visible:ring-0 px-0 h-9"
              value={searchValue}
              onChange={handleSearchChange}
              autoFocus
            />
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />}
          </div>
          <div className="flex-1 overflow-y-auto">
            {options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              <div className="p-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-all text-left",
                      value === option.value && "bg-primary/5 text-primary"
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearchValue("");
                      if (onSearch) onSearch("");
                    }}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold truncate text-foreground/90 group-hover:text-primary">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-[10px] text-muted-foreground/60 truncate font-medium mt-0.5">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {value === option.value && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

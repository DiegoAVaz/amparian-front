import { Search, X } from "lucide-react";

import { cn } from "./variants";
import { TextInput, type TextInputProps } from "./text-input";

export type SearchInputProps = Omit<
  TextInputProps,
  "leftIcon" | "rightIcon" | "type"
> & {
  clearLabel?: string;
  onClear?: () => void;
  wrapperClassName?: string;
};

export function SearchInput({
  clearLabel = "Limpar busca",
  className,
  onClear,
  value,
  wrapperClassName,
  ...props
}: SearchInputProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <span className={cn("relative block w-full", wrapperClassName)}>
      <TextInput
        className={cn(onClear && hasValue && "pr-10", className)}
        leftIcon={<Search size={16} strokeWidth={2} aria-hidden="true" />}
        type="text"
        value={value}
        {...props}
      />
      {onClear && hasValue ? (
        <button
          aria-label={clearLabel}
          className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-400 hover:bg-transparent hover:text-gray-500"
          onClick={onClear}
          type="button"
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

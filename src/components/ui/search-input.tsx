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
        leftIcon={<SearchIcon />}
        type="search"
        value={value}
        {...props}
      />
      {onClear && hasValue ? (
        <button
          aria-label={clearLabel}
          className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          onClick={onClear}
          type="button"
        >
          <XIcon />
        </button>
      ) : null}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

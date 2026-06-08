import type { ReactNode } from "react";

import { FieldError } from "./field-error";
import { cn, tv, type VariantProps } from "./variants";

const checkboxGroupStyles = tv({
  slots: {
    base: "flex flex-col gap-2",
    options: "flex flex-wrap gap-x-4 gap-y-2",
    option: "flex items-center gap-1.5 text-xs text-gray-600",
    input: "h-4 w-4 shrink-0 accent-brand-teal disabled:cursor-not-allowed disabled:opacity-60",
  },
  variants: {
    orientation: {
      horizontal: {
        options: "flex-row",
      },
      vertical: {
        options: "flex-col",
      },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type CheckboxGroupOption = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type CheckboxGroupProps = VariantProps<typeof checkboxGroupStyles> & {
  className?: string;
  disabled?: boolean;
  error?: ReactNode;
  helperText?: ReactNode;
  legend?: ReactNode;
  name?: string;
  onChange: (values: string[]) => void;
  optionClassName?: string;
  options: CheckboxGroupOption[];
  values: string[];
};

export function CheckboxGroup({
  className,
  disabled,
  error,
  helperText,
  legend,
  name,
  onChange,
  optionClassName,
  options,
  orientation,
  values,
}: CheckboxGroupProps) {
  const styles = checkboxGroupStyles({ orientation });

  function toggleValue(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  }

  return (
    <fieldset className={cn(styles.base(), className)}>
      {legend ? <legend className="text-xs font-medium text-gray-600">{legend}</legend> : null}
      <div className={styles.options()}>
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label key={option.value} className={cn(styles.option(), optionClassName)}>
              <input
                checked={checked}
                className={styles.input()}
                disabled={disabled || option.disabled}
                name={name}
                onChange={() => toggleValue(option.value)}
                type="checkbox"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {helperText && !error ? <p className="text-xs text-gray-500">{helperText}</p> : null}
      <FieldError>{error}</FieldError>
    </fieldset>
  );
}

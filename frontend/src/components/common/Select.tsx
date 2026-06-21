import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

const NONE_VALUE = "__none__";

interface SelectProps {
  label?: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled,
}: SelectProps) {
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");
  const radixValue = value === "" ? NONE_VALUE : value;

  function handleChange(v: string) {
    onChange(v === NONE_VALUE ? "" : v);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold text-muted uppercase tracking-wider"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
      <RadixSelect.Root
        value={radixValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          id={inputId}
          aria-label={label}
          className="flex items-center justify-between gap-2 w-full px-3 py-2.25 bg-white/4 border border-border rounded-sm text-text text-base font-[inherit] cursor-pointer outline-none transition-[border-color,background] text-left leading-normal hover:enabled:border-muted hover:enabled:bg-white/6 focus-visible:border-primary focus-visible:shadow-[0_0_0_2px_rgba(0,229,168,0.15)] disabled:opacity-45 disabled:cursor-not-allowed data-placeholder:text-muted"
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown
              className="text-muted shrink-0 transition-transform duration-200 in-data-[state=open]:rotate-180"
              size={14}
            />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="bg-card-alt border border-border border-t-[rgba(255,255,255,0.08)] rounded-sm shadow-lg overflow-hidden z-150 min-w-(--radix-select-trigger-width) max-h-65 animate-select-down"
            position="popper"
            sideOffset={6}
            avoidCollisions
          >
            <RadixSelect.Viewport className="p-1">
              {placeholder && (
                <RadixSelect.Item
                  value={NONE_VALUE}
                  className="flex items-center gap-2 px-2.5 py-2 text-base text-text rounded-xs cursor-pointer outline-none transition-[background,color] select-none data-highlighted:bg-white/7 data-[state=checked]:text-primary"
                >
                  <RadixSelect.ItemText>{placeholder}</RadixSelect.ItemText>
                </RadixSelect.Item>
              )}
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt}
                  value={opt}
                  className="flex items-center gap-2 px-2.5 py-2 text-base text-text rounded-xs cursor-pointer outline-none transition-[background,color] select-none data-highlighted:bg-white/7 data-[state=checked]:text-primary"
                >
                  <RadixSelect.ItemText>{opt}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="ml-auto text-primary">
                    <Check size={12} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}

import clsx from 'clsx';

interface MultiSelectProps {
  label?: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}

export default function MultiSelect({ label, options, value, onChange, disabled }: MultiSelectProps) {
  function toggle(opt: string) {
    if (disabled) return;
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold text-muted uppercase tracking-[0.06em]">{label}</label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={clsx(
              'px-3 py-1.25 rounded-full border border-border bg-transparent text-muted text-sm font-[inherit] font-medium cursor-pointer transition-all leading-[1.4]',
              'hover:enabled:border-primary hover:enabled:text-primary hover:enabled:bg-primary-dim',
              'disabled:opacity-45 disabled:cursor-not-allowed',
              value.includes(opt) && 'border-primary! bg-primary-dim! text-primary! font-semibold!',
            )}
            onClick={() => toggle(opt)}
            disabled={disabled}
          >
            {opt}
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.25 mt-1">
          {value.map((v) => (
            <span key={v} className="inline-flex items-center gap-1.25 px-2.5 py-0.75 rounded-full bg-primary-dim border border-[rgba(0,229,168,0.2)] text-primary text-xs font-semibold">
              {v}
              {!disabled && (
                <button
                  type="button"
                  className="bg-transparent border-none text-inherit text-base leading-none cursor-pointer p-0 opacity-70 transition-opacity hover:opacity-100"
                  onClick={() => toggle(v)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

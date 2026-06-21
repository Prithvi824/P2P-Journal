import { useState, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showToggle?: boolean;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  showToggle,
  type,
  ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

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
      <div className={isPassword && showToggle ? "relative" : undefined}>
        <input
          id={inputId}
          type={isPassword && visible ? "text" : type}
          className={clsx(
            "bg-white/3.5 border border-border rounded-sm text-text px-3 py-2.25 text-base w-full outline-none tabular-nums",
            "transition-[border-color,box-shadow,background] duration-[0.18s]",
            "placeholder:text-muted placeholder:opacity-70",
            "hover:border-muted/60 hover:bg-white/5",
            "focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,229,168,0.1)] focus:bg-white/5",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            isPassword && showToggle && "pr-14.5",
            error &&
              "border-danger! focus:shadow-[0_0_0_3px_rgba(255,77,77,0.12)]!",
            className,
          )}
          {...rest}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-muted text-[10px] font-bold cursor-pointer px-1 py-0.5 uppercase tracking-[0.06em] transition-colors rounded-0.75 hover:text-text"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

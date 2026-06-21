interface SpinnerProps { size?: number }

export default function Spinner({ size = 32 }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center p-6">
      <div
        className="rounded-full border-[3px] border-border border-t-primary animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

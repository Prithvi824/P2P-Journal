import * as RadixDialog from '@radix-ui/react-dialog';
import Button from './Button';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: Props) {
  return (
    <RadixDialog.Root open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-[rgba(5,10,22,0.75)] backdrop-blur-[6px] z-200 animate-overlay-show" />
        <RadixDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-201 w-[min(440px,calc(100vw-32px))] bg-card border border-border border-t-[rgba(255,255,255,0.08)] rounded-lg shadow-lg shadow-black/60 p-7 animate-content-show outline-none"
          onEscapeKeyDown={onCancel}
        >
          <RadixDialog.Title className="text-[17px] font-bold text-text mb-2.5 tracking-[-0.02em]">
            {title}
          </RadixDialog.Title>
          <RadixDialog.Description className="text-base text-text-dim leading-[1.6] mb-6">
            {message}
          </RadixDialog.Description>
          <div className="flex gap-2.5 justify-end">
            <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

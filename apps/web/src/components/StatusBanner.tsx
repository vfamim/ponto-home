interface StatusBannerProps {
  message: string;
  type: 'success' | 'error' | 'warning';
}

const COLORS = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
};

export function StatusBanner({ message, type }: StatusBannerProps) {
  return (
    <div className={`border px-4 py-3 rounded ${COLORS[type]}`}>
      {message}
    </div>
  );
}

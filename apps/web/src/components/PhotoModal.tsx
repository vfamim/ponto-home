interface PhotoModalProps {
  url: string;
  onClose: () => void;
}

export function PhotoModal({ url, onClose }: PhotoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div className="relative max-w-lg max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={url}
          alt="Selfie do registro"
          className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-gray-800 hover:bg-white text-lg font-bold"
        >
          x
        </button>
      </div>
    </div>
  );
}

import { BrowserQRCodeReader } from "@zxing/browser";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

type CheckinResponse = {
  message: string;
  person?: { id: string; name: string };
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000"
});

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<string>("Aguardando leitura do QR...");
  const [lastPerson, setLastPerson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    const codeReader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 400 });

    const start = async () => {
      setError(null);
      try {
        const result = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          async (decoded) => {
            if (decoded) {
              setIsScanning(false);
              await handleToken(decoded.getText());
              codeReader.reset();
              setTimeout(() => setIsScanning(true), 800);
            }
          }
        );
        return result;
      } catch (err) {
        setError("Não foi possível acessar a câmera. Permita o uso da câmera e recarregue.");
        setIsScanning(false);
      }
    };

    start();

    return () => {
      codeReader.reset();
    };
  }, []);

  const handleToken = async (token: string, type: string = "ENTRY") => {
    setStatus("Registrando batida...");
    setError(null);
    try {
      const resp = await api.post<CheckinResponse>("/api/checkins", {
        token,
        type,
        userAgent: navigator.userAgent
      });
      setStatus(resp.data.message);
      setLastPerson(resp.data.person?.name ?? null);
    } catch (err) {
      setStatus("Falha ao registrar");
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Erro ao comunicar com API");
      } else {
        setError("Erro inesperado");
      }
    }
  };

  const handleManualSubmit = async () => {
    if (!manualToken) return;
    await handleToken(manualToken.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink to-sand text-sand">
      <header className="mx-auto max-w-4xl px-6 py-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-mint/80">Ponto QR</p>
          <h1 className="text-3xl font-bold">Registro rápido via QR code</h1>
          <p className="text-sm text-sand/80">
            Aponte a câmera para o QR da pessoa e o ponto é registrado no servidor.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-2">
          <section className="card rounded-2xl bg-white/95 p-6 text-ink">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Leitor de QR</h2>
              <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-medium text-ink">
                {isScanning ? "Escaneando..." : "Pausado"}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <video
                ref={videoRef}
                className="h-72 w-full object-cover"
                muted
                autoPlay
                playsInline
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Permita a câmera do navegador. O horário é sempre calculado pelo servidor.
            </p>
          </section>

          <section className="card rounded-2xl bg-white/95 p-6 text-ink">
            <h2 className="text-xl font-semibold">Estado do registro</h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-lg font-semibold text-ink">{status}</p>
              {lastPerson && (
                <p className="mt-1 text-sm text-slate-700">Última pessoa: {lastPerson}</p>
              )}
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700">Fallback: token manual</h3>
              <div className="mt-2 flex flex-col gap-3">
                <input
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Cole o token do QR"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-mint focus:outline-none"
                />
                <button
                  onClick={handleManualSubmit}
                  className="w-full rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 active:scale-[0.99]"
                >
                  Registrar manualmente
                </button>
                <p className="text-xs text-slate-600">
                  Use este campo se a câmera falhar. Tokens são válidos enquanto o QR não for
                  rotacionado.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

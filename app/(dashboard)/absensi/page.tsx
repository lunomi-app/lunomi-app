'use client';
import { useState, useRef, useEffect } from 'react';
import { STAFF } from '@/lib/data/store';
import { askAI } from '@/app/_components/AIAssistant';

type AbsenRecord = { id: number; nama: string; waktu: string; tipe: 'MASUK' | 'PULANG'; foto: string | null };

const INIT_RECORDS: AbsenRecord[] = [
  { id: 1, nama: 'Wenny Rahayu', waktu: '08:02', tipe: 'MASUK', foto: null },
  { id: 2, nama: 'Budi Prasetyo', waktu: '08:10', tipe: 'MASUK', foto: null },
  { id: 3, nama: 'Eva Kurniasih', waktu: '08:25', tipe: 'MASUK', foto: null },
  { id: 4, nama: 'LUTPI Santoso', waktu: '08:31', tipe: 'MASUK', foto: null },
];

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono">{time}</span>;
}

export default function AbsensiPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [records, setRecords] = useState<AbsenRecord[]>(INIT_RECORDS);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [msg, setMsg] = useState('');
  const [cameraError, setCameraError] = useState('');

  // FIX: assign srcObject via effect so video element is guaranteed to be mounted
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => () => { stream?.getTracks().forEach(t => t.stop()); }, [stream]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s);
      setCameraOn(true);
      setFoto(null);
    } catch (e: any) {
      const msg = e?.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Klik ikon kunci di address bar dan izinkan kamera.'
        : e?.name === 'NotFoundError'
        ? 'Kamera tidak ditemukan di perangkat ini.'
        : 'Tidak dapat membuka kamera. Coba refresh halaman.';
      setCameraError(msg);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOn(false);
    setFoto(null);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setFoto(canvas.toDataURL('image/jpeg', 0.85));
  };

  const absen = (tipe: 'MASUK' | 'PULANG') => {
    if (!selectedStaff) { setMsg('Pilih nama karyawan terlebih dahulu.'); return; }
    if (!foto) { setMsg('Ambil foto selfie terlebih dahulu.'); return; }
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setRecords(prev => [{ id: Date.now(), nama: selectedStaff, waktu: now, tipe, foto }, ...prev]);
    setMsg(`✓ Absen ${tipe === 'MASUK' ? 'masuk' : 'pulang'} berhasil — ${selectedStaff} pukul ${now}`);
    setFoto(null);
    stopCamera();
    setSelectedStaff('');
  };

  const activeStaff = STAFF.filter(s => s.status === 'Aktif');

  return (
    <div className="p-5 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Absensi Karyawan</h1>
          <p className="text-xs text-gray-500 mt-0.5">Jumat, 18 April 2026 · <Clock /></p>
        </div>
        <button onClick={() => askAI('Analisis pola absensi karyawan dan berikan rekomendasi kebijakan kehadiran')}
          className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
          Tanya AI
        </button>
      </div>

      {/* Selfie Card */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-sm font-semibold">Absen dengan Selfie</p>

        {/* Staff selector */}
        <select
          value={selectedStaff}
          onChange={e => setSelectedStaff(e.target.value)}
          className="w-full bg-[#071220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#0d8a6a] cursor-pointer"
        >
          <option value="">-- Pilih nama karyawan --</option>
          {activeStaff.map(s => (
            <option key={s.id} value={s.nama} className="bg-[#0d2137]">{s.nama} ({s.role})</option>
          ))}
        </select>

        {/* Camera preview — always in DOM so ref is always valid */}
        <div className="relative bg-[#071220] rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: 280 }}>
          {/* Placeholder */}
          {!cameraOn && !foto && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-5xl">📷</div>
              <p className="text-xs text-gray-500">Klik "Buka Kamera" untuk selfie</p>
            </div>
          )}

          {/* Video element — always mounted, visibility controlled via CSS */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: cameraOn && !foto ? 'block' : 'none' }}
          />

          {/* Captured photo */}
          {foto && (
            <img src={foto} alt="selfie" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Camera on indicator */}
          {cameraOn && !foto && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white">LIVE</span>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Camera error */}
        {cameraError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
            ⚠ {cameraError}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {!cameraOn ? (
            <button onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d2137] border border-[#0d8a6a] text-[#0d8a6a] rounded-lg text-xs font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Buka Kamera
            </button>
          ) : (
            <>
              {!foto ? (
                <button onClick={capture}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.94 13.45A9 9 0 1110.55 3.06" />
                  </svg>
                  Ambil Foto
                </button>
              ) : (
                <button onClick={() => { setFoto(null); }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                  🔄 Ulangi Foto
                </button>
              )}
              <button onClick={stopCamera}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500 hover:text-white transition-colors">
                Tutup Kamera
              </button>
            </>
          )}

          {foto && (
            <div className="flex gap-2 ml-auto">
              <button onClick={() => absen('MASUK')}
                className="px-5 py-2 bg-[#0d8a6a] rounded-lg text-xs text-white font-bold hover:bg-[#0a7059] transition-colors">
                ✓ Absen Masuk
              </button>
              <button onClick={() => absen('PULANG')}
                className="px-5 py-2 bg-blue-600 rounded-lg text-xs text-white font-bold hover:bg-blue-700 transition-colors">
                ✓ Absen Pulang
              </button>
            </div>
          )}
        </div>

        {msg && (
          <p className={`text-xs px-3 py-2 rounded-lg ${msg.startsWith('✓') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'}`}>
            {msg}
          </p>
        )}
      </div>

      {/* Riwayat */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold">Riwayat Absensi Hari Ini</p>
          <span className="text-xs bg-[#071220] px-2 py-0.5 rounded-full text-gray-400">{records.length} catatan</span>
        </div>
        <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
          {records.map(r => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3">
              {r.foto ? (
                <img src={r.foto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-xs font-bold text-[#0d8a6a] flex-shrink-0">
                  {r.nama[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{r.nama}</p>
                <p className="text-[10px] text-gray-500">{r.waktu} WIB</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${r.tipe === 'MASUK' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'}`}>
                {r.tipe}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

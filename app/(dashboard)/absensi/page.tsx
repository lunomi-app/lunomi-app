'use client';
import { useState, useRef, useEffect } from 'react';

type AbsenRecord = {
  id: number; nama: string; waktu: string; tipe: 'MASUK' | 'PULANG'; foto: string | null;
};

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
  return <span>{time}</span>;
}

export default function AbsensiPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [records, setRecords] = useState<AbsenRecord[]>(INIT_RECORDS);
  const [nama, setNama] = useState('');
  const [msg, setMsg] = useState('');

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      setCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setMsg('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
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
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setFoto(canvas.toDataURL('image/jpeg', 0.8));
  };

  const absen = (tipe: 'MASUK' | 'PULANG') => {
    if (!nama.trim()) { setMsg('Masukkan nama terlebih dahulu.'); return; }
    if (!foto) { setMsg('Ambil foto selfie terlebih dahulu.'); return; }
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setRecords(prev => [...prev, { id: Date.now(), nama: nama.trim(), waktu: now, tipe, foto }]);
    setMsg(`✓ Absen ${tipe === 'MASUK' ? 'masuk' : 'pulang'} berhasil — ${nama} jam ${now}`);
    setFoto(null);
    stopCamera();
  };

  useEffect(() => () => { stream?.getTracks().forEach(t => t.stop()); }, [stream]);

  return (
    <div className="p-5 space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Absensi</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Jumat, 18 April 2026 · <Clock />
        </p>
      </div>

      {/* Selfie Card */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl p-5 space-y-4">
        <p className="text-sm font-semibold">Absen dengan Selfie</p>

        <input
          value={nama}
          onChange={e => setNama(e.target.value)}
          placeholder="Nama karyawan..."
          className="w-full bg-[#071220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#0d8a6a]"
        />

        {/* Camera area */}
        <div className="relative bg-[#071220] rounded-xl overflow-hidden aspect-video max-h-60 flex items-center justify-center">
          {!cameraOn && !foto && (
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-xs text-gray-500">Klik "Buka Kamera" untuk memulai</p>
            </div>
          )}
          {cameraOn && !foto && (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
          {foto && (
            <img src={foto} alt="selfie" className="w-full h-full object-cover" />
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex items-center gap-2 flex-wrap">
          {!cameraOn ? (
            <button onClick={startCamera}
              className="px-4 py-2 bg-[#0d2137] border border-[#0d8a6a] text-[#0d8a6a] rounded-lg text-xs font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors">
              📷 Buka Kamera
            </button>
          ) : (
            <>
              {!foto ? (
                <button onClick={capture}
                  className="px-4 py-2 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
                  📸 Ambil Foto
                </button>
              ) : (
                <button onClick={() => setFoto(null)}
                  className="px-4 py-2 bg-[#0d2137] border border-white/10 text-gray-300 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors">
                  🔄 Ulang Foto
                </button>
              )}
              <button onClick={stopCamera}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500 hover:text-white transition-colors">
                Tutup Kamera
              </button>
            </>
          )}
          {foto && (
            <>
              <button onClick={() => absen('MASUK')}
                className="px-4 py-2 bg-[#0d8a6a] rounded-lg text-xs text-white font-semibold hover:bg-[#0a7059] transition-colors">
                ✓ Absen Masuk
              </button>
              <button onClick={() => absen('PULANG')}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500 hover:text-white transition-colors">
                ✓ Absen Pulang
              </button>
            </>
          )}
        </div>

        {msg && (
          <p className={`text-xs px-3 py-2 rounded-lg ${msg.startsWith('✓') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {msg}
          </p>
        )}
      </div>

      {/* Riwayat */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold">Riwayat Absensi Hari Ini</p>
          <span className="text-xs text-gray-500">{records.length} catatan</span>
        </div>
        <div className="divide-y divide-white/5">
          {[...records].reverse().map(r => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-xs font-bold text-[#0d8a6a] flex-shrink-0">
                {r.nama[0]}
              </div>
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

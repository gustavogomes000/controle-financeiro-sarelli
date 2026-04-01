import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Hyperspeed from '@/components/Hyperspeed';
import { toast } from 'sonner';
import fotoFernanda from '@/assets/foto-fernanda.png';
import logoSarelli from '@/assets/Logo_Sarelli.png';

const hyperspeedPreset = {
  onSpeedUp: () => {}, onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 800, roadWidth: 18, islandWidth: 4, lanesPerRoad: 3,
  fov: 100, fovSpeedUp: 140, speedUp: 2, carLightsFade: 0.4,
  totalSideLightSticks: 40, lightPairsPerRoadWay: 80,
  shoulderLinesWidthPercentage: 0.05, brokenLinesWidthPercentage: 0.1, brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5], lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 100], movingCloserSpeed: [-120, -180],
  carLightsLength: [800 * 0.04, 800 * 0.14], carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5], carShiftX: [-0.8, 0.8], carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x1a0a12, islandColor: 0x1a0812, background: 0x140a10,
    shoulderLines: 0x2a1020, brokenLines: 0x2a1020,
    leftCars: [0xe91e8c, 0xf9a8d4, 0xd4a853, 0xfda4af],
    rightCars: [0xf43f5e, 0xd4a853, 0xc026d3, 0xe879f9],
    sticks: 0xf472b6,
  },
};

/* ── Main ── */
export default function LoginPage() {
  const [nome, setNome] = useState(() => localStorage.getItem('saved_user') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('saved_pass') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem('saved_user'));
  const { signInByNome } = useAuth();
  const navigate = useNavigate();
  const preset = useMemo(() => hyperspeedPreset, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !password.trim()) {
      toast.error('Preencha nome e senha');
      return;
    }
    setLoading(true);
    const { error } = await signInByNome(nome.trim(), password);
    setLoading(false);
    if (error) {
      toast.error('Nome ou senha inválidos');
    } else {
      if (remember) {
        localStorage.setItem('saved_user', nome);
        localStorage.setItem('saved_pass', password);
      } else {
        localStorage.removeItem('saved_user');
        localStorage.removeItem('saved_pass');
      }
      navigate('/');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #fdf0f4 50%, #fce4ec 100%)' }}>
      <Hyperspeed effectOptions={preset} />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(252,228,236,0.7) 100%)' }} />
      <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full blur-3xl pointer-events-none z-[1]" style={{ background: 'rgba(233,30,140,0.15)', animation: 'brand-float-slow 8s ease-in-out infinite' }} />
      <div className="absolute -bottom-20 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none z-[1]" style={{ background: 'rgba(212,168,83,0.15)', animation: 'brand-float-slow 10s ease-in-out infinite reverse' }} />

      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-[120px] h-[120px] rounded-full p-[3px] bg-gradient-to-br from-[#e91e8c] to-[#d4a853] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              <img src={fotoFernanda} alt="Dra. Fernanda Sarelli" className="w-full h-full object-cover" />
            </div>
          </div>

          <img src={logoSarelli} alt="Logo Sarelli" className="mx-auto h-28 object-contain mt-2" />

          <div className="mt-1">
            <p className="text-lg uppercase tracking-[0.3em] font-bold" style={{ color: '#d4a853' }}>Contas a Pagar</p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Acesso exclusivo da equipe</p>
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: '#d4a853' }}>Painel de Pagamentos Financeiro</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl p-6 border border-white/60"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        >
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-gray-600 font-bold block">Usuário</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Seu nome de acesso"
                value={nome}
                onChange={e => setNome(e.target.value)}
                autoComplete="username"
                required
                className="w-full bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 h-11 pl-10 pr-4 rounded-lg text-sm outline-none transition-colors focus:border-[#e91e8c] focus:ring-2 focus:ring-[#e91e8c]/20"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-gray-600 font-bold block">Senha</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 h-11 pl-10 pr-10 rounded-lg text-sm outline-none transition-colors focus:border-[#e91e8c] focus:ring-2 focus:ring-[#e91e8c]/20"
                style={{ fontSize: '16px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                {showPassword
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#e91e8c] cursor-pointer" />
            <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">Lembrar meus dados</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 uppercase tracking-wider"
            style={{ background: 'linear-gradient(135deg, #e91e8c, #d4a853)', boxShadow: '0 4px 20px rgba(233,30,140,0.3)' }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Entrando...</span>
              : <span className="flex items-center justify-center gap-2">→ Entrar</span>
            }
          </button>
        </form>

        <div className="text-center space-y-1 pt-2">
          <p className="text-[11px] text-gray-400">Pré-candidata a Deputada Estadual — GO 2026</p>
          <a href="https://drafernandacarelli.com.br" target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium hover:underline" style={{ color: '#e91e8c' }}>
            drafernandacarelli.com.br
          </a>
        </div>
      </div>
    </div>
  );
}

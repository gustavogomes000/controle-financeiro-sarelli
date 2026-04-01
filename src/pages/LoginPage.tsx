import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import fotoFernanda from '@/assets/foto-fernanda.png';
import logoSarelli from '@/assets/Logo_Sarelli.png';

/* ── Geometric Network (pink dots + lines) ── */
interface Node { x: number; y: number; vx: number; vy: number }

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef(0);

  const init = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / 14000);
    nodesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;
      const maxDist = 130;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      ctx.strokeStyle = 'rgba(220,130,160,0.18)';
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            ctx.globalAlpha = 1 - d / maxDist;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(233,30,140,0.35)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [init]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

/* ── Fiber-optic light beams from bottom-right corner ── */
function FiberBeams() {
  const beams: { angle: number; color: string; w: number; blur: number; delay: number }[] = [];
  for (let i = 0; i < 22; i++) {
    const isPink = i % 3 !== 1;
    beams.push({
      angle: -48 + i * 2.8 + (i % 2 ? 0.5 : -0.5),
      color: isPink
        ? `rgba(233,30,140,${0.15 + (i % 4) * 0.06})`
        : `rgba(212,168,83,${0.25 + (i % 3) * 0.08})`,
      w: isPink ? 1.5 + (i % 3) * 0.5 : 2 + (i % 2),
      blur: isPink ? 1.5 : 2.5,
      delay: i * 0.18,
    });
  }

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {beams.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            bottom: '-5%',
            right: '-8%',
            width: '900px',
            height: `${b.w}px`,
            background: `linear-gradient(90deg, transparent 0%, ${b.color} 25%, ${b.color} 60%, transparent 100%)`,
            transformOrigin: 'right bottom',
            transform: `rotate(${b.angle}deg)`,
            filter: `blur(${b.blur}px)`,
            animation: `fiberPulse ${3 + b.delay}s ease-in-out infinite alternate`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main ── */
export default function LoginPage() {
  const [nome, setNome] = useState(() => localStorage.getItem('saved_user') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('saved_pass') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem('saved_user'));
  const { signInByNome } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes streakMove {
        0% { opacity: 0.4; transform: rotate(32deg) translateX(-30px); }
        100% { opacity: 0.9; transform: rotate(32deg) translateX(30px); }
      }
      @keyframes waveLeft {
        0% { transform: translateX(0px) translateY(0px); }
        100% { transform: translateX(-26px) translateY(-8px); }
      }
      @keyframes waveRight {
        0% { transform: translateX(0px) translateY(0px); }
        100% { transform: translateX(32px) translateY(6px); }
      }
      @keyframes waveRise {
        0% { transform: translateX(0px) translateY(0px); opacity: 0.55; }
        100% { transform: translateX(18px) translateY(-10px); opacity: 0.95; }
      }
      .wave-drift-left { animation: waveLeft 6s ease-in-out infinite alternate; }
      .wave-drift-right { animation: waveRight 5s ease-in-out infinite alternate; }
      .wave-drift-left-slow { animation: waveLeft 8s ease-in-out infinite alternate; }
      .wave-rise { animation: waveRise 4.5s ease-in-out infinite alternate; }
      .wave-rise-delay { animation: waveRise 5.5s ease-in-out infinite alternate-reverse; }
      .wave-rise-soft { animation: waveRise 7s ease-in-out infinite alternate; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

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
      <NetworkBackground />
      <LightStreaks />
      <WaveTrails />

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

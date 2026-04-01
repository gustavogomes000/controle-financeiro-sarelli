import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import fotoFernanda from '@/assets/foto-fernanda.png';
import logoSarelli from '@/assets/Logo_Sarelli.png';

/* ── Animated Network Background ── */
interface Node { x: number; y: number; vx: number; vy: number }

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef(0);

  const init = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / 12000);
    nodesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
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
      const maxDist = 120;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      ctx.strokeStyle = 'rgba(236,72,153,0.12)';
      ctx.lineWidth = 0.6;
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
      ctx.fillStyle = 'rgba(236,72,153,0.3)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [init]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

/* ── Main Login Page ── */
export default function LoginPage() {
  const [nome, setNome] = useState(() => localStorage.getItem('saved_user') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('saved_pass') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem('saved_user'));
  const { signInByNome } = useAuth();
  const navigate = useNavigate();

  /* Inject keyframes for the pulsing border */
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes borderSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulseGlow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
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
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center overflow-y-auto relative"
      style={{ background: 'linear-gradient(145deg, #fef2f2 0%, #fdf2f8 50%, #fef2f2 100%)' }}
    >
      <NetworkBackground />

      <div className="w-full max-w-sm relative z-10 px-4 py-8 sm:py-0">
        {/* Photo + Logo header */}
        <div className="flex flex-col items-center">
          {/* Circular photo */}
          <div className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full border-4 border-pink-400 overflow-hidden shadow-lg bg-white">
            <img src={fotoFernanda} alt="Dra. Fernanda Sarelli" className="w-full h-full object-cover" />
          </div>

          {/* Logo overlapping photo */}
          <img
            src={logoSarelli}
            alt="Logo Sarelli"
            className="h-36 sm:h-44 object-contain -mt-6"
          />

          {/* Subtitle */}
          <p
            className="text-sm sm:text-base uppercase tracking-[0.25em] font-semibold -mt-2"
            style={{ color: '#c8aa64' }}
          >
            Painel de Pagamentos
          </p>
        </div>

        {/* Card with animated pulsing border */}
        <div className="relative mt-5 sm:mt-6">
          {/* Animated border glow */}
          <div
            className="absolute -inset-[2px] rounded-2xl overflow-hidden"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
          >
            <div
              className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%]"
              style={{
                background: 'conic-gradient(from 0deg, transparent, #ec4899, transparent, #ec4899, transparent)',
                animation: 'borderSpin 4s linear infinite',
              }}
            />
          </div>

          {/* Card content */}
          <form
            onSubmit={handleSubmit}
            className="relative space-y-4 sm:space-y-5 rounded-2xl p-5 sm:p-8"
            style={{
              background: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-widest text-gray-600 font-bold block">
                Usuário
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="text"
                  placeholder="Seu nome de acesso"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 h-11 pl-10 pr-4 rounded-lg text-sm outline-none transition-colors focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-widest text-gray-600 font-bold block">
                Senha
              </label>
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
                  className="w-full bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 h-11 pl-10 pr-10 rounded-lg text-sm outline-none transition-colors focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
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

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-pink-500 cursor-pointer" />
              <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">Lembrar meus dados</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 uppercase tracking-wider flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                boxShadow: '0 4px 20px rgba(236,72,153,0.35)',
              }}
            >
              {loading
                ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />Entrando...</>
                : <>→ Entrar</>
              }
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 pt-4">
          <p className="text-[11px] text-gray-400">Pré-candidata a Deputada Estadual — GO 2026</p>
          <a href="https://drafernandacarelli.com.br" target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-pink-500 hover:underline">
            drafernandacarelli.com.br
          </a>
        </div>
      </div>
    </div>
  );
}

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
    const count = Math.floor((w * h) / 11000);
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
      const maxDist = 130;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      ctx.strokeStyle = 'rgba(236,72,153,0.15)';
      ctx.lineWidth = 0.8;
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
      ctx.fillStyle = 'rgba(236,72,153,0.4)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
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
      style={{ background: 'linear-gradient(160deg, #fde8ef 0%, #fdf2f8 40%, #fce4ec 100%)' }}
    >
      <NetworkBackground />

      <div className="w-full max-w-md relative z-10 px-4 py-6 sm:py-0">
        {/* Photo */}
        <div className="flex flex-col items-center">
          <div
            className="rounded-full p-[4px] shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #f472b6)',
              width: 'clamp(100px, 18vw, 140px)',
              height: 'clamp(100px, 18vw, 140px)',
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              <img src={fotoFernanda} alt="Dra. Fernanda Sarelli" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Logo */}
          <img
            src={logoSarelli}
            alt="Logo Sarelli"
            className="h-32 sm:h-40 object-contain -mt-3"
          />

          {/* Subtitle */}
          <p
            className="text-sm sm:text-[15px] uppercase tracking-[0.3em] font-semibold mt-1 mb-5"
            style={{ color: '#c8aa64' }}
          >
            Contas a Pagar
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8 space-y-5"
          style={{
            background: 'rgba(255, 240, 245, 0.65)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(236, 72, 153, 0.18)',
            boxShadow: '0 8px 40px rgba(236, 72, 153, 0.08)',
          }}
        >
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-gray-700 font-bold block">
              Usuário
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8aa64] w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Ex: Administrador"
                value={nome}
                onChange={e => setNome(e.target.value)}
                autoComplete="username"
                required
                className="w-full bg-white/90 text-gray-800 placeholder:text-gray-400 h-12 pl-11 pr-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  fontSize: '16px',
                  border: '1.5px solid rgba(200, 170, 100, 0.35)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
                }}
                onFocus={e => { e.target.style.borderColor = '#ec4899'; e.target.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(200,170,100,0.35)'; e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.04)'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-gray-700 font-bold block">
              Senha
            </label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c8aa64] w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-white/90 text-gray-800 placeholder:text-gray-400 h-12 pl-11 pr-11 rounded-xl text-sm outline-none transition-all"
                style={{
                  fontSize: '16px',
                  border: '1.5px solid rgba(200, 170, 100, 0.35)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
                }}
                onFocus={e => { e.target.style.borderColor = '#ec4899'; e.target.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(200,170,100,0.35)'; e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.04)'; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#c8aa64' }} tabIndex={-1}>
                {showPassword
                  ? <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                  : <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>

          {/* Remember */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 rounded-full border-gray-300 accent-pink-500 cursor-pointer"
            />
            <label htmlFor="remember" className="text-[13px] text-gray-500 cursor-pointer select-none">
              Lembrar meus dados
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-xl font-bold text-[15px] text-white transition-all active:scale-[0.98] disabled:opacity-60 tracking-wide flex items-center justify-center gap-2.5"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #e8796e 50%, #c8aa64 100%)',
              boxShadow: '0 6px 24px rgba(236,72,153,0.3)',
            }}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                Entrando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-1 pt-5 pb-4">
          <p className="text-[11px] text-gray-400">Pré-candidata a Deputada Estadual — GO 2026</p>
          <a
            href="https://drafernandacarelli.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium hover:underline"
            style={{ color: '#ec4899' }}
          >
            drafernandacarelli.com.br
          </a>
        </div>
      </div>
    </div>
  );
}

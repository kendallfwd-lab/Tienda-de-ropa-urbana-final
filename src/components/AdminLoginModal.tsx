import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Inbox,
  Send
} from 'lucide-react';
import { 
  AdminUser, 
  loginAdminUser, 
  requestPasswordReset,
  verifyResetCodeAndSetPassword
} from '../lib/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
  onShowToast: (msg: string) => void;
}

type Mode = 'login' | 'forgot_password';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast
}) => {
  const [mode, setMode] = useState<Mode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recovery State
  const [successInfo, setSuccessInfo] = useState<{ 
    email: string; 
    code: string;
    message: string; 
    gmailComposeUrl: string;
    gmailInboxUrl: string;
  } | null>(null);
  const [codeEntered, setCodeEntered] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Clean wipe all form fields whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setIdentifier('');
      setPassword('');
      setCodeEntered('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setSuccessInfo(null);
      setMode('login');
      setShowPassword(false);
      setShowNewPassword(false);
    }
  }, [isOpen]);

  const handleModalClose = () => {
    setIdentifier('');
    setPassword('');
    setCodeEntered('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessInfo(null);
    setMode('login');
    onClose();
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Por favor ingresa tu nombre de usuario o correo electrónico.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const admin = await loginAdminUser(identifier.trim(), password);
      // Clean inputs immediately after successful login
      setIdentifier('');
      setPassword('');
      setErrorMessage(null);
      onShowToast(`✓ Sesión iniciada como ${admin.username}`);
      onLoginSuccess(admin);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err.message || 'Contraseña incorrecta. Si no la recuerdas, pulsa "¿Olvidaste tu contraseña?" para enviarte un correo de recuperación.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!identifier.trim()) {
      setErrorMessage('Por favor ingresa tu correo de Gmail (ej: kendallfwd@gmail.com).');
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(identifier.trim());
      setSuccessInfo({
        email: result.email,
        code: result.code,
        message: result.message,
        gmailComposeUrl: result.gmailComposeUrl,
        gmailInboxUrl: result.gmailInboxUrl
      });
      onShowToast(`✓ Notificación generada para ${result.email}`);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setErrorMessage(err.message || 'No se pudo generar la solicitud de recuperación. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCodeAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!codeEntered.trim()) {
      setErrorMessage('Por favor ingresa el código de 6 dígitos enviado a tu Gmail.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyResetCodeAndSetPassword(codeEntered, newPassword, identifier);
      // Clear fields upon successful password update
      setIdentifier('');
      setPassword('');
      setCodeEntered('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessInfo(null);
      setErrorMessage(null);
      onShowToast('✓ Contraseña actualizada correctamente en la base de datos');
      onLoginSuccess(result.admin);
      onClose();
    } catch (err: any) {
      console.error('Code verification error:', err);
      setErrorMessage(err.message || 'Error al validar el código. Asegúrate de ingresar el código correcto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-zinc-950 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header with Wolf Branding */}
        <div className="p-6 bg-zinc-950 text-white flex items-center justify-between border-b-2 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-zinc-900 to-amber-500 flex items-center justify-center text-lg shadow-lg border border-white/20">
              🐺
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black uppercase tracking-tight font-heading">
                  {mode === 'login' && 'Acceso Administrativo'}
                  {mode === 'forgot_password' && 'Recuperación de Contraseña'}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Leslie Store • Base de Datos &amp; Control
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-zinc-50">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1.5">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ingresa tu usuario o correo"
                    className="w-full bg-white border-2 border-zinc-300 focus:border-zinc-950 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-zinc-900 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase text-zinc-700">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                      setSuccessInfo(null);
                    }}
                    className="text-[11px] font-black text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>¿Olvidaste tu contraseña?</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border-2 border-zinc-300 focus:border-zinc-950 rounded-2xl py-3 pl-10 pr-10 text-xs font-bold text-zinc-900 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 min-h-[48px]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando Credenciales...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Entrar al Panel de Control</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </button>
              </div>

              {/* Security Hint */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Si olvidaste tu contraseña, pulsa <strong>"¿Olvidaste tu contraseña?"</strong> para verificar tu identidad a través de tu correo oficial de Gmail.
                </span>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              {!successInfo ? (
                <form onSubmit={handleResetPassword} autoComplete="off" className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Envío de Notificación a tu Gmail</span>
                    </p>
                    <p className="text-[11px] text-blue-800">
                      Ingresa tu correo oficial registrado. Se generará un código de verificación verídico y se enviará la notificación directa a tu Gmail para poder restablecer la clave.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-1.5">
                      Tu Correo de Gmail o Usuario
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full bg-white border-2 border-zinc-300 focus:border-zinc-950 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-zinc-900 focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-50 min-h-[48px]"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Conectando con Gmail...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Notificación Directa a mi Gmail</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                        setSuccessInfo(null);
                      }}
                      className="w-full py-2.5 text-center text-xs font-black uppercase text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
                    >
                      ← Volver al Inicio de Sesión
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Verification Code from Gmail + Set New Password */
                <form onSubmit={handleVerifyCodeAndReset} className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Notificación Lista para tu Gmail</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 font-mono font-bold text-xs text-zinc-900 text-center">
                      Destino: {successInfo.email}
                    </div>

                    {/* Direct Quick Action to Open Gmail Notification */}
                    <div className="pt-1">
                      <a
                        href={successInfo.gmailComposeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
                      >
                        <Inbox className="w-4 h-4" />
                        <span>Abrir Gmail y Recibir Notificación</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  </div>

                  {/* Code Input */}
                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-1.5">
                      1. Código de Seguridad de 6 Dígitos
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={codeEntered}
                        onChange={(e) => setCodeEntered(e.target.value.replace(/\D/g, ''))}
                        placeholder={`Ej: ${successInfo.code}`}
                        className="w-full bg-white border-2 border-zinc-950 focus:border-red-600 rounded-2xl py-3 pl-10 pr-4 text-sm font-black font-mono tracking-widest text-zinc-950 focus:outline-none shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
                      <span>Código de tu correo: <strong>{successInfo.code}</strong></span>
                      <button
                        type="button"
                        onClick={() => setCodeEntered(successInfo.code)}
                        className="text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Autocompletar
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-1.5">
                      2. Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full bg-white border-2 border-zinc-300 focus:border-zinc-950 rounded-2xl py-2.5 pl-10 pr-10 text-xs font-bold text-zinc-900 focus:outline-none shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 mb-1.5">
                      3. Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="w-full bg-white border-2 border-zinc-300 focus:border-zinc-950 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-zinc-900 focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Submit Verification */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 active:scale-98 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-50 min-h-[48px]"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Validando con la Base de Datos...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Guardar Nueva Contraseña en la Base de Datos</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSuccessInfo(null);
                        setCodeEntered('');
                        setErrorMessage(null);
                      }}
                      className="w-full py-2 text-center text-xs font-black uppercase text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                    >
                      ← Reenviar a otro correo
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-100 border-t border-zinc-200 text-center text-[11px] text-zinc-500 font-medium">
          🔒 Acceso verificado y protegido por Google Cloud &amp; Firebase
        </div>

      </div>
    </div>
  );
};



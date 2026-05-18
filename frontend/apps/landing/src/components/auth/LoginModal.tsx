import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'
import AuthModal from '@/components/auth/AuthModal'
import useAuthModalStore from '@/store/authModalStore'
import useAuthStore from '@/store/authStore'
import { decodeJwtPayload } from '@/lib/jwt'
import type { RegistrationTokenPayload } from '@ubes/types'
import logo from '@/assets/logo.png'

export default function LoginModal() {
  const { activeModal, openRegister, close } = useAuthModalStore()
  const login = useAuthStore(s => s.login)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogle = async ({ credential }: { credential?: string }) => {
    if (!credential || isSubmitting) return
    setIsSubmitting(true)
    try {
      const data = await login(credential)
      if (data.user) {
        toast.success(`¡Bienvenido, ${data.user.firstName}!`)
        close()
      } else if (data.registrationToken) {
        const payload = decodeJwtPayload<RegistrationTokenPayload>(data.registrationToken)
        if (payload) {
          openRegister(data.registrationToken, payload)
        } else {
          toast.error('No pudimos leer tu información de Google. Intentá de nuevo.')
        }
      }
    } catch {
      toast.error('No pudimos iniciar sesión. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleError = () => {
    toast.error('No pudimos conectar con Google. Intentá de nuevo.')
  }

  return (
    <AuthModal isOpen={activeModal === 'login'} onClose={close} ariaLabel="Iniciar sesión">
      <div className="auth-login">
        <div className="auth-login-brand">
          <img src={logo} width={48} height={48} alt="UBES logo" />
          <span className="auth-login-brand-name">UBES<span className="auth-login-brand-dot">.</span></span>
        </div>

        <h2 className="auth-login-title">¿Por qué registrarme?</h2>
        <ul className="auth-login-bullets">
          <li>Publicá sugerencias para mejorar UBES.</li>
          <li>Inscribí a tu escuela en competencias.</li>
          <li>No necesitás contraseña.</li>
        </ul>

        <div className={`auth-login-google${isSubmitting ? ' auth-login-google--loading' : ''}`}>
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            text="signin_with"
            locale="es_419"
            shape="rectangular"
            width="320"
          />
        </div>

        <span className="auth-login-help" role="button" tabIndex={0}>No puedo acceder</span>

        <footer className="auth-login-footer">
          <span className="auth-login-footer-link">Términos y Condiciones</span>
          <span className="auth-login-footer-sep">·</span>
          <span className="auth-login-footer-link">Políticas de Privacidad</span>
        </footer>
      </div>
    </AuthModal>
  )
}

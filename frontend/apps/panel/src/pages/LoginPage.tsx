import { Navigate, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuthStore()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    try {
      await login(credentialResponse.credential)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar sesión.')
    }
  }

  return (
    <div className="login-page">
      <div className="grid-bg" />
      <div className="login-card fade-up">
        <span className="login-title">UBES.</span>
        <div className="login-google">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Error al iniciar sesión con Google.')}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
            useOneTap={false}
          />
        </div>
        {isLoading && <p className="login-hint">Verificando...</p>}
      </div>
    </div>
  )
}

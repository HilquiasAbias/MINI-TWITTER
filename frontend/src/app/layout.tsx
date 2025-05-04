import { AuthProvider } from '../context/auth'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav>
            {/* Adicionar componente de navegação */}
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
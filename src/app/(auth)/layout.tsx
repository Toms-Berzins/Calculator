import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 py-12 ${styles.authLayout}`}
    >
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  )
}

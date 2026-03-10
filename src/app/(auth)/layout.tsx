import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 py-12 ${styles.authLayout}`}
    >
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 ${styles.topBlob}`}
        />
        <div
          className={`absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-20 ${styles.bottomBlob}`}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  )
}

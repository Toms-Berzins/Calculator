import { createServerSupabaseClient } from '@/lib/supabase/server'
import styles from './customers.module.css'

export default async function CustomersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, company, email, phone')
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight ${styles.pageTitle}`}>
          Customers
        </h1>
        <p className={`mt-1 text-sm ${styles.pageSubtitle}`}>
          {customers?.length ?? 0} total
        </p>
      </div>

      {!customers?.length && (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-16 text-center ${styles.emptyCard}`}
        >
          <svg
            className={`mb-3 w-10 h-10 ${styles.emptyIcon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <p className={`text-sm font-medium ${styles.emptyText}`}>
            No customers yet
          </p>
        </div>
      )}

      <ul className="space-y-2.5">
        {customers?.map((c) => (
          <li
            key={c.id}
            className={`rounded-2xl px-5 py-4 ${styles.customerCard}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold text-sm ${styles.customerName}`}
                >
                  {c.name}
                </p>
                {c.company && (
                  <p className={`mt-0.5 text-sm ${styles.customerCompany}`}>
                    {c.company}
                  </p>
                )}
              </div>

              {/* Avatar initial */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${styles.avatar}`}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {(c.email || c.phone) && (
              <div
                className={`mt-3 flex flex-wrap gap-3 pt-3 ${styles.contactDivider}`}
              >
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="link-muted flex items-center gap-1.5 text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {c.email}
                  </a>
                )}
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="link-muted flex items-center gap-1.5 text-sm"
                  >
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {c.phone}
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

import { formatCurrency } from '@/lib/utils/format'
import styles from './NewQuoteForm.module.css'

interface QuoteTotalsCardProps {
  quoteSubtotal: number
  taxRate: number
  quoteTaxAmount: number
  quoteTotal: number
  onChangeTaxRate: (value: number) => void
}

export function QuoteTotalsCard({
  quoteSubtotal,
  taxRate,
  quoteTaxAmount,
  quoteTotal,
  onChangeTaxRate,
}: QuoteTotalsCardProps) {
  return (
    <div className={`w-full max-w-xs space-y-2.5 rounded-2xl p-4 ${styles.totalsCard}`}>
      <div className="flex items-center justify-between text-sm">
        <span className={styles.totalRow}>Subtotal</span>
        <span className={`font-medium tabular-nums ${styles.totalAmount}`}>
          {formatCurrency(quoteSubtotal)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor="tax" className={styles.totalRow}>
          VAT %
        </label>
        <input
          id="tax"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={taxRate}
          onChange={(e) => onChangeTaxRate(Number(e.target.value))}
          className="input-field w-20 rounded-lg px-2 py-1 text-right text-sm tabular-nums"
        />
      </div>
      {taxRate > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className={styles.totalRow}>VAT</span>
          <span className={`font-medium tabular-nums ${styles.totalAmount}`}>
            {formatCurrency(quoteTaxAmount)}
          </span>
        </div>
      )}
      <div className={`flex items-center justify-between pt-2.5 text-base font-bold ${styles.divider}`}>
        <span className={styles.pageTitle}>Total</span>
        <span className={`tabular-nums ${styles.totalAccent}`}>
          {formatCurrency(quoteTotal)}
        </span>
      </div>
    </div>
  )
}

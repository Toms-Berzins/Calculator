import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { QuoteStatus, QuoteWithRelations } from '@/types/database'
import type { CompanyInfo } from '@/lib/calculatorSettings'
import { en } from '@/i18n/en'
import { lv } from '@/i18n/lv'
import type { Locale } from '@/i18n/types'

// Register Inter with Latin Extended support (covers Latvian ā ē ī ū č ģ ķ ļ ņ š ž)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-ext-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-ext-700-normal.woff', fontWeight: 700 },
  ],
})

// Disable hyphenation for clean, professional text rendering
Font.registerHyphenationCallback(word => [word])

// ── Colour palette ────────────────────────────────────────────────────────────

const C = {
  primary:     '#1d4ed8',
  primaryDark: '#1e40af',
  primaryBg:   '#eff6ff',
  white:       '#ffffff',
  gray50:      '#f9fafb',
  gray100:     '#f3f4f6',
  gray200:     '#e5e7eb',
  gray400:     '#9ca3af',
  gray500:     '#6b7280',
  gray700:     '#374151',
  gray900:     '#111827',
  green100:    '#dcfce7',
  green700:    '#15803d',
  amber100:    '#fef3c7',
  amber700:    '#b45309',
  red100:      '#fee2e2',
  red700:      '#b91c1c',
  blue100:     '#dbeafe',
  blue700:     '#1d4ed8',
} as const

// Colours are static; labels come from the locale dictionary at render time
const STATUS_META: Record<QuoteStatus, { bg: string; fg: string }> = {
  draft:    { bg: C.gray100,  fg: C.gray500  },
  sent:     { bg: C.blue100,  fg: C.blue700  },
  accepted: { bg: C.green100, fg: C.green700 },
  rejected: { bg: C.red100,   fg: C.red700   },
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontFamily: 'Inter',
    fontSize: 10,
    color: C.gray900,
    backgroundColor: C.white,
    lineHeight: 1.4,
  },

  // Fixed brand header – repeats on every page
  pageHeader: {
    position: 'absolute',
    top: 18,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  brandName: { fontSize: 15, fontWeight: 700, color: C.primary, letterSpacing: 0.5 },
  brandSub:  { fontSize: 7,  color: C.gray400, marginTop: 1 },
  headerRef: { fontSize: 8,  color: C.gray400, textAlign: 'right' },

  // Headline block
  headline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  quoteTitle: { fontSize: 26, fontWeight: 700, color: C.gray900, letterSpacing: 2 },
  badge: {
    borderRadius: 3,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 7,
    paddingRight: 7,
    alignSelf: 'center',
  },
  badgeText: { fontSize: 8, fontWeight: 700, letterSpacing: 0.8 },
  metaBlock: { alignItems: 'flex-end' },
  metaRow:   { fontSize: 9, color: C.gray500, marginBottom: 2 },
  metaBold:  { fontSize: 9, fontWeight: 700, marginBottom: 2 },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: C.gray200, marginBottom: 16 },

  // 3-column info grid
  infoGrid:   { flexDirection: 'row', gap: 20, marginBottom: 20 },
  infoBlock:  { flex: 1 },
  infoLabel:  {
    fontSize: 7,
    fontWeight: 700,
    color: C.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoName:   { fontSize: 10, fontWeight: 700, color: C.gray900, marginBottom: 2 },
  infoDetail: { fontSize: 9,  color: C.gray500, marginBottom: 1 },

  // Line-items table
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    padding: '7 10',
    borderRadius: 2,
    marginBottom: 1,
  },
  thText:    { color: C.white, fontWeight: 700, fontSize: 8, textTransform: 'uppercase' },
  tdRowEven: {
    flexDirection: 'row',
    padding: '6 10',
    backgroundColor: C.gray50,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  tdRowOdd:  {
    flexDirection: 'row',
    padding: '6 10',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  tdText:   { fontSize: 9, color: C.gray700 },
  colDesc:  { flex: 4 },
  colQty:   { flex: 1,   textAlign: 'right' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right', fontWeight: 700 },

  // Totals section
  totalsOuter:  { alignItems: 'flex-end', marginTop: 12 },
  totalsBox:    { width: 240 },
  totalsRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 3, paddingBottom: 3 },
  totalsLabel:  { fontSize: 9, color: C.gray500 },
  totalsVal:    { fontSize: 9, fontWeight: 700, color: C.gray700 },
  totalsDivider: { borderBottomWidth: 1, borderBottomColor: C.gray200, marginTop: 4, marginBottom: 4 },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.primary,
    padding: '8 12',
    borderRadius: 3,
    marginTop: 2,
  },
  grandLabel: { fontSize: 10, fontWeight: 700, color: C.white },
  grandVal:   { fontSize: 12, fontWeight: 700, color: C.white },

  // Supplier header
  supplierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  supplierLeft: { flex: 1, marginRight: 20 },
  supplierRight: { alignItems: 'flex-end' },
  supplierName: {
    fontSize: 13,
    fontWeight: 700,
    color: C.gray900,
    marginBottom: 3,
  },
  supplierDetail: { fontSize: 9, color: C.gray500, marginBottom: 1 },

  // Acceptance section
  acceptanceBox: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
  },
  acceptanceTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: C.gray700,
    marginBottom: 4,
  },
  acceptanceNote: { fontSize: 8, color: C.gray500, lineHeight: 1.4, marginBottom: 12 },
  signatureRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  signatureBlock: { flex: 1 },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.gray400,
    height: 28,
    marginBottom: 4,
  },
  signatureLabel: { fontSize: 7, color: C.gray500 },

  // Notes
  notesBox: {
    marginTop: 20,
    padding: '10 14',
    backgroundColor: C.gray50,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  notesLabel: { fontWeight: 700, fontSize: 8, color: C.primary, marginBottom: 3 },
  notesText:  { fontSize: 9, color: C.gray500, lineHeight: 1.5 },

  // Terms
  termsBox:  { marginTop: 14 },
  termsTitle: { fontWeight: 700, fontSize: 7, color: C.gray400, marginBottom: 2 },
  termsText:  { fontSize: 7, color: C.gray400, lineHeight: 1.4 },

  // Fixed footer with page numbers
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.gray400 },
})

// ── Component ─────────────────────────────────────────────────────────────────

const pdfDicts = { en, lv } as Record<string, typeof en>

interface Props {
  quote: QuoteWithRelations
  locale: Locale
  company?: CompanyInfo | null
}

export function QuoteDocument({ quote, locale, company }: Props) {
  const t           = (pdfDicts[locale] ?? en).pdf
  const fmt         = (n: number) =>
    new Intl.NumberFormat(t.dateLocale, { style: 'currency', currency: 'EUR' }).format(n)
  const fmtDate     = (iso: string) =>
    new Intl.DateTimeFormat(t.dateLocale, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
  const addDays     = (iso: string, days: number) => {
    const d = new Date(iso); d.setDate(d.getDate() + days); return d.toISOString()
  }
  const customer    = quote.jobs?.customers
  const job         = quote.jobs
  const statusMeta  = STATUS_META[quote.status]
  const refNumber   = quote.id.slice(0, 8).toUpperCase()
  const vatAmount   = Math.round(quote.subtotal * (quote.tax_rate / 100) * 100) / 100
  const sortedItems = [...(quote.quote_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <Document title={`${t.quoteTitle} #${refNumber}`} author="QuoteCalc" subject={t.quoteTitle}>
      <Page size="A4" style={s.page}>

        {/* ── Fixed brand header (all pages) ─── */}
        <View style={s.pageHeader} fixed>
          <View>
            <Text style={s.brandName}>QuoteCalc</Text>
            <Text style={s.brandSub}>{t.brandSub}</Text>
          </View>
          <Text style={s.headerRef}>{t.ref}: {refNumber}</Text>
        </View>

        {/* ── Supplier + quote meta header ────── */}
        <View style={s.supplierRow}>
          <View style={s.supplierLeft}>
            <Text style={s.infoLabel}>{t.from}</Text>
            <Text style={s.supplierName}>{company?.company_name ?? 'QuoteCalc'}</Text>
            {company?.company_address    && <Text style={s.supplierDetail}>{company.company_address}</Text>}
            {company?.company_vat_number && <Text style={s.supplierDetail}>{t.vatNumber}: {company.company_vat_number}</Text>}
            {company?.company_email      && <Text style={s.supplierDetail}>{company.company_email}</Text>}
            {company?.company_phone      && <Text style={s.supplierDetail}>{company.company_phone}</Text>}
            {company?.company_website    && <Text style={s.supplierDetail}>{company.company_website}</Text>}
          </View>
          <View style={s.supplierRight}>
            <Text style={s.metaBold}>#{refNumber}</Text>
            <View style={{ ...s.badge, backgroundColor: statusMeta.bg, marginTop: 4, marginBottom: 6 }}>
              <Text style={{ ...s.badgeText, color: statusMeta.fg }}>{t.status[quote.status]}</Text>
            </View>
            <Text style={s.metaRow}>{t.issued}: {fmtDate(quote.created_at)}</Text>
            <Text style={s.metaRow}>{t.validUntil}: {fmtDate(addDays(quote.created_at, 30))}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── 3-column info grid ────────────── */}
        <View style={s.infoGrid}>
          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>{t.preparedFor}</Text>
            <Text style={s.infoName}>{customer?.name ?? '—'}</Text>
            {customer?.company    && <Text style={s.infoDetail}>{customer.company}</Text>}
            {customer?.address    && <Text style={s.infoDetail}>{customer.address}</Text>}
            {customer?.vat_number && <Text style={s.infoDetail}>{t.vatNumber}: {customer.vat_number}</Text>}
            {customer?.email      && <Text style={s.infoDetail}>{customer.email}</Text>}
            {customer?.phone      && <Text style={s.infoDetail}>{customer.phone}</Text>}
          </View>

          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>{t.job}</Text>
            <Text style={s.infoName}>{job?.title ?? '—'}</Text>
            {job?.description && <Text style={s.infoDetail}>{job.description}</Text>}
          </View>

          <View style={s.infoBlock}>
            <Text style={s.infoLabel}>{t.payment}</Text>
            <Text style={s.infoDetail}>{t.dueWithin}</Text>
            <Text style={s.infoDetail}>{t.currency}</Text>
          </View>
        </View>

        {/* ── Line-items table ──────────────── */}
        <View style={s.tableHead}>
          <Text style={{ ...s.thText, ...s.colDesc  }}>{t.description}</Text>
          <Text style={{ ...s.thText, ...s.colQty   }}>{t.qty}</Text>
          <Text style={{ ...s.thText, ...s.colPrice }}>{t.unitPrice}</Text>
          <Text style={{ ...s.thText, ...s.colTotal }}>{t.total}</Text>
        </View>

        {sortedItems.map((item, index) => (
          <View
            key={item.id}
            style={index % 2 === 0 ? s.tdRowEven : s.tdRowOdd}
            wrap={false}
          >
            <Text style={{ ...s.tdText, ...s.colDesc  }}>{item.description}</Text>
            <Text style={{ ...s.tdText, ...s.colQty   }}>{item.quantity}</Text>
            <Text style={{ ...s.tdText, ...s.colPrice }}>{fmt(item.unit_price)}</Text>
            <Text style={{ ...s.tdText, ...s.colTotal }}>{fmt(item.subtotal)}</Text>
          </View>
        ))}

        {/* ── Totals ────────────────────────── */}
        <View style={s.totalsOuter}>
          <View style={s.totalsBox}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>{t.subtotal}</Text>
              <Text style={s.totalsVal}>{fmt(quote.subtotal)}</Text>
            </View>

            {quote.tax_rate > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>{t.vat(quote.tax_rate)}</Text>
                <Text style={s.totalsVal}>{fmt(vatAmount)}</Text>
              </View>
            )}

            <View style={s.totalsDivider} />

            <View style={s.grandRow} wrap={false}>
              <Text style={s.grandLabel}>{t.totalDue}</Text>
              <Text style={s.grandVal}>{fmt(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notes ────────────────────────── */}
        {quote.notes && (
          <View style={s.notesBox} wrap={false}>
            <Text style={s.notesLabel}>{t.notes}</Text>
            <Text style={s.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* ── Quote Acceptance ─────────────── */}
        <View style={s.acceptanceBox} wrap={false}>
          <Text style={s.acceptanceTitle}>{t.acceptance}</Text>
          <Text style={s.acceptanceNote}>{t.acceptanceNote}</Text>
          <View style={s.signatureRow}>
            {([t.acceptedBy, t.signatureLine, t.dateLine] as string[]).map((label) => (
              <View key={label} style={s.signatureBlock}>
                <View style={s.signatureLine} />
                <Text style={s.signatureLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Terms & Conditions ────────────── */}
        <View style={s.termsBox}>
          <Text style={s.termsTitle}>{t.termsTitle}</Text>
          <Text style={s.termsText}>{t.termsText}</Text>
        </View>

        {/* ── Fixed footer with page numbers ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{t.footerBrand}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => t.page(pageNumber, totalPages)}
          />
        </View>

      </Page>
    </Document>
  )
}


'use client';
import MaterialInventoryTableClient from '@/components/MaterialInventoryTable/MaterialInventoryTableClient';
import styles from './stock.module.css';
import { useT } from '@/i18n/context';

export default function StockPage() {
  const t = useT();
  return (
    <main className={styles.stockPage}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.nav.stock}</h1>
        <p className={styles.pageSubtitle}>
          {t.settings.sectionMaterials} &middot; <a href="https://eu.store.bambulab.com/collections/bambu-lab-3d-printer-filament?Printer+Type=For+P+Series" target="_blank" rel="noopener noreferrer">Bambu Lab Filaments</a>
        </p>
      </div>
      <section>
        <MaterialInventoryTableClient />
      </section>
    </main>
  );
}

'use client';
import React from 'react';
import styles from './MaterialInventoryTable.module.css';
import { useT } from '../../i18n/context';

// TODO: Replace with real types and data fetching
const mockMaterials = [
  {
    id: '1',
    name: 'PLA Filament',
    type: 'PLA',
    color: 'White',
    unit: 'kg',
    reorder_point: 2,
    stock: 5.5,
  },
  {
    id: '2',
    name: 'ABS Filament',
    type: 'ABS',
    color: 'Black',
    unit: 'kg',
    reorder_point: 1,
    stock: 0.8,
  },
];

export default function MaterialInventoryTableClient() {
  const t = useT();
  return (
    <div className={styles.materialInventoryTable}>
      <h2>{t.settings.sectionMaterials}</h2>
      <div role="group" aria-label={t.settings.sectionMaterials + ' Table'}>
        <table role="table" aria-label={t.settings.sectionMaterials}>
          <thead>
            <tr>
              <th>{t.settings.sectionMaterials}</th>
              <th>{t.table.type}</th>
              <th>{t.table.color}</th>
              <th>{t.table.qty}</th>
              <th>{t.table.unit}</th>
              <th>{t.table.reorderPoint}</th>
              <th>{t.table.addItem}</th>
            </tr>
          </thead>
          <tbody>
            {mockMaterials.map((mat) => (
              <tr key={mat.id} className={mat.stock < mat.reorder_point ? styles.lowStock : undefined}>
                <td>{mat.name}</td>
                <td>{mat.type}</td>
                <td>{mat.color}</td>
                <td>{mat.stock}</td>
                <td>{mat.unit}</td>
                <td>{mat.reorder_point}</td>
                <td>
                  <button>{t.table.addItem}</button>
                  <button>{t.table.remove}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

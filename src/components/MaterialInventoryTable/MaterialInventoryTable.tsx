import React from 'react';

// TODO: Replace with real types and data fetching
type Material = {
  id: string;
  name: string;
  type?: string | null;
  color?: string | null;
  unit: string;
  reorder_point: number;
  stock: number;
};

const mockMaterials: Material[] = [
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

export default function MaterialInventoryTable() {
  return (
    <div>
      <h2>Material Inventory</h2>
      <table role="table" aria-label="Material Inventory" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #222', padding: 4 }}>Material</th>
            <th style={{ border: '1px solid #222', padding: 4 }}>Type</th>
            <th style={{ border: '1px solid #222', padding: 4 }}>Color</th>
            <th style={{ border: '1px solid #222', padding: 4 }}>Stock</th>
            <th style={{ border: '1px solid #222', padding: 4 }}>Unit</th>
            <th style={{ border: '1px solid #222', padding: 4 }}>Reorder Point</th>
            <th style={{ border: '1px solid #222', padding: 4 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockMaterials.map((mat) => (
            <tr key={mat.id} style={{ background: mat.stock < mat.reorder_point ? '#ffeaea' : undefined }}>
              <td style={{ border: '1px solid #222', padding: 4 }}>{mat.name}</td>
              <td style={{ border: '1px solid #222', padding: 4 }}>{mat.type}</td>
              <td style={{ border: '1px solid #222', padding: 4 }}>{mat.color}</td>
              <td style={{ border: '1px solid #222', padding: 4 }}>{mat.stock}</td>
              <td style={{ border: '1px solid #222', padding: 4 }}>{mat.unit}</td>
              <td style={{ border: '1px solid #222', padding: 4 }}>{mat.reorder_point}</td>
              <td style={{ border: '1px solid #222', padding: 4 }}>
                <button style={{ marginRight: 4 }}>Add</button>
                <button>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
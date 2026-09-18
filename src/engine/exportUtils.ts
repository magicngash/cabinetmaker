import { CutPart, HardwareItem, Project } from '../types';

export function exportCuttingListToCSV(parts: CutPart[], projectName: string) {
  const headers = [
    'Part Name',
    'Cabinet',
    'Length (mm)',
    'Width (mm)',
    'Thickness (mm)',
    'Quantity',
    'Material',
    'Edge Banding',
    'Grain Direction',
    'Notes',
  ];

  const rows = parts.map((p) => [
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.cabinetName.replace(/"/g, '""')}"`,
    p.length,
    p.width,
    p.thickness,
    p.quantity,
    `"${p.material.replace(/"/g, '""')}"`,
    `"${p.edgeBanding.type}"`,
    `"${p.grainDirection}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${projectName.replace(/[^a-z0-9_-]/gi, '_')}_Cutting_List.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportHardwareToCSV(items: HardwareItem[], projectName: string) {
  const headers = ['Category', 'Hardware Name', 'Quantity', 'Unit', 'Unit Cost ($)', 'Total Cost ($)', 'Notes'];

  const rows = items.map((item) => [
    `"${item.category}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    item.quantity,
    `"${item.unit}"`,
    Number(item.unitCost ?? (item as any).unitPrice ?? 0).toFixed(2),
    Number(item.totalCost ?? ((item.quantity || 0) * Number(item.unitCost ?? 0))).toFixed(2),
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${projectName.replace(/[^a-z0-9_-]/gi, '_')}_Hardware_BOM.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}

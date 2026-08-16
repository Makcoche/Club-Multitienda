export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return `${day} ${months[monthIndex] || parts[1]} ${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function generateTransactionNumber(currentCount: number): string {
  const year = new Date().getFullYear();
  const sequence = String(currentCount + 1).padStart(4, '0');
  return `TRX-${year}-${sequence}`;
}

export function generateVIPCode(clientCount: number): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VIP-${randomSuffix}`;
}

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(';'),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header] ?? '';
          if (typeof val === 'string' && (val.includes(';') || val.includes('\n') || val.includes('"'))) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(';')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateDianHash(trxId: string, monto: number, nit: string): string {
  const seed = `${trxId}-${monto}-${nit}-${Date.now().toString(36)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  const randomSalt = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DIAN-CEB-2026-${hex}-${randomSalt}`;
}

export function computeTaxDeductionBreakdown(
  valorBrutoCompra: number,
  porcentajeCeb: number = 7,
  nitComercio: string = '900.123.456-1',
  trxId: string = 'TRX-PROVISIONAL'
) {
  const baseGravable = Math.round(valorBrutoCompra / 1.19); // Estimado base excluyendo IVA 19% si aplica
  const deduccionCebMonto = Math.round(valorBrutoCompra * (porcentajeCeb / 100));
  const liquidacionNetaComercio = valorBrutoCompra - deduccionCebMonto;
  // Art. 257 Estatuto Tributario Colombia: Descuento tributario en renta del 25% del valor donado
  const descuentoTributarioEstimadoDian = Math.round(deduccionCebMonto * 0.25);
  const certificadoDianHash = generateDianHash(trxId, deduccionCebMonto, nitComercio);

  return {
    valorBrutoCompra,
    baseGravable,
    deduccionCebPorcentaje: porcentajeCeb,
    deduccionCebMonto,
    liquidacionNetaComercio,
    descuentoTributarioEstimadoDian,
    certificadoDianHash,
  };
}

export function generateAuthorizationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function playSuccessSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Silent fail if audio context is blocked
  }
}

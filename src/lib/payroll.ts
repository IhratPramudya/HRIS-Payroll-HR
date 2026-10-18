/**
 * Kalkulasi payroll sederhana untuk konteks Indonesia.
 * CATATAN: Ini adalah pendekatan yang disederhanakan untuk tujuan
 * demonstrasi sistem, BUKAN pengganti perhitungan pajak resmi.
 * Untuk produksi, konsultasikan dengan konsultan pajak/payroll
 * dan sesuaikan dengan PTKP, tarif progresif PPh21 terbaru (termasuk
 * skema TER), serta ketentuan BPJS yang berlaku.
 */

export interface PayrollInput {
  baseSalary: number;
  allowance?: number;
  overtime?: number;
  deductionOther?: number;
}

export interface PayrollResult {
  baseSalary: number;
  allowance: number;
  overtime: number;
  bpjsKesehatan: number;
  bpjsKetenagakerjaan: number;
  pph21: number;
  deductionOther: number;
  grossPay: number;
  netPay: number;
}

const BPJS_KESEHATAN_RATE = 0.01; // 1% ditanggung karyawan
const BPJS_KETENAGAKERJAAN_RATE = 0.02; // 2% (JHT karyawan)

/** Tarif progresif PPh21 tahunan (skema lama, disederhanakan) */
function calculateAnnualPph21(annualTaxableIncome: number): number {
  const brackets: [number, number][] = [
    [60_000_000, 0.05],
    [250_000_000, 0.15],
    [500_000_000, 0.25],
    [5_000_000_000, 0.3],
    [Infinity, 0.35],
  ];

  let remaining = annualTaxableIncome;
  let tax = 0;
  let lowerBound = 0;

  for (const [upperBound, rate] of brackets) {
    const bracketSize = upperBound - lowerBound;
    const taxableInBracket = Math.min(remaining, bracketSize);
    if (taxableInBracket > 0) {
      tax += taxableInBracket * rate;
      remaining -= taxableInBracket;
    }
    lowerBound = upperBound;
    if (remaining <= 0) break;
  }

  return tax;
}

const PTKP_TK0 = 54_000_000; // PTKP tahunan, status TK/0 (sederhana)
const JABATAN_FEE_RATE = 0.05; // biaya jabatan 5%
const JABATAN_FEE_CAP_MONTHLY = 500_000;

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const baseSalary = input.baseSalary || 0;
  const allowance = input.allowance || 0;
  const overtime = input.overtime || 0;
  const deductionOther = input.deductionOther || 0;

  const grossMonthly = baseSalary + allowance + overtime;

  const bpjsKesehatan = Math.round(baseSalary * BPJS_KESEHATAN_RATE);
  const bpjsKetenagakerjaan = Math.round(baseSalary * BPJS_KETENAGAKERJAAN_RATE);

  const jabatanFee = Math.min(grossMonthly * JABATAN_FEE_RATE, JABATAN_FEE_CAP_MONTHLY);
  const monthlyTaxable = Math.max(
    0,
    grossMonthly - bpjsKesehatan - bpjsKetenagakerjaan - jabatanFee
  );
  const annualTaxable = Math.max(0, monthlyTaxable * 12 - PTKP_TK0);
  const annualTax = calculateAnnualPph21(annualTaxable);
  const pph21 = Math.round(annualTax / 12);

  const grossPay = grossMonthly;
  const netPay =
    grossPay - bpjsKesehatan - bpjsKetenagakerjaan - pph21 - deductionOther;

  return {
    baseSalary,
    allowance,
    overtime,
    bpjsKesehatan,
    bpjsKetenagakerjaan,
    pph21,
    deductionOther,
    grossPay,
    netPay,
  };
}

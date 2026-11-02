/**
 * fairEconomyEngine.js
 * LifeGraph v0.1 Prototype - Fair Economic Ledger & Debt Servicing Engine
 * 
 * Core Design:
 * 1. Debts never vanish miraculously across life or succession.
 * 2. Cash never silently goes negative: missed payments become Overdue Debt + Burnout + Insolvency Risk.
 * 3. Transparent amortization, net worth calculation, and credit health status.
 */

import crypto from 'crypto';

export const DEBT_STATUS = {
  CURRENT: 'CURRENT',
  OVERDUE: 'OVERDUE',
  DEFAULTED: 'DEFAULTED',
  SETTLED: 'SETTLED'
};

export const SOLVENCY_STATUS = {
  HEALTHY: 'HEALTHY',     // Net worth > 0, debt-to-asset < 40%, no overdue
  STRESSED: 'STRESSED',   // Debt-to-asset 40-70%, tight cash flow
  CRITICAL: 'CRITICAL',   // Overdue payments > 0 or debt-to-asset > 80%
  INSOLVENT: 'INSOLVENT'  // Net worth < 0 and 2+ years of missed payments
};

/**
 * Tạo một khoản nợ mới
 */
export function createDebtRecord({
  id = null,
  name,
  type = 'MORTGAGE', // 'MORTGAGE' | 'BUSINESS' | 'CONSUMER' | 'FAMILY'
  principal,
  interest_rate = 0.06,
  term_years = 15,
  annual_payment = null,
  start_year
}) {
  const p = Number(principal) || 0;
  const r = Number(interest_rate) || 0.06;
  const n = Number(term_years) || 15;

  // Tính thanh toán hàng năm theo công thức niên kim nếu chưa cung cấp
  let payment = Number(annual_payment);
  if (!payment || payment <= 0) {
    if (r > 0) {
      payment = Math.round(p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    } else {
      payment = Math.round(p / n);
    }
  }

  return {
    id: id || crypto.randomUUID(),
    name,
    type,
    principal: p,
    initial_principal: p,
    interest_rate: r,
    term_years: n,
    annual_payment: payment,
    remaining_years: n,
    overdue_amount: 0,
    overdue_consecutive_years: 0,
    status: DEBT_STATUS.CURRENT,
    created_year: start_year
  };
}

/**
 * Xử lý thanh toán nợ hàng năm trong tick (Annual Tick Debt Servicing)
 * @param {Object} character - Nhân vật hiện tại (có cash, burnout, flags)
 * @param {Array} debts - Danh sách các khoản nợ
 * @param {number} currentYear - Năm hiện tại
 * @returns {Object} { debts, character, paymentLog, totalPaid, totalOverdueAdded, statusChanged }
 */
export function processAnnualDebts(character, debts = [], currentYear) {
  const updatedDebts = [];
  let availableCash = Math.max(0, Number(character.cash) || 0);
  let totalPaidThisYear = 0;
  let totalNewOverdue = 0;
  const paymentLog = [];
  let severeStressEncountered = false;

  for (const rawDebt of debts) {
    const debt = { ...rawDebt };

    // Bỏ qua nợ đã giải quyết
    if (debt.status === DEBT_STATUS.SETTLED || debt.principal <= 0) {
      debt.status = DEBT_STATUS.SETTLED;
      debt.principal = 0;
      debt.overdue_amount = 0;
      updatedDebts.push(debt);
      continue;
    }

    // Khoản cần thanh toán năm nay: tiền gốc/lãi kỳ này + tiền quá hạn tích lũy từ trước
    const interestPart = Math.round(debt.principal * (debt.interest_rate || 0.05));
    const scheduledPayment = debt.annual_payment;
    const totalDue = scheduledPayment + debt.overdue_amount;

    if (availableCash >= totalDue) {
      // Đủ tiền trả toàn bộ
      availableCash -= totalDue;
      totalPaidThisYear += totalDue;

      // Trả hết nợ quá hạn trước
      debt.overdue_amount = 0;
      debt.overdue_consecutive_years = 0;
      debt.status = DEBT_STATUS.CURRENT;

      // Giảm nợ gốc sau khi trừ phần lãi
      const principalRepaid = Math.max(0, scheduledPayment - interestPart);
      debt.principal = Math.max(0, debt.principal - principalRepaid);
      debt.remaining_years = Math.max(0, (debt.remaining_years || 1) - 1);

      if (debt.principal <= 0 || debt.remaining_years <= 0) {
        debt.status = DEBT_STATUS.SETTLED;
        debt.principal = 0;
        paymentLog.push({
          debtId: debt.id,
          name: debt.name,
          paid: totalDue,
          settled: true,
          message: `Đã tất toán toàn bộ khoản vay "${debt.name}"!`
        });
      } else {
        paymentLog.push({
          debtId: debt.id,
          name: debt.name,
          paid: totalDue,
          remaining: debt.principal,
          message: `Thanh toán đầy đủ $${totalDue.toLocaleString()} cho "${debt.name}". Gốc còn lại: $${debt.principal.toLocaleString()}`
        });
      }
    } else if (availableCash > 0) {
      // Chỉ đủ tiền trả một phần
      const paid = availableCash;
      availableCash = 0;
      totalPaidThisYear += paid;

      const shortfall = totalDue - paid;
      debt.overdue_amount += shortfall;
      debt.overdue_consecutive_years = (debt.overdue_consecutive_years || 0) + 1;
      totalNewOverdue += shortfall;
      severeStressEncountered = true;

      if (debt.overdue_consecutive_years >= 3) {
        debt.status = DEBT_STATUS.DEFAULTED;
      } else {
        debt.status = DEBT_STATUS.OVERDUE;
      }

      paymentLog.push({
        debtId: debt.id,
        name: debt.name,
        paid,
        shortfall,
        status: debt.status,
        message: `Trả được $${paid.toLocaleString()}, còn thiếu $${shortfall.toLocaleString()} chuyển sang nợ quá hạn.`
      });
    } else {
      // Hoàn toàn không còn tiền để trả
      const shortfall = totalDue;
      debt.overdue_amount += shortfall;
      debt.overdue_consecutive_years = (debt.overdue_consecutive_years || 0) + 1;
      totalNewOverdue += shortfall;
      severeStressEncountered = true;

      if (debt.overdue_consecutive_years >= 3) {
        debt.status = DEBT_STATUS.DEFAULTED;
      } else {
        debt.status = DEBT_STATUS.OVERDUE;
      }

      paymentLog.push({
        debtId: debt.id,
        name: debt.name,
        paid: 0,
        shortfall,
        status: debt.status,
        message: `Không đủ tiền đóng hạn định! Phát sinh thêm $${shortfall.toLocaleString()} nợ quá hạn.`
      });
    }

    updatedDebts.push(debt);
  }

  // Cập nhật lại tiền mặt nhân vật (đảm bảo không bao giờ âm)
  character.cash = Math.max(0, availableCash);

  // Áp lực nợ quá hạn gây tăng Burnout và tổn hại niềm tin gia đình
  if (severeStressEncountered || totalNewOverdue > 0) {
    character.burnout = Math.min(100, (Number(character.burnout) || 0) + 10);
    if (!character.hidden_flags) character.hidden_flags = [];
    if (!character.hidden_flags.includes('had_overdue_debt')) {
      character.hidden_flags.push('had_overdue_debt');
    }
  }

  return {
    debts: updatedDebts,
    character,
    paymentLog,
    totalPaidThisYear,
    totalNewOverdue
  };
}

/**
 * Tính toán Giá trị tài sản ròng (Net Worth) và Đánh giá khả năng thanh toán (Solvency)
 */
export function calculateNetWorth(character, assets = [], debts = []) {
  const cash = Math.max(0, Number(character.cash) || 0);

  // Tổng giá trị tài sản
  let totalAssetValue = 0;
  if (Array.isArray(assets)) {
    for (const a of assets) {
      totalAssetValue += Number(a.current_value || a.value || a.price || 0);
    }
  }

  // Tổng nợ gốc và nợ quá hạn
  let totalPrincipalDebt = 0;
  let totalOverdue = 0;
  let hasDefaultedDebt = false;

  if (Array.isArray(debts)) {
    for (const d of debts) {
      if (d.status !== DEBT_STATUS.SETTLED) {
        totalPrincipalDebt += Number(d.principal) || 0;
        totalOverdue += Number(d.overdue_amount) || 0;
        if (d.status === DEBT_STATUS.DEFAULTED) {
          hasDefaultedDebt = true;
        }
      }
    }
  }

  const totalLiabilities = totalPrincipalDebt + totalOverdue;
  const netWorth = (cash + totalAssetValue) - totalLiabilities;

  // Xác định trạng thái khả năng trả nợ (Solvency Status)
  let solvency = SOLVENCY_STATUS.HEALTHY;
  const totalAssets = cash + totalAssetValue;

  if (totalLiabilities === 0) {
    solvency = SOLVENCY_STATUS.HEALTHY;
  } else if (netWorth < 0 && (totalOverdue > 0 || hasDefaultedDebt)) {
    solvency = SOLVENCY_STATUS.INSOLVENT;
  } else if (totalOverdue > 0 || (totalAssets > 0 && totalLiabilities / totalAssets > 0.8)) {
    solvency = SOLVENCY_STATUS.CRITICAL;
  } else if (totalAssets > 0 && totalLiabilities / totalAssets > 0.45) {
    solvency = SOLVENCY_STATUS.STRESSED;
  }

  return {
    cash,
    totalAssetValue,
    totalPrincipalDebt,
    totalOverdue,
    totalLiabilities,
    netWorth,
    net_worth: netWorth,
    solvency,
    debtToAssetRatio: totalAssets > 0 ? (totalLiabilities / totalAssets) : (totalLiabilities > 0 ? 999 : 0)
  };
}

/**
 * Trả bớt một phần hoặc toàn bộ nợ chủ động từ tiền mặt của người chơi
 */
export function payDebtDirectly(character, debts, debtId, payAmount) {
  const amount = Number(payAmount) || 0;
  if (amount <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0');
  if ((character.cash || 0) < amount) throw new Error('Không đủ tiền mặt để thanh toán số nợ này');

  const debtIndex = debts.findIndex(d => d.id === debtId);
  if (debtIndex === -1) throw new Error('Không tìm thấy khoản nợ được chỉ định');

  const debt = { ...debts[debtIndex] };
  let remainingPay = amount;

  // 1. Trả nợ quá hạn trước
  if (debt.overdue_amount > 0) {
    const overduePay = Math.min(debt.overdue_amount, remainingPay);
    debt.overdue_amount -= overduePay;
    remainingPay -= overduePay;
    if (debt.overdue_amount === 0) {
      debt.overdue_consecutive_years = 0;
      debt.status = DEBT_STATUS.CURRENT;
    }
  }

  // 2. Trả nợ gốc
  if (remainingPay > 0 && debt.principal > 0) {
    const principalPay = Math.min(debt.principal, remainingPay);
    debt.principal -= principalPay;
    remainingPay -= principalPay;
  }

  if (debt.principal <= 0 && debt.overdue_amount <= 0) {
    debt.status = DEBT_STATUS.SETTLED;
    debt.principal = 0;
    debt.overdue_amount = 0;
  }

  // Khấu trừ tiền mặt
  const actualPaid = amount - remainingPay;
  character.cash = Math.max(0, character.cash - actualPaid);
  debts[debtIndex] = debt;

  return {
    character,
    debts,
    actualPaid,
    updatedDebt: debt
  };
}

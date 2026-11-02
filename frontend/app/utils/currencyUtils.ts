// Multi-Currency & Native Financial Conversion Engine (LifeGraph V8.5)
// Formats wealth according to character nationality and provides live Vietnamese Dong (VNĐ) equivalent

export interface FormattedCurrencyResult {
  primary: string;
  secondaryVnd: string;
  nativeCode: string;
  nativeSymbol: string;
  rawNativeValue: number;
  rawVndValue: number;
}

interface CurrencyRate {
  code: string;
  symbol: string;
  rateToUsd: number; // 1 USD = rateToUsd in this currency
  name: string;
}

const NATION_CURRENCIES: { [key: string]: CurrencyRate } = {
  "việt nam": { code: "VND", symbol: "₫", rateToUsd: 25000, name: "Việt Nam Đồng" },
  "vietnam": { code: "VND", symbol: "₫", rateToUsd: 25000, name: "Việt Nam Đồng" },
  "ba lan": { code: "PLN", symbol: "zł", rateToUsd: 4.0, name: "Złoty Ba Lan" },
  "poland": { code: "PLN", symbol: "zł", rateToUsd: 4.0, name: "Złoty Ba Lan" },
  "nhật bản": { code: "JPY", symbol: "¥", rateToUsd: 150, name: "Yên Nhật" },
  "japan": { code: "JPY", symbol: "¥", rateToUsd: 150, name: "Yên Nhật" },
  "hàn quốc": { code: "KRW", symbol: "₩", rateToUsd: 1350, name: "Won Hàn Quốc" },
  "korea": { code: "KRW", symbol: "₩", rateToUsd: 1350, name: "Won Hàn Quốc" },
  "đức": { code: "EUR", symbol: "€", rateToUsd: 0.92, name: "Euro" },
  "germany": { code: "EUR", symbol: "€", rateToUsd: 0.92, name: "Euro" },
  "vương quốc anh": { code: "GBP", symbol: "£", rateToUsd: 0.78, name: "Bảng Anh" },
  "uk": { code: "GBP", symbol: "£", rateToUsd: 0.78, name: "Bảng Anh" },
  "hoa kỳ": { code: "USD", symbol: "$", rateToUsd: 1.0, name: "Đô la Mỹ" },
  "mỹ": { code: "USD", symbol: "$", rateToUsd: 1.0, name: "Đô la Mỹ" },
  "usa": { code: "USD", symbol: "$", rateToUsd: 1.0, name: "Đô la Mỹ" },
  "thái lan": { code: "THB", symbol: "฿", rateToUsd: 36, name: "Baht Thái" },
  "thailand": { code: "THB", symbol: "฿", rateToUsd: 36, name: "Baht Thái" },
  "na uy": { code: "NOK", symbol: "kr", rateToUsd: 10.8, name: "Krone Na Uy" },
  "norway": { code: "NOK", symbol: "kr", rateToUsd: 10.8, name: "Krone Na Uy" },
  "thụy sĩ": { code: "CHF", symbol: "CHF", rateToUsd: 0.90, name: "Franc Thụy Sĩ" },
  "switzerland": { code: "CHF", symbol: "CHF", rateToUsd: 0.90, name: "Franc Thụy Sĩ" },
  "brazil": { code: "BRL", symbol: "R$", rateToUsd: 5.6, name: "Real Brazil" },
  "brasil": { code: "BRL", symbol: "R$", rateToUsd: 5.6, name: "Real Brazil" },
  "haiti": { code: "HTG", symbol: "G", rateToUsd: 132, name: "Gourde Haiti" },
  "syria": { code: "SYP", symbol: "£S", rateToUsd: 2500, name: "Bảng Syria" },
  "somalia": { code: "SOS", symbol: "Sh", rateToUsd: 570, name: "Shilling Somalia" }
};

function formatVndShort(vnd: number): string {
  const isNeg = vnd < 0;
  const abs = Math.abs(vnd);
  let formatted = "";

  if (abs >= 1000000000) {
    formatted = `${(abs / 1000000000).toFixed(2).replace(/\.?0+$/, '')} Tỷ ₫`;
  } else if (abs >= 1000000) {
    formatted = `${(abs / 1000000).toFixed(1).replace(/\.?0+$/, '')} Tr ₫`;
  } else {
    formatted = `${Math.round(abs).toLocaleString('vi-VN')} ₫`;
  }

  return isNeg ? `-${formatted}` : formatted;
}

export function formatCurrency(usdAmount: number, nationality: string = "Việt Nam"): FormattedCurrencyResult {
  const normNation = (nationality || "Việt Nam").toLowerCase().trim();
  const curr = NATION_CURRENCIES[normNation] || NATION_CURRENCIES["hoa kỳ"];

  const nativeValue = Math.round(usdAmount * curr.rateToUsd);
  const vndValue = Math.round(usdAmount * 25000);

  const isNeg = usdAmount < 0;
  const absNative = Math.abs(nativeValue);
  let primaryStr = "";

  if (curr.code === "VND") {
    primaryStr = formatVndShort(nativeValue);
    const absUsd = Math.abs(usdAmount);
    const usdStr = absUsd >= 1000000 
      ? `$${(absUsd / 1000000).toFixed(2)}M USD`
      : `$${Math.round(absUsd).toLocaleString('en-US')} USD`;
    return {
      primary: primaryStr,
      secondaryVnd: `(${isNeg ? '-' : ''}${usdStr})`,
      nativeCode: curr.code,
      nativeSymbol: curr.symbol,
      rawNativeValue: nativeValue,
      rawVndValue: vndValue
    };
  }

  // Non-VND currencies
  if (curr.code === "USD") {
    primaryStr = `${isNeg ? '-$' : '$'}${absNative.toLocaleString('en-US')}`;
  } else if (curr.code === "JPY" || curr.code === "KRW") {
    primaryStr = `${curr.symbol}${isNeg ? '-' : ''}${absNative.toLocaleString()}`;
  } else {
    primaryStr = `${isNeg ? '-' : ''}${absNative.toLocaleString()} ${curr.symbol}`;
  }

  const secondaryStr = `(≈ ${formatVndShort(vndValue)})`;

  return {
    primary: primaryStr,
    secondaryVnd: secondaryStr,
    nativeCode: curr.code,
    nativeSymbol: curr.symbol,
    rawNativeValue: nativeValue,
    rawVndValue: vndValue
  };
}

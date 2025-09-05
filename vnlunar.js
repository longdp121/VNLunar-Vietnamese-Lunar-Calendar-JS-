// vnlunar.js — JS translation of the provided Lua from https://vi.wikipedia.org/wiki/M%C3%B4_%C4%91un:%C3%82m_l%E1%BB%8Bch#Tham_kh%E1%BA%A3o

// ---- helpers ----
function toInt(n) {
  // Lua's toint chopped off the fractional part toward zero
  return Math.trunc(Number(n));
}

// ---- Julian Day conversions ----
function UniversalToJD(D, M, Y) {
  let JD;
  if (Y > 1582 || (Y === 1582 && M > 10) || (Y === 1582 && M === 10 && D > 14)) {
    JD = 367 * Y
      - toInt(7 * (Y + toInt((M + 9) / 12)) / 4)
      - toInt(3 * (toInt((Y + (M - 9) / 7) / 100) + 1) / 4)
      + toInt(275 * M / 9) + D + 1721028.5;
  } else {
    JD = 367 * Y
      - toInt(7 * (Y + 5001 + toInt((M - 9) / 7)) / 4)
      + toInt(275 * M / 9) + D + 1729776.5;
  }
  return JD;
}

function UniversalFromJD(JD) {
  let Z = toInt(JD + 0.5);
  let F = (JD + 0.5) - Z;
  let A;
  if (Z < 2299161) {
    A = Z;
  } else {
    const alpha = toInt((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - toInt(alpha / 4);
  }
  const B = A + 1524;
  const C = toInt((B - 122.1) / 365.25);
  const D = toInt(365.25 * C);
  const E = toInt((B - D) / 30.6001);
  const dd = toInt(B - D - toInt(30.6001 * E) + F);
  const mm = (E < 14) ? (E - 1) : (E - 13);
  const yyyy = (mm < 3) ? (C - 4715) : (C - 4716);
  return [dd, mm, yyyy];
}

function LocalFromJD(JD, utc) {
  return UniversalFromJD(JD + utc / 24.0);
}

function LocalToJD(D, M, Y, utc) {
  return UniversalToJD(D, M, Y) - utc / 24.0;
}

// ---- Astronomy core ----
function NewMoon(k) {
  const pi = Math.PI;
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = pi / 180;

  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr); // Mean new moon

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3; // Sun anomaly
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3; // Moon anomaly
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3; // Argument of latitude

  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));

  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return JdNew;
}

function SunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;

  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  const twoPi = 2 * Math.PI;
  L = L - twoPi * toInt(L / twoPi); // normalize to [0, 2π)
  return L;
}

function LunarMonth11(Y, utc) {
  const off = LocalToJD(31, 12, Y, utc) - 2415021.076998695;
  const k = toInt(off / 29.530588853);
  let jd = NewMoon(k);
  const ret = LocalFromJD(jd, utc);
  const sunLong = SunLongitude(LocalToJD(ret[0], ret[1], ret[2], utc)); // local midnight
  if (sunLong > (3 * Math.PI) / 2) {
    jd = NewMoon(k - 1);
  }
  return LocalFromJD(jd, utc); // [d, m, y]
}

// Returns:
//  b=1 -> list of month start days
//  b=2 -> list of months
//  b=3 -> list of years (per month start)
//  b=4 -> list of lunar month numbers (0..11, where 0 == 12th month)
//  b=5 -> list of leap flags (1 if leap month, else 0)
//  otherwise -> length of the year sequence (13 or 14)
function LunarYear(Y, b, utc) {
  const ret1 = []; // day
  const ret2 = []; // month
  const ret3 = []; // year
  const ret4 = []; // lunar month number mod 12
  const ret5 = []; // leap flags

  const month11A = LunarMonth11(Y - 1, utc);
  const jdMonth11A = LocalToJD(month11A[0], month11A[1], month11A[2], utc);
  const k = Math.floor(0.5 + (jdMonth11A - 2415021.076998695) / 29.530588853);

  const month11B = LunarMonth11(Y, utc);
  const off = LocalToJD(month11B[0], month11B[1], month11B[2], utc) - jdMonth11A;

  const leap = off > 365.0;
  const retlength = leap ? 14 : 13;

  // 1-based indexing to mirror Lua
  ret1[1] = month11A[0]; ret2[1] = month11A[1]; ret3[1] = month11A[2]; ret4[1] = 0; ret5[1] = 0;
  ret1[retlength] = month11B[0]; ret2[retlength] = month11B[1]; ret3[retlength] = month11B[2];
  ret4[retlength] = 0; ret5[retlength] = 0;

  for (let i = 2; i <= retlength - 1; i++) {
    const nm = NewMoon(k + i - 1);
    const a = LocalFromJD(nm, utc);
    ret1[i] = a[0]; ret2[i] = a[1]; ret3[i] = a[2]; ret4[i] = 0; ret5[i] = 0;
  }

  for (let i = 1; i <= retlength; i++) {
    ret4[i] = (i + 10) % 12; // month number mapping
  }

  if (leap) {
    const sunLongitudes = [];
    sunLongitudes[retlength + 1] = 0;
    for (let i = 1; i <= retlength; i++) {
      const jdAtMonthBegin = LocalToJD(ret1[i], ret2[i], ret3[i], utc);
      sunLongitudes[i] = SunLongitude(jdAtMonthBegin);
    }
    let found = false;
    for (let i = 1; i <= retlength; i++) {
      if (found) ret4[i] = (i + 9) % 12;
      const sl1 = sunLongitudes[i];
      const sl2 = sunLongitudes[i + 1];
      if (Math.floor(sl1 / Math.PI * 6) === Math.floor(sl2 / Math.PI * 6)) {
        found = true;
        ret5[i] = 1;
        ret4[i] = (i + 9) % 12;
      }
    }
  }

  switch (b) {
    case 1: return ret1;
    case 2: return ret2;
    case 3: return ret3;
    case 4: return ret4;
    case 5: return ret5;
    default: return retlength;
  }
}

function Solar2Lunar(D, M, Y, utc) {
  let yy = Y;

  let ly1 = LunarYear(Y, 1, utc);
  let ly2 = LunarYear(Y, 2, utc);
  let ly3 = LunarYear(Y, 3, utc);
  let ly4 = LunarYear(Y, 4, utc);
  let ly5 = LunarYear(Y, 5, utc);

  const month11length = LunarYear(Y, 6, utc);
  const month11 = [ly1[month11length], ly2[month11length], ly3[month11length]];

  const jdToday = LocalToJD(D, M, Y, utc);
  const jdMonth11 = LocalToJD(month11[0], month11[1], month11[2], utc);

  if (jdToday >= jdMonth11) {
    ly1 = LunarYear(Y + 1, 1, utc);
    ly2 = LunarYear(Y + 1, 2, utc);
    ly3 = LunarYear(Y + 1, 3, utc);
    ly4 = LunarYear(Y + 1, 4, utc);
    ly5 = LunarYear(Y + 1, 5, utc);
    yy = Y + 1;
  }

  let i = LunarYear(Y, 6, utc);
  while (i > 1 && jdToday < LocalToJD(ly1[i], ly2[i], ly3[i], utc)) {
    i = i - 1;
  }
  const dd = toInt(jdToday - LocalToJD(ly1[i], ly2[i], ly3[i], utc)) + 1;
  const mm = ly4[i];
  if (mm >= 11 || mm === 0) yy = yy - 1;
  return [dd, mm, yy, ly5[i] || 0]; // [day, lunarMonthIndex(0..11 where 0==12), year, leapFlag]
}

// Lua version formats string directly; here we keep that behavior.
// DF: same tokens as Lua ('full','jMY','dFY','dm','d-m-y','jM','dM','Y','j','d','n','m','M','F')
function Lunar2Solar(D, M, Y, utc, DF, leap) {
  let yy = Y;
  if (M >= 11) yy = Y + 1;

  const lm1 = LunarYear(yy, 1, utc);
  const lm2 = LunarYear(yy, 2, utc);
  const lm3 = LunarYear(yy, 3, utc);
  const lm4 = LunarYear(yy, 4, utc);
  const lm5 = LunarYear(yy, 5, utc);
  const length = LunarYear(yy, 6, utc);

  let lunarMonth = null;
  let MM = (M === 12) ? 0 : M;

  for (let i = 1; i <= length; i++) {
    if (lm4[i] === MM && (lm5[i] || 0) === (leap ? 1 : 0)) {
      lunarMonth = [lm1[i], lm2[i], lm3[i]];
      break;
    }
  }

  if (!lunarMonth) return "Lỗi nhập!";

  const jd = LocalToJD(lunarMonth[0], lunarMonth[1], lunarMonth[2], utc);
  const dmy = LocalFromJD(jd + D - 1, utc); // [d,m,y]

  const pad2 = (n) => String(n).padStart(2, '0');

  switch (DF) {
    case 'full': return `ngày ${dmy[0]} tháng ${dmy[1]} năm ${dmy[2]}`;
    case 'jMY':  return `${dmy[0]} tháng ${dmy[1]} năm ${dmy[2]}`;
    case 'dFY':  return `${pad2(dmy[0])} tháng ${pad2(dmy[1])} năm ${dmy[2]}`;
    case 'dm':   return `${pad2(dmy[0])}${pad2(dmy[1])}`;
    case 'd-m-y':return `${pad2(dmy[0])}-${pad2(dmy[1])}-${pad2(dmy[2])}`;
    case 'jM':   return `${dmy[0]} tháng ${dmy[1]}`;
    case 'dM':   return `${pad2(dmy[0])} tháng ${dmy[1]}`;
    case 'Y':    return `${dmy[2]}`;
    case 'j':    return `${dmy[0]}`;
    case 'd':    return `${pad2(dmy[0])}`;
    case 'n':    return `${dmy[1]}`;
    case 'm':    return `${pad2(dmy[1])}`;
    case 'M':    return `tháng ${dmy[1]}`;
    case 'F':    return `tháng ${pad2(dmy[1])}`;
    default:     return `${dmy[0]}-${dmy[1]}-${dmy[2]}`;
  }
}

// ---- Can Chi ----
function canchi(x) {
  const a = x % 10;
  const b = x % 12;
  const can = {
    1: "Giáp", 2: "Ất", 3: "Bính", 4: "Đinh", 5: "Mậu",
    6: "Kỷ", 7: "Canh", 8: "Tân", 9: "Nhâm", 0: "Quý"
  }[a];
  const chi = {
    1: "Tý", 2: "Sửu", 3: "Dần", 4: "Mão", 5: "Thìn", 6: "Tỵ",
    7: "Ngọ", 8: "Mùi", 9: "Thân", 10: "Dậu", 11: "Tuất", 0: "Hợi"
  }[b];
  return `${can} ${chi}`;
}

// ---- main formatting (mirror Lua p.main) ----
function main(D, M, Y, DF, utc) {
  const LunarDM = Solar2Lunar(D, M, Y, utc);
  let ngay = LunarDM[0];
  let thang = (LunarDM[1] === 0) ? 12 : LunarDM[1];
  let nam = LunarDM[2];
  const nhuan = (LunarDM[3] === 1) ? " (nhuận)" : "";

  const canchinam = canchi(nam + 57);
  const canchithang = canchi(nam * 12 + thang + 14);
  const canchingay = canchi(toInt(LocalToJD(D, M, Y, utc) + 51.5));

  const pad2 = (n) => String(n).padStart(2, '0');

  switch (DF) {
    case 'full':
      if (ngay < 11) return `mồng ${ngay} tháng ${thang}${nhuan} năm ${canchinam}`;
      return `ngày ${ngay} tháng ${thang}${nhuan} năm ${canchinam}`;
    case 'dm':      return `${pad2(ngay)}${pad2(thang)}`;
    case 'jM':      return `${ngay} tháng ${pad2(thang)}${nhuan}`;
    case 'dM':      return `${pad2(ngay)} tháng ${thang}${nhuan}`;
    case 'Y':       return `${canchi}`; // matches the Lua (note: Lua seems to have a small bug here)
    case 'j':       return `${ngay}`;
    case 'd':       return `${pad2(ngay)}`;
    case 'n':       return `${thang}`;
    case 'm':       return `${pad2(thang)}`;
    case 'M':       return `tháng ${thang}`;
    case 'F':       return `tháng ${pad2(thang)}`;
    case 'YY':      return `${canchinam}`;
    case 'MM':      return `${canchithang}`;
    case 'DD':      return `${canchingay}`;
    case 'DDMMYY':  return `ngày ${canchingay} tháng ${canchithang} năm ${canchinam}`;
    default:        return `ngày ${ngay} tháng ${thang}${nhuan} năm ${canchinam}`;
  }
}

// ---- exports ----
const VNLunar = {
  toInt,
  UniversalToJD,
  UniversalFromJD,
  LocalFromJD,
  LocalToJD,
  NewMoon,
  SunLongitude,
  LunarMonth11,
  LunarYear,
  Solar2Lunar,
  Lunar2Solar,
  canchi,
  main,
};

(function attachGlobal(root) {
  // attach once, avoid overwriting
  if (!root.VNLunar) root.VNLunar = VNLunar;
})(typeof window !== "undefined" ? window : globalThis);

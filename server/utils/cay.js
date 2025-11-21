function calculateCAY() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = January, 7 = August

  let cayStartYear, cayEndYear;

  if (currentMonth >= 7) { // August or later
    cayStartYear = currentYear;
    cayEndYear = currentYear + 1;
  } else { // Before August
    cayStartYear = currentYear - 1;
    cayEndYear = currentYear;
  }

  const formatYear = (start, end) => `${start}-${String(end).slice(2)}`;

  const CAY = formatYear(cayStartYear, cayEndYear);
  const CAYm1 = formatYear(cayStartYear - 1, cayEndYear - 1);
  const CAYm2 = formatYear(cayStartYear - 2, cayEndYear - 2);
  const CAYm3 = formatYear(cayStartYear - 3, cayEndYear - 3);

  console.log("Current Academic Year (CAY):", CAY);
  console.log("CAYm1:", CAYm1, "CAYm2:", CAYm2, "CAYm3:", CAYm3);

  return { CAY, year1: CAYm1, year2: CAYm2, year3: CAYm3 };
}
console.log(calculateCAY());
export { calculateCAY };
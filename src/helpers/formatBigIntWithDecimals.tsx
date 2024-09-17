export const formatBigIntWithDecimals = (
  bigintValue: bigint,
  decimalPlaces: number,
) => {
  const bigIntStr = bigintValue.toString();
  const intPart = bigIntStr.slice(0, -decimalPlaces) || "0";
  const decimalPart = bigIntStr
    .slice(-decimalPlaces)
    .padStart(decimalPlaces, "0");
  return `${intPart}.${decimalPart}`;
};

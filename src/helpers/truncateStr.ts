export const truncateStr = (str: string, size: number = 4): string => {
  if (2 * size >= str.length) {
    return str;
  }

  return str.substring(0, size) + "..." + str.substring(str.length - size);
};

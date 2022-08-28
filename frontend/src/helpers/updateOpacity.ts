const RGB_REPLACE_RULE = new RegExp('[\\d\\.]+\\)$', 'g');

const addHexZero = (str: string) => (str.length === 1 ? `0${str}` : str);
const addOpacity = (rgbString: string, opacity: number) => {
  if (rgbString.startsWith('#')) {
    const hexOpacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return rgbString + addHexZero(hexOpacity.toString(16).toUpperCase());
  }
  if (rgbString.startsWith('rgba')) {
    return rgbString.replace(RGB_REPLACE_RULE, `${opacity})` as any);
  }
  return rgbString.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
};
export default addOpacity;

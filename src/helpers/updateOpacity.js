const addOpacity = (rgbString, opacity) => rgbString.replace(/[^,]+(?=\))/, opacity);
export default addOpacity;

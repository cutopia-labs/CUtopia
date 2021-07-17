export default function jsonToForm(json: object) {
  const formBody = [];
  for (const property in json) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(json[property]);
    formBody.push(`${encodedKey}=${encodedValue}`);
  }
  return formBody.join('&');
}
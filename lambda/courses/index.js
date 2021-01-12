const fs = require('fs');
const acct = JSON.parse(fs.readFileSync("./ACCT.json", "utf8"));
const courses_codes = acct.map(course => ({
  code: course["code"],
  title: course["title"],
}));

exports.handler = async (event, context) => {
  // console.log(JSON.stringify(event));

  const params = event["queryStringParameters"];
  if (params) {
    const code = params["code"];
    if (code) {
      const course = acct.find(course => course["code"] === code);
      return Promise.resolve({
        statusCode: 200,
        body: course ? JSON.stringify(course) : `The course with course code ${code} is not found.`
      });
    }
  }
  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify(courses_codes),
  });
};

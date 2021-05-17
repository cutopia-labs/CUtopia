const extractContent = html => html
  .replace(/<\/?[^>]+(>|$)/g, '\n')
  .replace(/\&nbsp;/g, '')
  .split('\n');

const convertWeekday = weekdayString => {
  switch (weekdayString) {
    case 'Monday':
      return 1;
    case 'Tuesday':
      return 2;
    case 'Wednesday':
      return 3;
    case 'Thursday':
      return 4;
    case 'Friday':
      return 5;
    case 'Saturday':
      return 6;
    case 'Sunday':
      return 7;
    default:
      return 'TBA';
  }
};

const to24Hours = str => {
  const timeParts = str.split(':');
  if (str.includes('AM') || str.substring(0, 2) === '12') {
    return `${parseInt(timeParts[0], 10)}:${parseInt(timeParts[1], 10)}`;
  }

  return `${parseInt(timeParts[0], 10) + 12}:${parseInt(timeParts[1], 10)}`;
};

const parseTimeStr = str => {
  const rawTimeParts = str.split(' ');
  return [to24Hours(rawTimeParts[0]), to24Hours(rawTimeParts[2])]; // first is startTime, second is endTime
};

const isUseful = line => (line.includes('( ') && line.includes(' )')) || (line.includes('Location') && line.length > 4) || line.includes('Days:') || line.includes('Times:');

const preprocessing = html => { // Take the page HTML and return an Array of Course Related Lines
  const courseRawArrays = [];
  let temp = []; // Temp array storing lines
  let counter = null;
  let currentCourseName = null;

  // Filters the tags and get all text inside
  const innerTexts = extractContent(html).filter(s => s !== '' && s !== ']]>');
  console.log(innerTexts);

  // Find corresponding text for each course, and arrange in order
  for (let i = 0; i < innerTexts.length; i++) {
    if (counter === null) {
      if (innerTexts[i].includes('Show Detail View')) { // Start parsing the course related lines
        counter = 0;
      }
      continue;
    }

    if (innerTexts[i] === 'Subject Catalog' || i === innerTexts.length - 1) { // Means one course parsing ended
      isUseful(innerTexts[i]) && temp.push(innerTexts[i]);
      innerTexts[i - 1].includes('Location') && !innerTexts[i].includes('(') && temp.push(`Location${innerTexts[i]}`);
      if (!counter && !temp.length) {
        currentCourseName = `${innerTexts[i - 1]} ${innerTexts[i + 1]}`;
        continue;
      }
      temp.unshift(currentCourseName); // add course name to the top of List
      courseRawArrays.push(temp);
      temp = [];
      currentCourseName = i === innerTexts.length - 1 ? innerTexts[i - 1] : `${innerTexts[i - 1]} ${innerTexts[i + 1]}`;
      counter++;
      continue;
    }
    isUseful(innerTexts[i]) && temp.push(innerTexts[i]);
    innerTexts[i - 1].includes('Location') && !innerTexts[i].includes('(') && temp.push(`Location${innerTexts[i]}`);
  }
  return courseRawArrays;
};

const processSection = (times, locations, days) => { // pass by value?
  const startTimes = [];
  const endTimes = [];
  times.forEach(timeString => {
    const parsedTimes = timeString === 'To be announced' ? ['TBA', 'TBA'] : parseTimeStr(timeString);
    startTimes.push(parsedTimes[0]);
    endTimes.push(parsedTimes[1]);
  });
  const daysOccurance = {};
  const duplicatedIndexes = [];
  days.forEach((day, i) => {
    if (daysOccurance[day]) {
      duplicatedIndexes.push(i);
    }
    else {
      daysOccurance[day] = true;
    }
  });
  const indexSet = new Set(duplicatedIndexes);

  const parsedSection = {
    days: days.filter((v, i, a) => a.indexOf(v) === i).map(day => convertWeekday(day)),
    startTimes: startTimes.filter((v, i) => !indexSet.has(i)),
    endTimes: endTimes.filter((v, i) => !indexSet.has(i)),
    locations: locations.filter(v => v).filter((v, i) => !indexSet.has(i)),
  };

  console.log(parsedSection);

  return parsedSection;
};

export default function courseParser(data) {
  console.log('Parsing the data');
  const courseList = [];
  const courseRawArrays = preprocessing(data);
  console.table(courseRawArrays);

  const courses = {};
  // Post-process course lines into Lecture Object
  courseRawArrays.forEach((courseArray, i) => {
    const sectionCodes = [];
    let locations = [];
    let days = [];
    let times = [];
    let currentSection = null;

    const course = {
      courseId: courseArray[0].substring(0, 9).replace(/ /g, ''),
      title: courseArray[0].substring(10),
    };

    const sections = {};

    // Get course params inside each section
    courseArray.forEach((line, j) => {
      if ( // Indicating the line is section code line
        line.includes('( ')
        && line.includes(' )')
      ) {
        if (currentSection) {
          sections[currentSection] = processSection(times, locations, days);
          locations = [];
          days = [];
          times = [];
        }
        currentSection = line.substring(9);
        sectionCodes.push(currentSection);
        return; // like continue
      }
      if (line.includes('Location')) {
        locations.push(line.substring(8));
      }
      if (line.includes('Days:')) {
        days.push(line.substring(6));
      }
      if (line.includes('Times:')) {
        times.push(line.substring(7));
      }
      if (j === courseRawArrays[i].length - 1) {
        sections[currentSection] = processSection(times, locations, days);
      }
    });
    course.sections = sections;
    console.log(course);
    console.table(course);
    courseList.push(course);
  });
  console.table(courseList);
  // TODO: save courses by terms
  return courseList;
}

/*
TODO
1. Error handler
2. Sat / Sun as day
*/

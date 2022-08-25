import Report from '../models/report';

export const report = async input => {
  const newReport = new Report(input);
  await newReport.save();
  return newReport._id;
};

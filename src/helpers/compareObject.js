const compareObj = objects => {
  const res = objects.map(item => Object.entries(item).flat().join());
  return res.every(a => a === res[0]);
};

export default compareObj;

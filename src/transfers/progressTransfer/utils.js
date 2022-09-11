const latestDate = (progress) => {
  let newDate = 0;
  progress.forEach(e => {
    if (e.date > newDate) newDate = e.date;
  });
  return newDate;
}

const combineProgress = (entries, previous) => {
  let count = 0;
  entries.forEach(e => { 
    if (e - previous < 0) {
      count += e;
    } else {
      count += e - previous;
    }
  });

  return count + previous;
}

module.exports = {
  latestDate: latestDate,
  combineProgress: combineProgress
};

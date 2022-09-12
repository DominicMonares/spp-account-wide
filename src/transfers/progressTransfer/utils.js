const latestDate = (progress) => {
  let newDate = 0;
  progress.forEach(e => {
    const date = e.date || e.timer
    if (date > newDate) newDate = date;
  });

  if (!newDate) {
    const today = new Date();
    newDate = Math.floor(today.getTime()/1000)
  }
  
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

const combineHK = (kills, previous) => {
  let count = 0;
  kills.forEach(k => { 
    if (k - previous < 0) {
      count += k;
    } else {
      count += k - previous;
    }
  });

  return count + previous;
}

module.exports = {
  combineHK: combineHK
};

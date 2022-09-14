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

const combineLoremaster = (quests) => {
  const uniqueQuests = {};
  quests.forEach(q => { 
    if (!uniqueQuests[q.quest]) uniqueQuests[q.quest] = true;
  });

  return Object.keys(uniqueQuests).length;
}

const correctFaction = (faction, achieve) => {
  if (faction === 'A') {
    if (achieve === 1677) {
      return 1676;
    } else if (achieve === 1680) {
      return 1678;
    }
  } else {
    if (achieve === 1676) {
      return 1677;
    } else if (achieve === 1678) {
      return 1680;
    }
  }

  return achieve;
}

module.exports = {
  latestDate: latestDate,
  combineProgress: combineProgress,
  combineLoremaster: combineLoremaster,
  correctFaction: correctFaction
};

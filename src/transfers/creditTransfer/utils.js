const faction = (race) => {
  if (race === 1 || race === 3 || race === 4 || race === 7 || race === 11) {
    return 'A';
  } else {
    return 'H';
  }
}

module.exports = {
  faction: faction
};

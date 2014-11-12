/**
 * Utility functions
 */
require('array.prototype.find');

/**
 * Given a bug id and a list of trello cards
 * try to match the card refering to that bug
 * @param bugId (Number) bugzilla bug id
 * @param cards (Array) list of trello cards
 * @returns (Object) trello card for the bug or null if could not match
 */
function findCard(bugId, cards) {
  return cards.find(function(card) {
    return card.name.indexOf(bugId) !== -1;
  });
}

function findBug(card, bugs) {
  return bugs.find(function(bug) {
    return card.name.indexOf(bug.id) !== -1;
  });
}

function findUser(bug, config, data) {
  if (!bug.assigned_to) {
    return null;
  }
  var trelloUsers = data.members;
  var userMapping = config.userMapping;
  var assigne = bug.assigned_to;

  if (!userMapping[assigne]) {
    return null;
  }

  var trelloUser = trelloUsers.find(function(user) {
    return userMapping[assigne] === user.username;
  });

  return {
    'bzEmail': assigne,
    'trelloUser': userMapping[assigne],
    'trelloId': trelloUser ? trelloUser.id : null
  };
}

function findColumn(bug, config, data) {
  var bugStatus = bug.status;
  var columns = data.columns;

  var columnMapping = config.columnMapping;

  var columnName = columnMapping[bugStatus];
  if (!columnName) {
    return null;
  }

  var column = columns.find(function(column) {
    return column.name === columnName;
  });

  return {
    status: bugStatus,
    name: column.name,
    id: column.id
  };
}

function findPoints(bug) {
  var whiteBoard = bug.whiteboard || '';

  var re = new RegExp(/\[.*p=(\d)?.*\]/);

  var result = whiteBoard.match(re);

  var estimated = null;
  var spent = null;
  if (!result) {
    return [null, null];
  } else {
    estimated = result[1];
  }

  if (bug.status === 'RESOLVED' || bug.status === 'VERIFIED') {
    spent = estimated;
  }

  return [estimated, spent];
}

module.exports.findCard = findCard;
module.exports.findUser = findUser;
module.exports.findColumn = findColumn;
module.exports.findBug = findBug;
module.exports.findPoints = findPoints;

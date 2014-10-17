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

module.exports.findCard = findCard;

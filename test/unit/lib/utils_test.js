var chai = require('chai');
var sinon = require('sinon');

var utils = require('../../../lib/utils.js');

suite('Find card', function() {
  test('> return card that matches', function() {
    var card = {
      name: 'Bug 12345 - Title'
    };
    var cards = [card];

    var found = utils.findCard('12345', cards);
    chai.assert.deepEqual(card, found);
  });

  test('> return null if card is not present', function() {
    var found = utils.findCard('12345', []);
    chai.assert.equal(found, undefined);
  });
});

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var findbugs = require('../../../lib/findbugs.js');

chai.use(chaiAsPromised);

suite('FindBugs', function() {
  test('> search without init produces an error', function() {
    var promise = findbugs.search({});
    return chai.assert.isRejected(promise, 'Promise should be rejected');
  });

  test('> init and search must work', function() {
    findbugs.init();
    var promise = findbugs.search({'product':'FirefoxOS'});
    return chai.assert.isFulfilled(promise, 'Promise should be rejected');
  });

  test('> search working correctly', function() {
    findbugs.init();

    var promise = findbugs.search({
      longdesc: 'latency regressed',
      component: 'Gaia::Contacts',
      product: 'Firefox OS'
    });

    return promise.then(function(data) {
      chai.assert.isNotNull(data);
      chai.assert.lengthOf(data, 1);
      chai.assert.equal(data[0].id, 1038179);
    });
  });
});

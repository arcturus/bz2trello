var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var sinon = require('sinon');

chai.use(chaiAsPromised);

var APIStub = {
  trelloGet: function(path, cb) {
    cb(null, {});
  }
}

var KEY = 'key';
var TOKEN = 'token';
var BOARD_ID = '1';

var stub = {
  'node-trello': function(k, t) {
    return {
      get: APIStub.trelloGet
    };
  }
};

var trello, proxyquire;

function loadModuleInContext() {
  proxyquire = require('proxyquire').noPreserveCache();
  trello = proxyquire('../../../lib/trello', stub);

  trello.init(KEY, TOKEN);
}

suite('Trello wrapper', function() {
  setup(function() {
    loadModuleInContext();
  });
  test('getting a board info', function() {
    var promise = trello.getBoard(BOARD_ID);
    return chai.assert.isFulfilled(promise, 'Trello api working');
  });
  test('handling errors from the api', function() {
    sinon.stub(APIStub, 'trelloGet', function(path, cb) {
      cb('API_NOT_WORKING', null);
    });
    // Change the stub and reload the module to test with the new output
    loadModuleInContext();
    var promise = trello.getBoard(BOARD_ID);
    return chai.assert.isRejected(promise, 'Trello api not working').then(function() {
      APIStub.trelloGet.restore();
      loadModuleInContext();
    });
  });
  suite('Board tests', function() {
    suiteSetup(function() {
      var response = require('../mocks/board_response.json');
      sinon.stub(APIStub, 'trelloGet', function(path, cb) {
        cb(null, response);
      });
      loadModuleInContext();
    });
    suiteTeardown(function() {
      APIStub.trelloGet.restore();
    });

    test('getting board info', function() {
      var promise = trello.getBoard(BOARD_ID);
      return chai.assert.isFulfilled(promise, 'Getting board data').then(function(data) {
        chai.assert.isNotNull(data);
      });
    });

    test('getting labels info', function() {
      var promise = trello.getBoardLabels(BOARD_ID);
      return chai.assert.isFulfilled(promise, 'Getting board data').then(function(data) {
        chai.assert.isNotNull(data);
      });
    });
  });
});

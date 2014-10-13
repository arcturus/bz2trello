var findbugs = require('./findbugs.js')
    ,trello = require('./trello.js')
    , Promise = require('promise');

(function() {

  var config;

  function sync(cfg) {
    config = cfg;

    return checkConfig().then(fetchData).
      then(cleanData).
      then(prepareActions).
      then(executeActions);
  }

  function checkConfig() {
    if (!config.bz) {
      return Promise.reject('Cannot find bz configuration');
    }
    if (!config.bz.search) {
      return Promise.reject('We need bz query information');
    }
    if (!config.trello) {
      return Promise.reject('Cannot find trello configuration');
    }
    if (!config.trello.boardId) {
      return Promise.reject('We need trello board id');
    }
    if (!config.trello.key) {
      return Promise.reject('We need trello key');
    }
    if (!config.trello.token) {
      return Promise.reject('We need trello token');
    }

    return Promise.resolve();
  }

  function fetchData() {
    var dataPromises = [];
    // Query bugzilla
    findbugs.init();
    dataPromises.push(findbugs.search(config.bz.search));
    // Query trello
    var boardId = config.trello.boardId;
    trello.init(config.trello.key, config.trello.token);
    dataPromises.push(trello.getBoard(boardId));
    dataPromises.push(trello.getBoardLabels(boardId));
    dataPromises.push(trello.getBoardMembers(boardId));
    dataPromises.push(trello.getBoardLists(boardId));
    dataPromises.push(trello.getBoardCards(boardId));

    return Promise.all(dataPromises);
  }

  function cleanData(data) {
    return Promise.reject('cleandData not implemented yet');
  }

  function prepareActions() {
    return Promise.reject('prepareActions not implemented yet');
  }

  function executeActions() {
    return Promsie.reject('executeActions not implemented yet');
  }

  module.exports = {
    sync: sync
  };
})();

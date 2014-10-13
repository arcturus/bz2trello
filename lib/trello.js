var Trello = require('node-trello')
    ,Promise = require('promise');

(function() {
  var trello = null;

  function init(key, token) {
    trello = new Trello(key, token);
  }

  function getBoard(boardId) {
    var path = '/1/boards/' + boardId;
    return APIProxy(path);
  }

  function getBoardLabels(boardId) {
    return getBoard(boardId).then(function(data) {
      return data.labelNames;
    });
  }

  function getBoardMembers(boardId) {
    var path = '/1/boards/' + boardId + '/members';
    return APIProxy(path);
  }

  function APIProxy(path) {
    return new Promise(function(resolve, reject) {
      if (!trello) {
        reject('Not initialized');
        return;
      }
      trello.get(path, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  module.exports =  {
    init: init,
    getBoard: getBoard,
    getBoardLabels: getBoardLabels
  };
})();

var Trello = require('node-trello')
    ,Promise = require('promise');

(function() {
  var trello = null;

  function init(key, token) {
    trello = new Trello(key, token);
  }

  function getBoardUrl(boardId, extraPath) {
    var path = '/1/boards/' + boardId;

    if (extraPath) {
      path += '/' + extraPath;
    }

    return path;
  }

  function getBoard(boardId) {
    var path = getBoardUrl(boardId);
    return APIProxy(path);
  }

  function getBoardLabels(boardId) {
    return getBoard(boardId).then(function(data) {
      return data.labelNames;
    });
  }

  function getBoardMembers(boardId) {
    var path = getBoardUrl(boardId, 'members');
    return APIProxy(path);
  }

  function getBoardLists(boardId) {
    var path = getBoardUrl(boardId, 'lists');
    return APIProxy(path);
  }

  function getBoardCards(boardId) {
    var path = getBoardUrl(boardId, 'cards');
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
    getBoardLabels: getBoardLabels,
    getBoardMembers: getBoardMembers,
    getBoardLists: getBoardLists,
    getBoardCards: getBoardCards
  };
})();

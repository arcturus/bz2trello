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
    return APIGet(path);
  }

  function getBoardLabels(boardId) {
    return getBoard(boardId).then(function(data) {
      return data.labelNames;
    });
  }

  function getBoardMembers(boardId) {
    var path = getBoardUrl(boardId, 'members');
    return APIGet(path);
  }

  function getBoardLists(boardId) {
    var path = getBoardUrl(boardId, 'lists');
    return APIGet(path);
  }

  function getBoardCards(boardId) {
    var path = getBoardUrl(boardId, 'cards');
    return APIGet(path);
  }

  function APIGet(path) {
    return APIProxy(path, 'GET');
  }

  function APIPost(path, data) {
    return APIProxy(path, 'POST', data);
  }

  function APIPut(path, data) {
    return APIProxy(path, 'PUT', data);
  }

  function APIProxy(path, verb, args) {
    return new Promise(function(resolve, reject) {
      if (!trello) {
        reject('Not initialized');
        return;
      }
      function onData(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
      switch(verb) {
        case 'POST':
          trello.post(path, args, onData);
          break;
        case 'PUT':
          trello.put(path, args, onData);
          break;
        default:
          trello.get(path, onData);
      }
    });
  }

  function createCard(boardId, bugNumber, bugTitle, assigneId, columnId, link) {
    var name = '(bug ' + bugNumber + ') ' + bugTitle;
    var members = assigneId ? [assigneId] : null;
    return APIPost('/1/cards', {
      name: name,
      due: null,
      idList: columnId,
      idMembers: members,
      urlSource: null
    }).then(function(data) {
      var cardId = data.id;
      return APIPost('/1/cards/' + cardId + '/attachments', {
        url: link
      });
    });
    return Promise.resolve();
  }

  function updateCardOwner(card, owner) {
    if (!card.idMembers.indexOf(owner)) {
      return Promise.resolve();
    }
    var members = owner ? [owner] : null;
    return APIPut('/1/cards/' + card.id, {
      idMembers: members
    });
  }

  function updateCardColumn(card, idList) {
    if (card.idList === idList) {
      return Promise.resolve();
    }
    return APIPut('/1/cards/' + card.id, {
      idList: idList
    });
  }

  function updateCardPoints(card, estimated, spent) {
    if (!estimated) {
      return Promise.resolve();
    }

    var cardEstimated = card.name.match(/\(\d\)/);

    if (!cardEstimated) {
      cardEstimated = null;
    } else {
      cardEstimated = cardEstimated[1];
    }

    var cardSpent = card.name.match(/\[\d\]/);
    if (!cardSpent) {
      cardSpent = null;
    } else {
      cardSpent = cardSpent[1];
    }

    // Update estimates
    var changed = false;
    if (cardEstimated === null) {
      changed = true;
      card.name = '(' + estimated + ') ' + card.name;
    } else if (cardEstimated !== estimated) {
      changed = true;
      card.name = card.name.replace(/\(\d\)/, '(' + estimated + ')');
    }

    // Update spent
    if (spent !== null && cardSpent === null) {
      changed = true;
      card.name = '[' + spent + '] ' + card.name;
    }

    if (!changed) {
      return Promise.resolve();
    }

    return APIPut('/1/cards/' + card.id, {
      name: card.name
    });
  }

  module.exports =  {
    init: init,
    getBoard: getBoard,
    getBoardLabels: getBoardLabels,
    getBoardMembers: getBoardMembers,
    getBoardLists: getBoardLists,
    getBoardCards: getBoardCards,
    createCard: createCard,
    updateCardOwner: updateCardOwner,
    updateCardColumn: updateCardColumn,
    updateCardPoints: updateCardPoints
  };
})();

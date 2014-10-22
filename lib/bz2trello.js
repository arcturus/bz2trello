var findbugs = require('./findbugs.js')
    ,trello = require('./trello.js')
    , Promise = require('promise')
    , utils = require('./utils.js');

(function() {

  var config;

  function sync(cfg) {
    config = cfg;

    return checkConfig().then(fetchData).
      then(cleanData).
      then(prepareActions).
      then(executeActions);
  }

  /**
   * Simple way of checking that the config file has the mandatory fields
   * @returns (Promise) fulfilled if config file is correct
   */
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
    if (!config.columnMapping) {
      return Promise.reject('We dont have column mapping');
    }
    if (!config.userMapping) {
      return Promsie.reject('We dont have user mapping');
    }

    return Promise.resolve();
  }

  /**
   * Brings data from the different sources to the system
   * @returns (Promise) fulfilled when all queries finish
   */
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

  /**
   * Sanitises data coming from the sources, strip it and get just
   * the relevant parts
   * @param data (Array) Responses from different queries to trello and bz
   * @returns (Promise) fulfilled with all data parsed and cleaned
   */
  function cleanData(data) {
    var results = {};
    // Clean bugs
    var bugs = [];
    data[0].forEach(function(bug) {
      bugs.push({
        id: bug.id,
        summary: bug.summary,
        assigned_to: bug.assigned_to,
        status: bug.status,
        resolution: bug.resolution,
        url: 'https://bugzilla.mozilla.org/show_bug.cgi?id=' + bug.id
      });
    });

    results.bugs = bugs;

    // Clean the board info
    if (!data[1]) {
      return Promise.reject('Could not get info from the trello board');
    }
    var board = {
      id: data[1].id,
      name: data[1].name,
      url: data[1].url,
      shortUrl: data[1].shortUrl
    };

    results.board = board;

    results.labels = data[2];

    results.members = data[3];

    results.columns = data[4];

    // Clean cards
    var cards = [];
    data[5].forEach(function(card) {
      cards.push({
        id: card.id,
        idList: card.idList,
        name: card.name,
        idMembers: card.idMembers,
        url: card.url,
        shortUrl: card.shortUrl
      });
    });

    results.cards = cards;

    return Promise.resolve(results);
  }

  /**
   * Given the information collected from bugzilla and trello, filters is to
   * create actionable items, new cards to be created, or updated, or even
   * discarded.
   * It doesn't execute such actions, just separate them.
   * @param data {Object} bz and trello information
   * @returns {Promise} continues the promised flow with new filtered info
   */
  function prepareActions(data) {
    var bugs = data.bugs;
    var cards = data.cards;
    var newBugs = [];
    var updatableCards = [];
    var discardedCards = [];
    var bugsExistingCards = [];
    bugs.forEach(function(bug) {
      var card = utils.findCard(bug.id, cards);
      if (card) {
        updatableCards.push(card);
      } else {
        newBugs.push(bug);
      }
    });
    discardedCards = cards.filter(function(card) {
      return updatableCards.indexOf(card) === -1;
    });

    data.newBugs = newBugs;
    data.updatableCards = updatableCards;
    data.discardedCards = discardedCards;

    return Promise.resolve(data);
  }

  function executeActions(data) {
    var actions = [];
    data.newBugs.forEach(function(bug) {
      actions.push(createCard(bug, data));
    });
    data.updatableCards.forEach(function(card) {
      var bug = utils.findBug(card, data.bugs);
      if (bug !== null) {
        actions.push(updateCard(bug, card, data));
      }
    });
    data.discardedCards.forEach(function(card) {
      actions.push(discardCard(card, data));
    });

    return Promise.all(actions);
  }

  function createCard(bug, data) {
    var boardId = data.board.id;
    var bugId = bug.id;
    var title = bug.summary;
    var member = utils.findUser(bug, config, data);
    var column = utils.findColumn(bug, config, data);
    var bugLink = bug.url;

    if (!column) {
      return Promise.reject('Could not find an appropiate column');
    }

    return trello.createCard(boardId, bugId, title,
       member ? member.trelloId : null, column.id, bugLink);
  }

  function updateCard(bug, card, data) {
    var actions = [];

    var user = utils.findUser(bug, config, data);
    var userId = user ? user.trelloId : null;
    actions.push(trello.updateCardOwner(card, userId));

    var column = utils.findColumn(bug, config, data);
    if (column && column.id) {
      actions.push(trello.updateCardColumn(card, column.id));
    }

    return Promise.all(actions);
  }

  function discardCard(card, data) {
    return Promise.resolve(card);
  }

  module.exports = {
    sync: sync
  };
})();

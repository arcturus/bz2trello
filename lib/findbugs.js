var bz = require('bz')
    ,Promise = require('promise');

(function() {
  var bugzilla;

  function init(configuration) {
    bugzilla = bz.createClient(configuration);
  }

  function search(searchOpts) {
    if (!bugzilla) {
      return Promise.reject();
    }

    return new Promise(function(resolve, reject) {
      bugzilla.searchBugs(searchOpts, function(error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  module.exports = {
    init: init,
    search: search
  };

})();

var boardId = '5447bb303fc7ce5ba115fef1';
var token = '<your_token_goes_here>';
var key = '<your_key_goes_here>';

var bz2trello = require('./lib/bz2trello.js'); bz2trello.sync({
  'bz': {
    'search':{
      'product':'Firefox OS',
      'component': 'Gaia::Contacts',
      'target_milestone':'2.1 S7 (24Oct)'
    }
  },
  'trello':{'boardId': boardId, 'key': key, 'token': token},
  'columnMapping': {
    'NEW': 'To Do',
    'UNCONFIRMED': 'To Do',
    'ASSIGNED': 'Doing',
    'RESOLVED': 'Done',
    'VERIFIED': 'Done'
  },
  'userMapping': {
    '<bz email for user franciscojordano1>': 'franciscojordano1',
    '<bz email for user adriandelarosamartin>': 'adriandelarosamartin',
    '<bz email for user josemanuelcanterafonseca>': 'josemanuelcanterafonseca',
    '<bz email for user sergimansilla>': 'sergimansilla'
  }}).then(console.log, console.error);

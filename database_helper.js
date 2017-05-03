'use strict';
module.change_code = 1;
var _ = require('lodash');
var dynasty = require('dynasty')({});
// var localUrl = 'http://localhost:4000';
// var localCredentials = {
//   region: 'us-east-1',
//   accessKeyId: 'fake',
//   secretAccessKey: 'fake'
// };
// var localDynasty = require('dynasty')(localCredentials, localUrl);
// var dynasty = localDynasty;
var TABLE_NAME = "user_data"


function DatabaseHelper() { }


var getUser = function(userId){
  return dynasty.table(TABLE_NAME).find(userId)
}

DatabaseHelper.prototype.findUser = function(userId){
  return getUser(userId)
}

DatabaseHelper.prototype.insertUser = function(userId){
  return getUser(userId).then(function(user){
    if (user == undefined){
      return dynasty.table(TABLE_NAME).insert({'userId': userId})
    }
  })
}

DatabaseHelper.prototype.createTable = function() {
  return dynasty.describe(TABLE_NAME)
    .catch(function(error) {
      return dynasty.create(TABLE_NAME, {
        key_schema: {
          hash: ['userId', 'string']
        }
      });
    });
};


DatabaseHelper.prototype.addToUser = function(userId, key, add_value){
  if (add_value == undefined){
    add_value = 1;
  }
  return getUser(userId).then(function(user){
    if (user){    
      var value = user[key];
      if (value) {
        user[key] = value + add_value;
      }
      else {
        user[key] = add_value;
      }
      return dynasty.table(TABLE_NAME).insert(user)
    }
  })
}

DatabaseHelper.prototype.removeFromUser = function(userId, key, take_value){
  if (take_value == undefined){
    take_value = 1;
  }
  return getUser(userId).then(function(user){
    if (user){
      var value = user[key];
      if (value >= take_value) {
        user[key] = value - take_value;
      }
      else {
        return Promise.reject("Don't have enough " + key);
      }
      return dynasty.table(TABLE_NAME).insert(user)
    }
  })
}

module.exports = DatabaseHelper;
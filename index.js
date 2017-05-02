'use strict';
module.change_code = 1;
var _ = require('lodash');
var Skill = require('alexa-app');
var HOME_HERO_SESSION_KEY = 'home_hero';
var skillService = new Skill.app('homehero');
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();
var promise;
var recipe = "Preheat oven to 200 degrees; have a baking sheet or heatproof platter ready to keep cooked pancakes warm in the oven. In a small bowl, whisk together flour, sugar, baking powder, and salt; set aside. In a medium bowl, whisk together milk, butter (or oil), and egg. Add dry ingredients to milk mixture; whisk until just moistened (do not overmix; a few small lumps are fine). Heat a large skillet (nonstick or cast-iron) or griddle over medium. Fold a sheet of paper towel in half, and moisten with oil; carefully rub skillet with oiled paper towel. For each pancake, spoon 2 to 3 tablespoons of batter onto skillet, using the back of the spoon to spread batter into a round (you should be able to fit 2 to 3 in a large skillet). Cook until surface of pancakes have some bubbles and a few have burst, 1 to 2 minutes. Flip carefully with a thin spatula, and cook until browned on the underside, 1 to 2 minutes more. Transfer to a baking sheet or platter; cover loosely with aluminum foil, and keep warm in oven. Continue with more oil and remaining batter. (You'll have 12 to 15 pancakes.) Serve warm, with desired toppings."
skillService.pre = function(request, response, type) {
  promise = databaseHelper.createTable();
}

skillService.intent('gotGroceryIntent', {
    'slots': {
      'ITEM': 'AMAZON.Food',
      'AMOUNT': 'AMAZON.NUMBER' 
    },
    'utterances': ['{I|we} got {AMOUNT} {ITEM}']
  },(
    function(request, response){
      var responseString;
      return promise.then(function(){
        return databaseHelper.insertUser(request.userId).then(function(){
          return databaseHelper.addToUser(request.userId, request.slot('ITEM'), Number(request.slot('AMOUNT'))).then(function(){
            return databaseHelper.findUser(request.userId).then(function(user){
              responseString = "Okay, you now have " + user[request.slot('ITEM')] +  " " + request.slot('ITEM'); 
              console.log(user)
              console.log(responseString);
              return response.say(responseString);
          })
      })
  })
})
})
)

skillService.intent('checkGroceryIntent', {
    'slots': {
      'ITEM': 'AMAZON.Food'
    },
    'utterances': ['how much {ITEM} do I have?']
  },(
    function(request, response){
      var responseString;
      return promise.then(function(){
        return databaseHelper.findUser(request.userId).then(function(user){
          console.log(user)
          responseString = "You have " + user[request.slot('ITEM')] + " " + request.slot('ITEM');
          if (user[request.slot('ITEM')] == undefined){
            responseString = "You have no " + request.slot('ITEM');
          }
          return response.say(responseString);
        })
      })
    }
  )
)

skillService.intent('makePancakeIntent', {
    'utterances': ['I\'d like to make a lot of pancakes']
  },(
    function(request, response){
      return promise.then(function(){
        return databaseHelper.findUser(request.userId).then(function(user){
          if (user['flour'] < 2){
            return Promise.reject("Don't have enough flour");
          }
          if (user['sugar'] < 4){
           return Promise.reject("Don't have enough sugar"); 
          }
          if (user['baking powder'] < 4){
            return Promise.reject("Don't have enough baking powder");
          }
          if (user['salt'] < 1){
            return Promise.reject("Don't have enough salt");
          }
          if (user['milk'] < 2){
            return Promise.reject("Don't have enough milk");
          }
          if (user['butter'] < 4){
            return Promise.reject("Don't have enough butter");
          }
          if (user['egg'] < 2){
            return Promise.reject("Don't have enough egg");
          }
          if (user['vegetable oil'] < 2){
            return Promise.reject("Don't have enough vegetable oil");
          }
          return Promise.resolve("Okay, you have all the needed ingredients. I'll read you the recipe now: " + recipe)
        })
      }).then(function(resolution){
        console.log(resolution)
        return response.say(resolution)
      },
      function(error){
        console.log(error)
        return response.say("You can't currently make pancakes, because you: " + error);
      })
    })
)

module.exports = skillService;

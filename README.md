# Licensing
[License](LICENSE.txt)
# About
This project was for a CSC 490C class at Louisiana Tech University, with respect to the Internet of Things. The goals are to bring together Internet of Things technology, and to that end, this app serves as a training point for how to implement Alexa technology to the goals of that project.

# Notes
This app by no means reflects the finished state of such an application. It is at best a proof of concept.
This app utilizes Dynamo DB and Alexa's Lambda Function, for its primarily functionality. It uses a Node.js module called Dynasty to interface with Dynamo DB, a promise-based architecture for interfacing.
I went into this knowing no Node.js or Javascript. I am sure I made plenty of mistakes in proper coding for a web application, but hopefully my pitfalls will help whoever is still meaning to learn.

# Tutorial
Okay, really, I've talked about most of this, and I'm probably not going to make an in-depth tutorial, but here's my path.
If you don't know Javascript and Node.js, I highly recommend this: [javascripting and learnyounode](https://nodeschool.io/#workshopper-list). These guys are great!
After you feel relatively comfortable with those, start off [here](https://developer.amazon.com/blogs/post/Tx3DV6ANE5HTG9H/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Setting-Up-Yo). This guide works great and you'll struggle through it but come out understanding structure just a little bit better. Plus, you should get your development environment mostly up, which is a huge benefit.
Move through till you get to Part Four, probably skipping Part Three. So, by now I hope you have a local development environment, set up with alexa-app-server, and perhaps this app (or the cakebaker one). Let me walk you through my own application.

[index.js](index.js) - the main meat. This has all the code currently that handles the request and responses.
Let's break it down:
```
skillService.pre
```
This defines whenever the app starts up, what it has to run. In this case it creates a new table or returns it's own table if it's already defined.
```
skillService.intent
```
This is an "intent". On the Alexa Skill side (not our web app side), Alexa interprets what the user says, turns it into a JSON request for a specific intent with specific slots defined, and sends it over to the web app. Our web app needs to have the same intents defined to make sure we handle whatever we get from Alexa, so it knows how to reply.

```
module.exports = skillService;
```
This exports our index.js as a useable skill from however it interfaces with Alexa.

Let's walk through one of my intents to see how it works.
```
skillService.intent('checkGroceryIntent', {
    'slots': {
      'ITEM': 'AMAZON.Food'
    },
    'utterances': ['how much {ITEM} do I have?']
  },(
    function(request, response){
      var responseString; #predefine response
      var session = request.getSession(); 						# grab session
      var userId = session.details.userId; 						# get userId from session (this was the best way I could find to get the userId from the request)
      return promise.then(function(){ 	]()						# here, the promise we're calling then on is from skillService.pre to make sure we've made our table.
        return databaseHelper.findUser(userId).then(function(user){
          console.log(user)
          responseString = "You have " + user[request.slot('ITEM')] + " " + request.slot('ITEM');
          if (user[request.slot('ITEM')] == undefined){ 		# If we have none of that item, tell them they don't have that item.
            responseString = "You have no " + request.slot('ITEM');
          }
          return response.say(responseString); 					# Return the response that we want Alexa to say based off the logic that has happened.
        })
      })
    }
  )
)
```
Here, whenever we define a certain string of words for checkGroceryIntent, this is called. Utterances reflect this, and will also be defined on our Alexa Skill side. We have a single slot we call "ITEM". In the utterance 'how much {ITEM} do I have?', our request will have whatever is uttered there as effectively a variable - the easiest way to understand this is that if we tell Alexa: "Alexa, ask Home Hero how much BUTTER do I have?", the result of request.slot('ITEM') will be "BUTTER". More information on this is [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference).

This calls our database helper, which finds a user based off their userId, then tells the user how much of the item they have. I have commented to hopefully make it easy to understand.
Hopefully from here most of the confusion on how to read my code is gone.

Let's look at what it takes to actually deploy this app!

## Deploying the App
Okay, [Part Four](https://developer.amazon.com/blogs/post/Tx1T3KH2O7K8AOP/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Implementing) does an OK job of showing how to deploy the app. However, it gets a couple things wrong (I think mostly because Amazon has since changed their layout). Let me play "spot the differences":
First off, you probably need to manage certain dynamo DB functionality. If you followed Part One - Part Three, you might have configured a role with database access, but if you're like me, you got confused here. So let's go ahead and do that: Go [here](https://console.aws.amazon.com/iam/home?region=us-east-1#), The IAM dashboard at Amazon, and go to "Roles" on the left hand side. Create a new role. Under "AWS Service Role", select "AWS Lambda". It should bring you to a new window. Select "AmazonDynamoDBFullAccess". I ended up selecting more, but I believe that one should handle it (the "more" were other DynamoDB access ones, if you type in DynamoDB into the search bar you'll find them!)
Give the role a name, and probably a description, click Create Role, and you're done!

Next up, creating the Lambda Function: Make sure to select N. Virginia as your region. Certain Alexa functionality isn't availiable elsewhere. There should be a button in the upper left that says "Create a Lambda function". It will ask you to "Select a blueprint". Select "Blank Function". Under "Configure triggers" click the dotted box, and select "Alexa Skills Kit". This probably won't show up if you selected an unsupported region, so this is where you'll have trouble if you didn't heed my warning about selecting N. Virginia! Select next, and under Configure Function, give it a name, a description, and a Runtime environment. I got mine working with Node.js 6.10. For Lambda function code, select upload a .zip file, and upload [home_hero.zip](home_hero.zip) from this (make sure you rezip index.js, package.json, and database_helper.js if you made changes!) Under Lambda function handler and role, index.handler is fine, Role should be "Choose an existing role", and the existing role should be the one you created with AmazonDynamoDBFullAccess. Click next, then click Create function.

From here, make sure you get the url that starts with arn (this is described in part four as well.)

This is your web app! Now, time to set up our Alexa Skill. Go [here](https://developer.amazon.com/home.html), navigate to Alexa->Alexa Skills Kit. Add a new Skill, give it a name, an invocation name, and click save. Next we need to define the Interaction Model. This defines the user's interaction with our web application, via the kind of JSON request that will be sent. The Intent Schema for my app looks like this, currently:
```
{
  "intents": [
    {
      "slots": [
        {
          "name": "ITEM",
          "type": "AMAZON.Food"
        },
        {
          "name": "AMOUNT",
          "type": "AMAZON.NUMBER"
        }
      ],
      "intent": "gotGroceryIntent"
    },
    {
      "slots": [
        {
          "name": "ITEM",
          "type": "AMAZON.Food"
        }
      ],
      "intent": "checkGroceryIntent"
    },
    {
      "intent": "makePancakeIntent"
    },
    {
      "slots": [
        {
          "name": "ITEM",
          "type": "AMAZON.Food"
        },
        {
          "name": "AMOUNT",
          "type": "AMAZON.NUMBER"
        }
      ],
      "intent": "usedGroceryIntent"
    },
    {
      "intent": "readGroceryIntent"
    }
  ]
}
```
Basically, add a new "intent" with an intent name, and any slots it needs if it has them.

My app doesn't use Custom Slot Types, but if you use them, follow [this](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#custom-slot-syntax).

Finally, we have Sample Utterances. These define the words the user uses to trigger certain intents. The structure is always <INTENT NAME> <INTENT STRING>. For instance, mine uses these:
```
gotGroceryIntent I got {AMOUNT} {ITEM}
gotGroceryIntent we got {AMOUNT} {ITEM}
checkGroceryIntent how much {ITEM} do I have
makePancakeIntent I'd like to make a lot of pancakes
usedGroceryIntent I used {AMOUNT} {ITEM}
usedGroceryIntent we used {AMOUNT} {ITEM}
readGroceryIntent read off my groceries
```
If I wanted to read off groceries, I want to call the readGroceryIntent. This means, if the user tells the application "read off my groceries", the Alexa app will call whatever we have defined in our web application to handle "readGroceryIntent". In this case, <INTENT NAME> is "readGroceryIntent", and <INTENT STRING> is "read off my groceries".
Once you have these defined, click "next". From here, you need to select the Service Endpoint Type: AWS Lambda ARN (Amazon Resource Name). That ARN url we grabbed earlier? After you pick "North America", slap it in the box, and there we go!

Hit next and we can play with our app. From here, I'd like to take a moment to mention some debugging tips I found.

## Debugging
Once you have all this set up, sometimes you may find things simply don't work. For whatever reason you have, debugging can kind of be a pain for this, as I quickly found. If you have a skill breaking bug, and are using the Service Simulator, the Lambda Response they give after you Enter Utterance and click Ask Home Hero will not be anything useful. I wasn't sure if I just had things not set up right, or whatever. After spending some time twiddling my thumbs I finally figured out the answer to how to debug issues that only seem to come up this far: back at the Lambda Function.

Grab the Lambda Request from the Service Simulator, and pop up your Lambda Function in another tab. When you have it selected, there should be a "Test" button at the top, as well as an Actions button. Click the Actions button, and select Configure Test Event. Paste in the request you got from the Service Simulator, and click Save and Test. You'll get a response very close to what you would get in the alexa-app-server local testing environment, which is tremendously helpful for debugging (especially when it works just fine in your alexa-app-server!)

# The Process
I intend to walk you through my process for completing this app, or at least bringing it up to the point it is currently at. Included will be links to tutorials I used, the pitfalls I encountered using them, potential areas for improvement, and hopefully comments on my Node.js code to make it more understandable to the un-initiated Javascript or Node.js programmer.

First off, the primary project I got the basis for this app from:
[Big Nerd Ranch Local Testing](https://developer.amazon.com/blogs/post/Tx3DV6ANE5HTG9H/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Setting-Up-Yo)
[Big Nerd Ranch Guide (With Neato Reference Book!)](https://developer.amazon.com/alexa-skills-kit/big-nerd-ranch/alexa-architecture-and-configuration)

Both of these -can- steer you wrong. The nature of Amazon seems to update their code base and proper way to write code very quickly. I ran into several issues that caused many delays.

## Part One: Understanding the Skill Structure
[Big Nerd Ranch](https://youtu.be/QxgdPI1B7rg) Once again has an amazing video describing this, but let me explain it as best I can:
A Skill is made out of two to three things:
1. A web application designed to accept JSON requests from Alexa, and reply to Alexa. This github code -is- that web application, and if you were to set it up properly it will run on your Amazon account's attached Alexa devices.
2. An interface for the Alexa skill itself. This has to be set up via Amazon's website, and determines how a user can structure their JSON request. What you define here will determine exactly what your web application can receive from the user.
3. (optional) A database. While there is session memory for a Skill (a singular instance of using the application), there can also be a database used for persistant memory. This app uses Dynamo DB, and uses it -terribly!- Unfortunately, I can think of plenty of ways to improve it (E.G.: Not using a single database call every time I want to pull information, pulling the user data and keeping it in session memory, inserting it back in as the app closes... Wow, that's a good idea, I wish I had had the time to implement it!)

These work in tandem to give the user their experience. This application used Amazon Lambda for the web application, and Dynamo DB (also an Amazon product) for the database (I know I've said that before but bare with me). These can be changed! Unfortunately they are the easiest ones to use with a Skill as you're just starting out, so I do recommend understanding them before you move off, unless you already have experience handling both web apps and database interfacing.

## Part Two: Filling Up Holes.
Okay, I'd like to spend some time attempting to patch every hole I found that took me a long time to figure out. Feel free to come back here if you find yourself lost in one of these parts as you go through the tutorials. I'll try to re-mention them there though (feel free to skip through this part if you haven't already looked at things.)
1. [Develop Local Part One](https://developer.amazon.com/blogs/post/Tx3DV6ANE5HTG9H/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Setting-Up-Yo) Okay, these one was pretty great. But! I had certain things failing left and right. Though it says that future Node.js versions don't work, I recommend getting a later one (it fixed it for me). The version I used was v7.9.0.
2. [Develop Local Part Three](https://developer.amazon.com/blogs/post/Tx2LL8LQWN9T33O/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Deploying-You) Okay, seriously. I skipped this entire part. Feel free to look into it... I couldn't seem to get everything to work the way it was "just supposed to", so instead I worked on it from Part 4 and on, Since Part 4 uses a completely different app.
3. [Develop Local Part Four](https://developer.amazon.com/blogs/post/Tx1T3KH2O7K8AOP/Big-Nerd-Ranch-Series-Developing-Alexa-Skills-Locally-with-Node-js-Implementing) Part four! The main meat of my app. Most of this is pretty great, but you might run into some issues understanding Dynasty. This should all work locally pretty well, but don't freak out when it doesn't work perfectly on an actual Alexa! This is still pretty great for testing things out originally. I will mention, the JSON request's userId from the actual Alexa server comes a little bit differently. Look through the JSON object if you need to know what's going weird.
Part Five and Six I never went through (as evidenced by no "Home Hero" app being availiable in the Alexa Skill browser or whatever is the public version of it.) However, if you can get through those you should be fine getting through any other app. I have one more section I want to talk about, and it's kind of big.

### Promises
Oh boy, if you haven't dealt with Javascript you are in for a trip. Promises are a response to callback functions in Javascript, and effectively that means they sometimes just don't make any sense (okay, they do, but I'm still a little annoyed at my old confusion). Callback functions and Promises are ways for Javascript to run asynchronously. This means they don't wait on code that isn't really needed (say, waiting for a database call) to go through the rest of the program. Using callbacks and Promises mean you can say "Hey, call this function when you're ready, but no rush". Promises primarily use a .then(Resolved Handler Function, Rejected Handler Function) structure. That means you pass it a function to do when it works, and a function you do if it fails.
[Here's the dynasty API](http://dynastyjs.com/index.html). They have a pretty good explanation on how Promises work, so I highly recommend it. In fact, if you understand them pretty well, they're not too hard! I highly recommend reading through some of this before going through all the database stuff in the tutorials. The backend uses [this](http://bluebirdjs.com/docs/getting-started.html). Bluebird makes me cry. They have references to a beginners guide to explain things, but NO beginners guide! I'll try and give the rundown here, as best I understand it myself.
Although you might think "oh, if I make a return statement here, it'll return out for this function", that's not the way it works. Maybe it's more obvious to someone else, but I had no idea for awhile why my code wasn't properly returning what I asked it to. The best (and worst) example of this is in my [code](https://github.com/Ponkapa/home_hero_alexa/blob/2b7d96a579bf042752820e10edb44869c8f0f9c5/index.js#L165-L181), right here: 
```
return databaseHelper.removeFromUser(userId, 'flour', 2).then(function(){
  return databaseHelper.removeFromUser(userId, 'sugar', 4).then(function(){
    return databaseHelper.removeFromUser(userId, 'baking powder', 4).then(function(){
      return databaseHelper.removeFromUser(userId, 'salt', 1).then(function(){
        return databaseHelper.removeFromUser(userId, 'milk', 2).then(function(){
          return databaseHelper.removeFromUser(userId, 'butter', 4).then(function(){
            return databaseHelper.removeFromUser(userId, 'egg', 2).then(function(){
              return databaseHelper.removeFromUser(userId, 'vegetable oil', 2).then(function(){
                return response.say(responseString)
              })
            })
          })
        })
      })
    })
  })
})
```
Like, wow, holy crap. That's pretty poorly written, really. But it explains just what I need it to. Each call to "removeFromUser" returns a promise, and that promise needs to be proliferated all the way down, to make sure the last bit gets the all-clear from the last "response.say" call. I could have, you know, pulled the user from the database, changed the object, and put it back after, but I suppose this is great for at least understanding what's going on and what kind of promise-based net you can get caught in.
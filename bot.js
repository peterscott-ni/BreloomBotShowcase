// NOTE - Some code in this file has been redacted for privacy reasons.

const Discord = require('discord.io');
var auth = require('./auth.json');
const testChannelGeneral = "";
const testChannelBugs = "";
const testChannelLog = "";
const testChannelTimer = "";
const testChannelAutospam = "";
const serverNamePartyGeneral = "";
const serverNamePartySpam = "";
const adminID = "";
var hangmanActive = false;
var hangmanAttemptsLeft = 8;
var hangmanChannel = serverNamePartySpam;
var word, wordLetters, blankedWord, correctLetters, incorrectLetters;
var ptQuoteFirstCheck = true;
var previousMessage = "";
var previousMessageChannel = "";
var currentMessage = "";
var azeryBadActive = false;
var clariceLastMessageID;
var serverNamePartyServerID = '';
const keywords = require('.\\keywords.json');

const GoogleImages = require('google-images');
const client = new GoogleImages(':', '');
var Filter = require('bad-words'),
    filter = new Filter();

var aviNormal = require('fs').readFileSync('BreloomBotSmallSmile.png', 'base64');
var aviHappy = require('fs').readFileSync('BreloomBotBigSmile.png', 'base64');
var aviSad = require('fs').readFileSync('BreloomBotCry.png', 'base64');
var aviBasic = require('fs').readFileSync('BreloomBot.png', 'base64');
var aviEvil = require('fs').readFileSync('', 'base64');

const Discord = require('discord.io');
var config = require('./config.json');

var unirest = require('unirest');

// const { DateTime } = require("luxon");

var bot = new Discord.Client({
    token: config.token,
    autorun: true
});

var mysql = require('mysql2');

// for new hardware devices, don't forget to copy the config.json file across otherwise an ECONNREFUSED error will occur
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: config.password,
    database: "pokemon"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
    setTimeout(ping, 5000);
});

bot.on('ready', function(event) {
    console.log("Discord connected!")
})

bot.on('guildMemberAdd', function(member) {
    console.log(member);
    var sqlGetRoles = "SELECT * FROM Roles WHERE UserID='" + member.id + "';";
    con.query(sqlGetRoles, function (err, result, fields) {
        if (result.length != 0) {
            for(var i = 0; i < result.length; i++) {
                if(member.id == result[i].UserID) {
                    bot.addToRole( {
                        serverID: serverNamePartyServerID,
                        userID: member.id,
                        roleID: result[i].RoleID
                    }), function (err) {
                        console.log(err);
                        sendToServer(testChannelBugs, "Error in function: guildMemberAdd");
                        sendToServer(testChannelBugs, err);
                    };
                }
            }
        }
        else
            sendToServer(testChannelBugs, "UserRejoinedServer encountered an error: no roles found for user: " + member.nick);
    });
});

function ping() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    sqlPing();

    function sqlPing() {
        var sqlGoddammit = "SELECT number FROM Goddammit";
        con.query(sqlGoddammit, function (err, result, fields) {  // ping for SQL server
            if(result) {
                bot.sendMessage({
                    to: testChannelTimer,
                    message: dateTime += "\nSQL connection valid.",
                });
            }
            else {
                bot.sendMessage({
                    to: testChannelTimer,
                    message: dateTime += "\nSQL connection lost.\n" + err,
                });
            }
        });
        setTimeout(rePing, 5000);
    }

    function rePing() {
        setTimeout(ping, 3600000);
    }
}

function checkKeywords(message, user, channelID) {
    if(user.toLowerCase()=="admin") {
        for (let i in keywords.users) { // next user
            let keyWordFound = false;
            for(let j = 0; j < keywords.users[i].length; j++) {  // next keyword
                if(!keyWordFound) { // stop after first matching keyword found
                    let keyword = keywords.users[i][j];
                    if(message.toLowerCase().includes(keyword)) {
                        let channelName = findChannelName(channelID);
                        keyWordFound = true;
                        let outputString = `${user} just mentioned your keyword \`${keyword}\` in the channel \`${channelID}\`. Here's the message:\n\`\`\`${message}\`\`\``;
                        sendToServer(testChannelGeneral, outputString);
                    }
                }
            }
        }
    }
}

function findChannelName(channelID) {
    for(let i in config.channels.test)
    {
        console.log(config.channels.test[i]);
        if(config.channels.test[i] == channelID) {
            console.log(Object.keys(config.channels.test)[i])
            return Object.keys(config.channels.test)[i];
        }
    }
}

bot.on('message', function (user, userID, channelID, message, evt) {
    currentMessage = message;
    if (user == "Clarice" && !message.includes("delete") && channelID != testChannelLog) {
        clariceLastMessageID = evt.d.id;
    }
    // keyword ping
    // checkKeywords(message, userNickname(user), channelID);
    // TODO - replace with regex
    if(message.toLowerCase().includes("clarice, what's") || message.toLowerCase().includes("clarice, what is") || message.toLowerCase().includes("clarice what's") || message.toLowerCase().includes("clarice what is")
    || message.toLowerCase().includes("clarice show me") || message.toLowerCase().includes("clarice, show me")) {
        var input = "";
        var inputWords = message.split(' ');
        for(var i = 3; i < inputWords.length; i++) {
            input += inputWords[i];
            if(i != inputWords.length - 1) {
                input += " ";
            }
        }
        if(filter.isProfane(input)) {
            sendToServer(channelID, "I think that search query has some bad words!");
            return;
        }
        client.search(input)
            .then(images => {
                if(images.length > 0) {
                    let url = images[Math.floor(Math.random() * Math.min(images.length, 10))].url;
                    if(url.includes("lookaside")) {
                        for(let i = 0; i < images.length; i++) {
                            url = images[Math.floor(Math.random() * Math.min(images.length, 10))].url;
                            if(!url.includes("lookaside")) {
                                break;
                            }
                        }
                        if(url.includes("lookaside")) {
                            sendToServer(channelID, "I didn't find any results. Sorry!");
                            return;
                        }
                    } 
                    sendToServer(channelID, "Here's what I got for that!\n" + url);
                    return;
                } else {
                    sendToServer(channelID, "I didn't find any results. Sorry!");
                    return;
                }
        });
        
    }
    if (user == "Bazaro" && !hangmanActive && message.substring(1, 8) == "hangman") {
        bot.deleteMessage({
            channelID: channelID,
            messageID: evt.d.id
        })
    }
    if(message.toLowerCase().includes("what does pot of greed do")) {
        sendToServer(channelID, "**POT OF GREED ALLOWS ME TO DRAW TWO MORE CARDS FROM MY DECK AND ADD THEM TO MY HAND**");
    }
    var exp = /clarice,?\sdestroy/i;
    if(exp.test(message))
    switch (Math.floor(Math.random() * 5)) {
        case 0: sendToServer(channelID, "**With pleasure.**\nhttps://i.imgur.com/vvjcIeJ.png"); break;
        case 1: sendToServer(channelID, "**It will be done.**\nhttps://i.imgur.com/vvjcIeJ.png"); break;
        case 2: sendToServer(channelID, "**There will be no mercy.**\nhttps://i.imgur.com/vvjcIeJ.png"); break;
        case 3: sendToServer(channelID, "**Prepare for the end.**\nhttps://i.imgur.com/vvjcIeJ.png"); break;
        case 4: sendToServer(channelID, "**Soon it will all be over.**\nhttps://i.imgur.com/vvjcIeJ.png"); break;
    }
    if(channelID == config.channels.tp.dndmemes) {
        addNewMemeCheck("dnd", evt.d);
    }
    if(channelID == config.channels.tp.videomemeries) {
        addNewMemeCheck("video", evt.d);
    }
    if (/*channelID != "442322003001868289" || message.includes("prune")*/ true) // avoids posting to srs-bsns, unless pruning
    {
        if (message.toLowerCase().includes("clarice") && message.toLowerCase().includes("play despacito")) {
            sendToServer(channelID, "**Des...pa...*cito*** :musical_note:\nhttps://youtu.be/kJQP7kiw5Fk");
        }
        if (message.toLowerCase().includes("cincinno") || message.toLowerCase().includes("cinncino")) {
            sendToServer(channelID, "Bibs wants you to know that it's spelled \"Cinccino\", " + userNickname(user) + ".");
            return;
        }
        if (message.toLowerCase().includes("mincinno") || message.toLowerCase().includes("minncino")) {
            sendToServer(channelID, "Bibs wants you to know that it's spelled \"Minccino\", " + userNickname(user) + ".");
            return;
        }
        if (message.toLowerCase().includes("goddammit admin") && userID == "174871903800918016") // bibs' user ID
            goddammitadmin(channelID);
        if (user == "Ironbound256" && message.toLowerCase().includes("english") && (message.toLowerCase().includes("inferior") || message.toLowerCase().includes("silly") || message.toLowerCase().includes("dumb") || message.toLowerCase().includes("defunct") || message.toLowerCase().includes("pathetic") || message.toLowerCase().includes("inadequate") || message.toLowerCase().includes("stupid") || message.toLowerCase().includes("trash") || message.toLowerCase().includes("garbage") || message.toLowerCase().includes("useless")))
            sendToServer(channelID, "*sprays water at Prad from bottle*");
        if (message.substring(0, 1) == '!' || message.substring(0, 1) == '/' || message.substring(0, 1) == '.') {
            var args = message.substring(1).split(' ');
            var cmd = args[0].toLowerCase();
            if(/dele.*wh?oo.*p/.test(cmd)) {
                bot.uploadFile({
                    to: channelID,
                    file: "DELELELELEWHOOOOP.mp3"
                });
                bot.uploadFile({
                    to: channelID,
                    file: "kricketune.png"
                });
            }
            switch (cmd) {

                case 'ama':
                    amaKeySmash(channelID);
                    break;
                case 'rick':
                    rickroll();
                    break;
                case 'simulate':
                    sendToServer(serverNamePartyGeneral, "", true);
                    break;
                case 'birthday':
                case 'birthdays':
                    nextBirthday(channelID);
                    break;
                case 'calc':
                case 'calculator':
                case 'damagecalc':
                    sendToServer(channelID, "https://pokemonshowdown.com/damagecalc/");
                    break;
                case 'cap':
                    createPokemon(channelID, message, user);
                    break;
                case 'define':
                    defineWord(channelID, message);
                    break;
                case 'dt':              // DETAILS
                case 'detail':
                case 'details':
                case 'data':
                    details(channelID, message);
                    break;
                case 'ds':
                case 'dexsearch':
                    dexSearch(channelID, message);
                    break;
                case 'dice':
                case 'roll':
                case 'r':
                    diceroll(channelID, message);
                    break;
                case 'dnd':
                case 'didney':
                    getMeme2("dnd", channelID);
                    break;
                case 'eetfroot':
                case 'eet':
                case 'froot':
                case 'eetfr00t':
                case 'fr00t':
                    eetFroot(channelID);
                    break;
                case 'image':           // DISPLAY POKEMON IMAGE
                case 'display':
                case 'picture':
                    displayImage(channelID, message);
                    break;
                case 'pt':              // PT PHONE QUOTE
                case 'ptphone':
                case 'phone':
                    ptQuoteFirstCheck = true;
                    getPTQuote(channelID);
                    // sendToServer(channelID, "https://i.imgur.com/WnNxnIw.gif");
                    break;
                case 'goddammitadmin':  // GODDAMMIT admin
                    if (user != "Clarice")
                        sendToServer(channelID, "Hey, admin! " + userNickname(user) + goddammitadminGeneral(channelID, user), true);
                    break;
                case 'testgirl':
                    bot.editUserInfo({ avatar: aviBasic });
                    setTimeout(aviSetNormal, 600000);
                    setTimeout(sendToServer, 500, channelID, goodGirlResponse() + userNickname(user) + "!")
                    break;
                case 'goodgirlclarice': // GOOD GIRL CLARICE
                case 'goodclarice':
                case 'goodgirl':
                    bot.editUserInfo({ avatar: aviHappy });
                    setTimeout(aviSetNormal, 300000);
                    setTimeout(sendToServer, 500, channelID, goodGirlResponse() + userNickname(user) + "!");
                    break;
                case 'hangman':         // HANGMAN GAME
                    hangman(user, channelID, message);
                    break;
                case 'hangmancancel':   // CANCEL ACTIVE HANGMAN GAME
                    if (hangmanActive)
                        sendToServer(channelID, "The active game of hangman has been cancelled.");
                    else
                        sendToServer(channelID, "I tried to cancel it, but it turns out there wasn't one anyway.");
                    resetGame();
                    break;
                case 'helix':           // CONSULT THE MIGHTY HELIX
                    var message = helixResponse(message)
                    if (message == "*") {
                        sendToServer(channelID, "Perhaps these words of wisdom will answer your question.");
                        setTimeout(sendToServer, 500, channelID, "!pt");
                    }
                    else
                        sendToServer(channelID, message);
                    break;
                case 'help':            // HELP TEXT
                    helpResponse(channelID);
                    break;
                case 'learn':
                    learnMove(channelID, message);
                    break;
                case 'minesweeper':     // MINESWEEPER
                case 'mine':
                    minesweeper(channelID, message);
                    break;
                case 'movie':
                case 'movielist':
                    movieList(channelID, message);
                    break;
                case 'neko':            // NYAA
                    sendToServer(channelID, "ฅ^•ﻌ•^ฅ");
                case 'nja':             // NJABIFY MESSAGE
                case 'njaa':
                case 'njab':
                    sendToServer(channelID, njaaMessage(message));
                    break;
                case 'random':          // RANDOM POKEMON
                    randomPokemon(channelID);
                    break;
                case 'rollnew':
                case 'newroll':
                case 'newchar':
                case 'charnew':
                    rollNewCharacter(channelID);
                    break;
                case 'select':          // PICK RANDOM ITEM
                case 'choose':
                case 'pick':
                    pick(channelID, message);
                    break;
                case 'say':             // SAY MESSAGE
                    sendToServer(channelID, message.substring(5));
                    break;
                case 'analysis':        // SMOGON ANALYSIS
                case 'smogon':
                    smogonAnalysis(channelID, message);
                    break;
                case 'stats':
                case 'statroll':
                case 'newstats':
                    statRoll(channelID);
                    break;
                case 'tick':
                    bot.uploadFile({
                        to: channelID,
                        file: "tick.png"
                    });    
                    break;
                case 'time':
                    timeConversion(channelID, message);
                    break;
                case 'uwu':             // UWUFY MESSAGE
                case 'owo':
                    sendToServer(channelID, uwuMessage(message, false));
                    break;
                case 'vm':
                    getMeme2("video", channelID);
                    break;
                case 'weak':
                case 'weakness':
                case 'matchup':
                case 'matchups':
                case 'type':
                case 'resist':
                case 'resists':
                    weaknessCheck(channelID, message);
                    break;
                case 'wordle':
                case 'w':
                    wordle(channelID, message, user);
                    break;

                // UNLISTED

                case 'announcegeneral':     // SEND MESSAGE TO GENERAL
                    if (user == "adminblade")
                        sendToServer(serverNamePartyGeneral, message.substring(17));
                    break;
                case 'announcespam':        // SEND MESSAGE TO BOTSPAM
                    sendToServer(serverNamePartySpam, message.substring(14));
                    break;
                case 'badgirlclarice':      // MAKE CLARICE CRY
                case 'badclarice':
                case 'badgirl':
                    if (user == "Azery") {
                        sendToServer(channelID, "https://i.imgur.com/vvjcIeJ.png");
                        return;
                    }
                    bot.editUserInfo({ avatar: aviSad });
                    setTimeout(aviSetNormal, 600000);
                    setTimeout(sendToServer, 500, channelID, "https://i.imgur.com/wsm7Qny.png\nB-b-but...")
                    break;
                case 'delete':
                    bot.getMessage({
                        channelID: channelID,
                        messageID: message.split(' ')[1]
                    }, function(err, res) {
                        try {
                            if(res.author.id == "512711179752177675") {
                                bot.deleteMessage({
                                        channelID: channelID,
                                        messageID: message.split(' ')[1]
                                    }, function (err) {
                                        console.log(err)
                                });
                            } else {
                                sendToServer(channelID, "I can only delete messages sent by me!");
                            }
                        }
                        catch (e) {
                            sendToServer(channelID, "You need to follow the command with the message ID! Only my messages can be deleted.");
                        }
                    });
                    
                    break;
                case 'deletelast':
                    if (user == "adminblade") {
                        bot.deleteMessage({
                            channelID: channelID,
                            messageID: clariceLastMessageID
                        }, function (err) {
                            console.log(err)
                        })
                    }
                    break;
                case 'jaem':
                    bot.uploadFile({
                        to: channelID,
                        file: "jaem.png"
                    });
                    break;
                case 'ping':                // CHECK IF CLARICE IS AWAKE
                    sendToServer(channelID, "Beep! Breeeeloom!");
                    break;
                case 'prune':
                    prune(userID, channelID, message);
                    break;
                case 'remove':
                    if(userID == adminID) {
                        removeMeme(channelID, message);
                    }
                    else {
                        sendToServer(channelID, "Only admin can use this command, ask him!");
                    }
                    break;
                case 'sleeptite':           // U FUCKIN' KNOW IT BITCH
                    sendToServer(channelID, "https://i.imgur.com/nPLia3s.png");
                    break;
                case 'telloff':             // TELL OFF PEOPLE
                    tellOff(userID, channelID, message);
                    break;
                case 'test':                // CONSOLE LOG CHANNEL AND USER
                    console.log("ChannelID: " + channelID + "\nUserID: " + userID + "\n");
                    break;
                case 'uptime':
                    sendToServer(channelID, "I've been active for: " + uptimeFormat(process.uptime()));
                    break;
                case 'testaddrole':
                    bot.addToRole( {
                        serverID: '389839342107099136',
                        userID: adminID,
                        roleID:'613434735645032450'
                    }), function (err) {
                        console.log(err)
                        sendToServer(err.sta)
                    };
                    break;
                case 'testremoverole':
                    bot.removeFromRole( {
                        serverID: '389839342107099136',
                        userID: adminID,
                        roleID:'613434735645032450'
                    }, function (err) {
                        console.log(err)
                    });
                    break;
                case 'voltorb':
                    voltorbFlip();
                    break;
                case 'vokha':
                    {
                        sendToServer(channelID, "Yep! It's Vokha!");
                        return;
                    }
                case 'vohka':
                    {
                        sendToServer(channelID, "No, it's Vokha!");
                        return;
                    }
                case 'dndping': {
                    dndPing(channelID);
                }
                break;
            }
        }
    }
    previousMessage = currentMessage; // for use with uwu
    previousMessageChannel = channelID;
});

function addNewMemeCheck(sourceChannelID, message) {
    let hasImage = false;
    let memeTable = (sourceChannelID=="video")?"videomemes":"dndmemes";
    let tableIdName = (sourceChannelID=="video")?"videoID":"dndID";
    if(message.content=="") {
        if(message.attachments.length != 0) {
            hasImage = true;
        }
    } 
    else if(message.content.includes("http")){
        hasImage = true;
    }
    if(hasImage) {
        let queryResetAutoIncrement = "ALTER TABLE pokemon." + memeTable + " AUTO_INCREMENT = 1;";
        con.query(queryResetAutoIncrement, function (result, fields, err) { 
            let queryAddMeme = "INSERT INTO pokemon." + memeTable + " (messageID) VALUES (" + message.id + ");";
            con.query(queryAddMeme, function (result2, fields, err) { });
        });
    }
    else {
    }
}

function amaKeySmash(channelID) {
    var keyArray = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
    var output = "";
    for(var i = 0; i < 7 + Math.floor(Math.random() * 10); i++) {
        output += keyArray[Math.floor(Math.random() * keyArray.length)];
    }
    if(Math.random() < 0.25) {
        output = output.toUpperCase();
    }
    sendToServer(channelID, output);
}

const fs = require('fs');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { send, setUncaughtExceptionCaptureCallback } = require('process');
const { format } = require('path');
const { query, remove } = require('winston');
    var voiceChannelID = "646733367043162123";

function rickroll() {

    bot.joinVoiceChannel(voiceChannelID, function(error, events) {
        if (error) return console.error(error);
    
        bot.getAudioContext(voiceChannelID, function(error, stream) {
            if (error) return console.error(error);
        
            //Create a stream to your file and pipe it to the stream
            //Without {end: false}, it would close up the stream, so make sure to include that.
            fs.createReadStream('nggyu.mp3').pipe(stream, {end: false});
        
            //The stream fires `done` when it's got nothing else to send to Discord.
            stream.on('done', function() {
                //Handle
            });
        });
    });
    
}

function rickroll2() {
    bot.getAudioContext(voiceChannelID, function(error, stream) {
        if (error) return console.error(error);
    
        //Create a stream to your file and pipe it to the stream
        //Without {end: false}, it would close up the stream, so make sure to include that.
        fs.createReadStream('nggyu.mp3').pipe(stream, {end: false});
    
        //The stream fires `done` when it's got nothing else to send to Discord.
        stream.on('done', function() {
            //Handle
        });
    });   
}

function aviSetNormal() {
    bot.editUserInfo({ avatar: aviNormal });
}

function createPokemon(channelID, message, user) {
    var nameGenerator, name = "", type1, type2 = "", ability, bst, stats, height, weight

    var vowels = ['a', 'a', 'a', 'e', 'e', 'e', 'i', 'i', 'o', 'o', 'u'];
    var consonants = ['b', 'c', 'd', 'd', 'f', 'g', 'h', 'h', 'j', 'k', 'l', 'l', 'm', 'n', 'n', 'p', 'r', 'r', 's', 's', 't', 't', 't', 'v', 'w', 'x', 'y', 'z'];
    var hardConsonants = ['b', 'c', 'f', 'g', 'k', 'p', 't'];
    var softConsonants = ['h', 'l', 'l', 'l', 'r', 'r', 'r', 'y', 'w'];
    switch (Math.floor(Math.random() * 20)) {
        case 0: nameGenerator = "cvvcv"; break;
        case 1: nameGenerator = "cvcvhdv"; break; // pikachu
        case 2: nameGenerator = "vhhdvc"; break; // aggron
        case 3: nameGenerator = "cvccvccv"; break;
        case 4: nameGenerator = "hdvccv"; break;
        case 5: nameGenerator = "vccvcvv"; break;
        case 6: nameGenerator = "cvcvcvcv"; break; // giratina
        case 7: nameGenerator = "cvcvccvdc"; break;
        case 8: nameGenerator = "vccvcvvc"; break;
        case 9: nameGenerator = "hdvccvc"; break;
        case 10: nameGenerator = "cvcvvc"; break;
        case 11: nameGenerator = "hdvcvcvcc"; break;
        case 12: nameGenerator = "cvvccv"; break;
        case 11: nameGenerator = "cvdcc"; break;
        case 12: nameGenerator = "hdvvcc"; break;
        case 13: nameGenerator = "cvccvcvc"; break; // magneton
        case 14: nameGenerator = "hdvccvvcv"; break; // blastoise
        case 15: nameGenerator = "vcvc"; break; // aron
        case 16: nameGenerator = "hdvcvvc"; break; // tropius
        case 17: nameGenerator = "vddvcvcv"; break; // illumise
        case 18: nameGenerator = "hdvccvc"; break; // blissey
        case 19: nameGenerator = "hdvccvdc"; break; // swampert
    }
    for (var i = 0; i < nameGenerator.length; i++) {
        if (nameGenerator.substring(i, i + 1) == "v")
            name += vowels[Math.floor(Math.random() * vowels.length)];
        else if (nameGenerator.substring(i, i + 1) == "c")
            name += consonants[Math.floor(Math.random() * consonants.length)];
        else if (nameGenerator.substring(i, i + 1) == "h")
            name += hardConsonants[Math.floor(Math.random() * hardConsonants.length)];
        else name += softConsonants[Math.floor(Math.random() * softConsonants.length)];
    }
    name = name.substring(0, 1).toUpperCase() + name.substring(1);

    var types = ['Normal', 'Fire', 'Fighting', 'Water', 'Flying', 'Grass', 'Poison', 'Electric', 'Ground',
        'Psychic', 'Rock', 'Ice', 'Bug', 'Dragon', 'Ghost', 'Dark', 'Steel', 'Fairy'];
    var type1Index = Math.floor(Math.random() * types.length);
    type1 = types[type1Index];
    if (Math.random() < 0.5) {
        types.splice(type1Index, 1); // removes type 1 from array
        type2 = types[(Math.floor(Math.random() * types.length))];
    }

    height = (Math.floor(Math.random() * (22 - 1)) + 1) / 10;
    weight = Math.floor((Math.floor(Math.random() * (200 - 5)) + 5)) * height * 0.5;
    if (type1 == "Ghost" || type2 == "Ghost")
        weight *= 0.05;
    if (type1 == "Steel" || type2 == "Steel" || type1 == "Rock" || type2 == "Rock")
        weight *= 1.5;
    weight = Math.round(weight * 10) / 10;

    // get random stuff

    var descriptionGenerator = Math.random();

    const readline = require('readline');
    const fs = require('fs');
    const rl = readline.createInterface({
        input: fs.createReadStream('CSV/abilities.csv'),
        crlfDelay: Infinity
    });
    var rl2, rl3;
    var abilityFound = false, nounFound = false, adjectiveFound = false;
    if (descriptionGenerator > 0.45) {
        rl2 = readline.createInterface({
            input: fs.createReadStream('adjectives.csv'),
            crlfDelay: Infinity
        });
    }
    else
        adjectiveFound = true;
    if (descriptionGenerator < 0.55) {
        rl3 = readline.createInterface({
            input: fs.createReadStream('nouns.csv'),
            crlfDelay: Infinity
        });
    }
    else
        nounFound = true;
    var adjectiveNumber = Math.floor(Math.random() * 27319);
    var nounNumber = Math.floor(Math.random() * 42237);

    bst = 0;
    while(bst < 425 || bst > 575) {
        switch (Math.floor(Math.random() * 10)) // bmin, bmax, rmin, rmax, n
        {
            case 0:
                bst = randomGenerator(210, 720, 210, 720, 1); break;// flat baseline
            case 3:
            case 4:
                bst = randomGenerator(250, 370, 250, 370, 3); break; // initial peak in 300's
            case 5:
            case 6:
            case 7:
            case 8:
                bst = randomGenerator(370, 580, 370, 580, 3); break; // main peak in 400's
            default:
                bst = randomGenerator(0, 700, 400, 620, 3); break; // gradual descent towards higher BSTs
        }
    }

    if (Math.random() > 0.125)
        while (bst % 5 != 0)
            bst--;
    var bstLeft = bst;
    stats = new Int32Array(6);
    for (var i = 0; i < stats.length; i++) {
        var statValue = 0;
        while (statValue < bstLeft && statValue <= 0)
            statValue = Math.floor(Math.random() * (bst / 25)) * 5;
        stats[i] = statValue;
        bstLeft -= statValue;
    }
    while (bstLeft >= 5) {
        stats[Math.floor(Math.random() * 6)] += 5
        bstLeft -= 5;
    }
    stats[Math.floor(Math.random() * 6)] += bstLeft;
    if (Math.random() < 0.5) {
        var statChange = Math.floor(Math.random() * 2);
        stats[Math.floor(Math.random() * 6)] += statChange;
        stats[Math.floor(Math.random() * 6)] -= statChange;
    }

    var adjective = "", noun = "";
    var secondAbility = false;
    var sqlAbility = "SELECT identifier FROM Abilities WHERE id = " + (Math.floor(Math.random() * 233) + 1);
    if (Math.random() < 0.7)
        sqlAbility += " OR id = " + (Math.floor(Math.random() * 233) + 1);
    con.query(sqlAbility, function (err, result, fields) {
        ability = result[0].identifier;
        if (result.length > 1 && result[0].identifier != result[1].identifier)
            ability += " / " + result[1].identifier
        abilityFound = true;
    });

    try {
        rl2.on('line', (line) => {
            var dataLine = line.split(',');
            if (adjectiveNumber == dataLine[0]) {
                adjective = dataLine[1] + " ";
                adjectiveFound = true;
                finishPokemon();
            }
        });
    } catch (e) { console.log(e); }

    try {
        rl3.on('line', (line) => {
            var dataLine = line.split(',');
            if (nounNumber == dataLine[0]) {
                noun = dataLine[1] + " ";
                nounFound = true;
                finishPokemon();
            }
        });
    } catch (e) { console.log(e) };

    function finishPokemon() {
        if (abilityFound && adjectiveFound && nounFound) {
            if (type2 != "")
                type1 += " \/ " + type2;

            var formattedString = new String("**" + name + " (" + adjective + noun + "Pokémon)"
                + "**\nType: " + type1 + "\nAbilities: " + ability
                + "\nHP: " + stats[0] + "   Att: " + stats[1] + "   Def: " + stats[2]
                + "   SpA: " + stats[3] + "   SpD: " + stats[4] + "   Spe: " + stats[5]
                + "   BST: " + bst + "\nHeight: " + height + " m    Weight: " + weight + " kg");

            sendToServer(channelID, formattedString);
        }
    }
}

function defineWord(channelID, message) {
    var exp = /dark[\w\d\s]*side[\w\d\s]*force/i;
    if(exp.test(message)) {
        sendToServer(channelID, "**The dark side of the force**\n1. *(n.) A pathway to many abilities some consider to be unnatural*");
        return;
    }
    var input = message.split(' ')[1]; // input from discord
    for (var i = 2; i < message.split(' ').length; i++) { // for each additional word
        if (message.split(' ')[i] != null)
            input += " " + message.split(' ')[i]; // add word to input
    }

    unirest.get("https://wordsapiv1.p.rapidapi.com/words/" + input + "/definitions")
    .header("X-Mashape-Key", "568bc57230msh67e37b95b5b9316p157f6cjsn68790e0251d8")
    .header("Accept", "application/json")
    .end(function (result) {
        try {
            var outputString = "";
            outputString = "**" + toTitleCase(result.body.word) + "**";
            if (input.toLowerCase() == "prad") {
                outputString += "\n1. *(n.)*  A horse";
                sendToServer(channelID, outputString);
                return;
            }
            if (input.toLowerCase() == "horse") {
                outputString += "\n1. *(n.)*  A Prad";
                sendToServer(channelID, outputString);
                return;
            }
        } catch (e){
            sendToServer(channelID, "No word was found. Try again?");
            return;
        }
        if (result.body.definitions.length == 0) {
            defineAlternative();
            return;
        }
        for(var i = 0; i < result.body.definitions.length; i++) {
            try {
                outputString += "\n" + (i+1) + ". *(" + result.body.definitions[i].partOfSpeech.substring(0,1) + ".)  "
                + toTitleCase(result.body.definitions[i].definition.substring(0,1)) + result.body.definitions[i].definition.substring(1) + "*";
            }
            catch (e) {
                outputString += "\n" + (i+1) + ". *" + toTitleCase(result.body.definitions[i].definition.substring(0,1)) + result.body.definitions[i].definition.substring(1) + "*";
            }
        }
        sendToServer(channelID, outputString);
    });

    function defineAlternative(){
        var sqlDefine = "SELECT word, type, `definition` FROM Dictionary WHERE word=\"" + input + "\"";
        con.query(sqlDefine, function (err, result, fields) {
            if (result.length != 0) {
                var definitionString = "**" + result[0].word + "**";
                for (var i = 0; i < result.length; i++) {
                    if (i == 0 || result[i].type != result[i - 1].type)
                        definitionString += "\n*" + result[i].type + "*";
                    definitionString += "\n" + ((result.length > 1) ? (i + 1) + ". " : "") + "*" + result[i].definition + "*";
                    if (definitionString.length > 1700) {
                        definitionString = definitionString.replace(/\@/g, ",");
                        sendToServer(channelID, definitionString);
                        definitionString = "";
                    }
                }
                definitionString = definitionString.replace(/\@/g, ",");
                sendToServer(channelID, definitionString);
            }
            else
                sendToServer(channelID, "No word was found. Try again?");
        });
    }
}

function details(channelID, message) {
    var input = message.split(' ')[1]; // input from discord
    for (var i = 2; i < message.split(' ').length; i++) {
        if (message.split(' ')[i] != null)
            input += " " + message.split(' ')[i];
    }

    if(input == "random") {
        input = Math.ceil(Math.random() * 807);
    }

    var fatMons = ["Guzzlord", "Snorlax", "Wailord", "Walrein", "Lickilicky", "JellicentF", "Slaking", "Wailmer", "Garbodor", "Diggersby", "Swalot", "Hariyama", "Mr Mime", "Mamoswine", "Muk", "Victreebel", "Jynx", "Venusaur", "Miltank", "Grumpig", "Blissey", "Tangrowth", "Celesteela", "Drifblim", "Hippowdon", "Abomasnow", "Wormadam-trash", "Skuntank", "Quagsire", "Nidoqueen", "Rhyperior", "Aromatisse", "Clefable", "Weezing", "Cofagrigus"];
    if (input == "urmum" || input == "urmumlol" || input == "urmom")
        input = fatMons[Math.floor(Math.random() * fatMons.length)];
  if (input == "bibs") {
        var bibsMons = ["Bibarel", "Bibarel", "Bibarel", "Bibarel", "Bidoof", "Bidoof", "Bidoof", "Bewear", "Bewear", "Growlithe", "Electabuzz", "Boldore", "Bulbasaur",];
        input = bibsMons[Math.floor(Math.random() * bibsMons.length)];
        if (Math.random() < 0.1)
            input = pickGeneral("Alomomola Octillery Slowpoke Slowbro");
    }

    switch(message.split(' ')[1].toLowerCase()) {
        case "alola":
        case "alolan":
            input = message.split(' ')[2].toLowerCase() + "-alola";
            break;
        case "mega":
            input = message.split(' ')[2].toLowerCase() + "-mega";
            break;
    }

    var basicsComplete = false, statsComplete = false, typesComplete = false, abilitiesComplete = false, naturesComplete = false;
    var name, number, descriptor, type1, type2 = "", ability1, ability2 = "", ability3 = "", hp, att, def, spa, spd, spe, bst, height, weight;
    var response = "";
    if (isNaN(input)) {
        var basics = "SELECT identifier, id, height, weight, species_id, classification FROM Pokemon WHERE Pokemon.identifier=\"" + input + "\"";
    }
    else var basics = "SELECT identifier, id, height, weight, species_id, classification FROM Pokemon WHERE Pokemon.species_id=" + input + ";";
    con.query(basics, function (err, result, fields) {
        try {
            if (result.length != 0) {
                name = result[0].identifier;
                number = result[0].species_id;
                height = result[0].height;
                weight = result[0].weight;
                descriptor = result[0].classification;
                basicsComplete = true;
            }
            else {
                abilityCheck();
            }
        }
        catch (err) {
            sendToServer(testChannelBugs, "Error in function: details (SQL check 1)");
            sendToServer(testChannelBugs, err)
        }
    });
    if (isNaN(input))
        var stats = "SELECT PokemonStats.base_stat FROM Pokemon INNER JOIN PokemonStats ON Pokemon.id = PokemonStats.pokemon_id WHERE Pokemon.identifier=\"" + input + "\"";
    else
        var stats = "SELECT PokemonStats.base_stat FROM Pokemon INNER JOIN PokemonStats ON Pokemon.id = PokemonStats.pokemon_id WHERE Pokemon.species_id=" + input + ";";
    con.query(stats, function (err, result, fields) {
        try {
            if (result.length != 0) {
                hp = result[0].base_stat;
                att = result[1].base_stat;
                def = result[2].base_stat;
                spa = result[3].base_stat;
                spd = result[4].base_stat;
                spe = result[5].base_stat;
                bst = hp + att + def + spa + spd + spe;
                statsComplete = true;
                finishString();
            }
        }
        catch (err) {
            sendToServer(testChannelBugs, "Error in function: details (SQL check 2)");
            sendToServer(testChannelBugs, err)
        }
    });
    if (isNaN(input))
        var types = "SELECT Types.identifier FROM Pokemon INNER JOIN PokemonTypes ON Pokemon.id = PokemonTypes.pokemon_id INNER JOIN Types ON PokemonTypes.type_id = Types.id WHERE Pokemon.identifier=\"" + input + "\"";
    else
        var types = "SELECT Types.identifier FROM Pokemon INNER JOIN PokemonTypes ON Pokemon.id = PokemonTypes.pokemon_id INNER JOIN Types ON PokemonTypes.type_id = Types.id WHERE Pokemon.species_id=" + input + ";";
    con.query(types, function (err, result, fields) {
        if (result.length != 0) {
            type1 = result[0].identifier;
            if (result.length > 1)
                type2 = result[1].identifier;
            typesComplete = true;
            finishString();
        }
    });
    if (isNaN(input))
        var abilities = "SELECT Abilities.identifier FROM Pokemon INNER JOIN (Abilities INNER JOIN PokemonAbilities ON Abilities.id = PokemonAbilities.ability_id) ON Pokemon.id = PokemonAbilities.pokemon_id WHERE (Pokemon.identifier)=\"" + input + "\" ORDER BY slot";
    else
        var abilities = "SELECT Abilities.identifier FROM Pokemon INNER JOIN (Abilities INNER JOIN PokemonAbilities ON Abilities.id = PokemonAbilities.ability_id) ON Pokemon.id = PokemonAbilities.pokemon_id WHERE (Pokemon.id)=" + input + " ORDER BY slot";
    con.query(abilities, function (err, result, fields) {
        try {
            if (result.length != 0) {
                ability1 = result[0].identifier;
                if (result.length > 1 && result[1].identifier != result[0].identifier) {
                    ability2 = result[1].identifier;
                    if (result.length > 2 && result[2].identifier != result[0].identifier)
                        ability3 = result[2].identifier;
                }
                abilitiesComplete = true;
                finishString();
            }
        }
        catch (err) {
            sendToServer(testChannelBugs, "Error in function: details (SQL check 3)");
            sendToServer(testChannelBugs, err)
        }
    });

    function finishString() {
        var typeString = type1;
        if (type2 != "")
            typeString += " / " + type2;

        var abilityString = ability1
        if (ability2 != "") {
            abilityString += " / " + ability2;
            if (ability3 != "")
                abilityString += " / " + ability3;
        }

        if (basicsComplete && statsComplete && typesComplete && abilitiesComplete) {
            var formattedString = new String("**" + name + " (" + descriptor + " Pokémon) - #" + number
                + "**\nType: " + typeString + "\nAbilities: " + abilityString
                + "\nHP: " + hp + "   Att: " + att + "   Def: " + def
                + "   SpA: " + spa + "   SpD: " + spd + "   Spe: " + spe
                + "   BST: " + bst + "\nHeight: " + height / 10 + " m    Weight: " + weight / 10 + " kg");
            sendToServer(channelID, formattedString);
        }
    }

    function abilityCheck() {
        var sqlAbility = "SELECT identifier, flavor_text, generation_id FROM Abilities WHERE identifier=\"" + input + "\"";
        con.query(sqlAbility, function (err, result, fields) {
            try {
                if (result.length != 0) {
                    var flavorText = result[0].flavor_text;
                    flavorText = "*" + flavorText.replace(/\?/g, ",") + "*";
                    flavorText = flavorText.replace(/\:/g, "é");

                    // final string construction
                    var formattedString = new String("**" + result[0].identifier + "** (ability)"
                        + "\n" + flavorText)
                        + "\nGen: " + result[0].generation_id;
                    sendToServer(channelID, formattedString);
                }
                else
                    moveCheck();
            }
            catch (err) {
                sendToServer(testChannelBugs, "Error in function: abilityCheck");
                sendToServer(testChannelBugs, err)
            }
        });
    }

    function moveCheck() {
        var sqlAbility = "SELECT Moves.identifierM, Moves.flavor_text, Types.identifier, Moves.power, Moves.accuracy, Moves.pp, Moves.priority, Moves.damage_class_id FROM Types INNER JOIN Moves ON Types.id = Moves.type_id WHERE (Moves.identifierM)=\"" + input + "\"";
        con.query(sqlAbility, function (err, result, fields) {
            try {
                if (result.length != 0) {
                    var flavorText = result[0].flavor_text;
                    flavorText = "*" + flavorText.replace(/\?/g, ",") + "*";
                    flavorText = flavorText.replace(/\:/g, "é");

                    var damageCategory = "";
                    switch (result[0].damage_class_id) {
                        case 1: damageCategory = "Status"; break;
                        case 2: damageCategory = "Physical"; break;
                        case 3: damageCategory = "Special"; break;
                        default: damageCategory = "Error"; break;
                    }

                    // final string construction
                    var formattedString = new String("**" + result[0].identifierM
                        + "**\nType: " + result[0].identifier + "    Category: " + damageCategory
                        + "\nPower: " + ((result[0].power == null) ? "--" : result[0].power) + "    PP: " + result[0].pp + "    Accuracy: " + ((result[0].accuracy == null) ? "--" : result[0].accuracy) + "    Priority: " + result[0].priority
                        + "\n" + flavorText);
                    sendToServer(channelID, formattedString);
                }
                else
                    itemCheck();

            }
            catch (err) {
                sendToServer(testChannelBugs, "Error in function: moveCheck");
                sendToServer(testChannelBugs, err)
            }
        });
    }


    function itemCheck() {
        var sqlItem = "SELECT identifier, prose FROM Items WHERE identifier=\"" + input + "\"";
        con.query(sqlItem, function (err, result, fields) {
            try {
                if (result.length != 0) {
                    var prose = result[0].prose;
                    prose = "*" + prose.replace(/\?/g, ",") + "*";
                    prose = prose.replace(/\@/g, "é");

                    // final string construction
                    var formattedString = new String("**" + result[0].identifier + "**\n" + prose);
                    sendToServer(channelID, formattedString);
                }
                else
                    natureCheck();
            }
            catch (err) {
                sendToServer(testChannelBugs, "Error in function: itemCheck");
                sendToServer(testChannelBugs, err)
            }
        });
    }

    function natureCheck() {
        switch (message.split(' ')[1].toLowerCase()) {
            case "hardy": response = "**Hardy nature**\nNeutral"; break;
            case "lonely": response = "**Lonely nature**\n+Att -Def"; break;
            case "brave": response = "**Brave nature**\n+Att -Spe"; break;
            case "adamant": response = "**Adamant nature**\n+Att -SpA"; break;
            case "naughty": response = "**Naughty nature**\n+Att -SpD"; break;
            case "bold": response = "**Bold nature**\n+Def -Att"; break;
            case "docile": response = "**Docile nature**\nNeutral"; break;
            case "relaxed": response = "**Relaxed nature**\n+Def -Spe"; break;
            case "impish": response = "**Impish nature**\n+Def -SpA"; break;
            case "lax": response = "**Lax nature**\n+Def -SpD"; break;
            case "timid": response = "**Timid nature**\n+Spe -Att"; break;
            case "hasty": response = "**Hasty nature**\n+Spe - Def"; break;
            case "serious": response = "**Serious nature**\nNeutral"; break;
            case "jolly": response = "**Jolly nature**\n+Spe -SpA"; break;
            case "naive": response = "**Naive nature**\n+Spe -SpD"; break;
            case "modest": response = "**Modest nature**\n+SpA -Att"; break;
            case "mild": response = "**Mild nature**\n+SpA -Def"; break;
            case "quiet": response = "**Quiet nature**\n+SpA -Spe"; break;
            case "bashful": response = "**Bashful nature**\nNeutral"; break;
            case "rash": response = "**Rash nature**\n+SpA - SpD"; break;
            case "calm": response = "**Calm nature**\n+SpD -Att"; break;
            case "gentle": response = "**Gentle nature**\n+SpD -Def"; break;
            case "sassy": response = "**Sassy nature**\n+SpD -Spe"; break;
            case "careful": response = "**Careful nature**\n+SpD -SpA"; break;
            case "quirky": response = "**Quirky nature**\nNeutral"; break;
        }
        if (response != "")
            sendToServer(channelID, response);
        else
            sendToServer(channelID, "No Pokémon, ability, move, item or nature was found. Try again?");
    }
}

function dexSearch(channelID, message) {
    // search type, gen
    // e.g !ds dark, gen4

    if(message == null) {
        sendToServer("Invalid search parameters. Try again?");
        return;
    }
    else {
        message = message.toLowerCase();
        var parameterList = message.split(' ');
    }

    const types = ['bug','dark','dragon','electric']
}

function diceroll(channelID, message) {
    try {
        if(message.split(' ')[0].length != 2) { // if command word was 'roll' or 'dice
            message = message.substring(6);
        }
        else {
            message = message.substring(3);
        }
        message += "+"
        var quantity = "", size = "", cutoffNo = "", result, total = 0;
        var diceFlag = false, additionFlag = true, cutoffFlag = false; finalString = "", refinedString = "", multiDiceCount = 0;
        for(var i = 0; i < message.length; i++) {
            var c = message.substring(i,i+1);
            
            switch(c) {
                case ' ':
                    break;
                case '0':case '1':case '2':case '3':case '4':case '5':case '6':case '7':case '8':case '9':
                    if(!cutoffFlag) { 
                        if(!diceFlag) { // quantity is being set
                            quantity += c;
                        }
                        else {
                            size += c;
                        }
                    }
                    else { // number of rolls to be cut off is being set
                        cutoffNo += c;
                        if(cutoffNo > quantity) {
                            sendToServer(channelID, "You can't remove more dice than you roll!");
                            return;
                        }
                    }
                break;
                case 'd':
                    if(!diceFlag) {
                        if(quantity=="") {
                            quantity = "1";
                        }
                        diceFlag = true; // dice roll is to be calculated
                    }
                    else { // second d for subtracting
                        cutoffFlag = true;
                    }
                break;
                case '+':
                    if(refinedString != "") {
                        additionFlag ? refinedString += " + ": refinedString += " - ";
                    }
                    diceFlag ? result = calculateRoll(quantity, size, cutoffNo) : result = parseInt(quantity);
                    modifyString(result, quantity, size, diceFlag, additionFlag);
                    additionFlag ? total += result : total -= result;
                    additionFlag = true; // following block is to be added
                    diceFlag = false;
                    cutoffFlag = false;
                    quantity = ""; size = "";
                break;
                case '-':
                    if(refinedString != "") {
                        additionFlag ? refinedString += " + ": refinedString += " - ";
                    }                    diceFlag ? result = calculateRoll(quantity, size, cutoffNo) : result = parseInt(quantity);
                    modifyString(result, quantity, size, diceFlag, additionFlag);
                    additionFlag ? total += result : total -= result;
                    additionFlag = false; // following block is to be subtracted
                    diceFlag = false;
                    cutoffFlag = false;
                    quantity = ""; size = "";
                break;
                default:
                    sendToServer(channelID, "Something wasn't right with that input. Try again?");
                return;
            }
        }
        if (multiDiceCount > 1) {
            finalString += "\n= " + refinedString;
        }
        finalString += "\n= **" + total + "**";
        sendToServer(channelID, finalString);

        function calculateRoll(quantity, size, cutoffNo) {
            multiDiceCount += quantity;
            var sum = 0;
            let rolls = [];
            refinedString += "(";
            for(var i = 0; i < quantity; i++) {
                var num = Math.ceil(Math.random() * size);
                rolls.push(num);
                sum += num;
                if(i>0) {
                    refinedString += "+";
                }
                refinedString += num;
            }
            if(cutoffNo != "") { // if cutoffs apply
                rolls.sort(function(a, b){return a-b});
                for(let j = 0; j < cutoffNo; j++) {
                    sum -= rolls[j];
                    refinedString += "-" + rolls[j];
                }
            } 
            refinedString += ")";
            return sum;
        }

        function modifyString(result, quantity, size, diceFlag, additionFlag) {
            var stringPart = "";
            if(finalString != "") {
                additionFlag ? stringPart += " + " : stringPart += " - "
            }
            stringPart += quantity;
            if (diceFlag) {
                stringPart += "d";
                stringPart += size;
                if(cutoffFlag) {
                    stringPart += "d";
                    stringPart += cutoffNo;
                }
            }
            else {
                refinedString += quantity;
            }
            finalString += stringPart;
        }
    }
    catch (e) {
        sendToServer(channelID, "Something wasn't right with that input. Try again?");
    }
}

function displayImage(channelID, message) {
    try {
        var pokemonName = message.split(' ')[1];
        for (var i = 2; i < message.split(' ').length; i++) {
            if (message.split(' ')[i] != null) {
                pokemonName += " " + message.split(' ')[i];
            }
        }
        var imageLink = "";

        if (pokemonName.toLowerCase() == "random") {
            var randomNumber = Math.ceil(Math.random() * 809);
            if (randomNumber < 100) {
                if (randomNumber < 10) {
                    randomNumber = "00" + randomNumber;
                }
                randomNumber = "0" + randomNumber;
            }
            sendToServer(channelID, "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + randomNumber + ".png");
            return;
        }

        if (pokemonName == "urmum" || pokemonName == "urmumlol" || pokemonName == "urmom" || pokemonName == "ur mum" || pokemonName == "ur mum lol" || pokemonName == "ur mom") {
            var fatMons = ["Guzzlord", "Snorlax", "Wailord", "Walrein", "Lickilicky", "JellicentF", "Slaking", "Wailmer", "Garbodor", "Diggersby", "Swalot", "Hariyama", "Mr Mime", "Mamoswine", "Muk", "Victreebel", "Jynx", "Venusaur", "Miltank", "Grumpig", "Blissey", "Tangrowth", "Celesteela", "Drifblim", "Hippowdon", "Abomasnow", "Wormadam-trash", "Skuntank", "Quagsire", "Nidoqueen", "Rhyperior", "Aromatisse", "Clefable", "Weezing", "Cofagrigus"];
            if (Math.floor(Math.random() * 100) == 0) {
                pokemonName = "Lopunny";
            } else {
                pokemonName = fatMons[Math.floor(Math.random() * fatMons.length)];
            }
        }

        if (pokemonName == "bibs") {
            var bibsMons = ["Bibarel", "Bibarel", "Bibarel", "Bibarel", "Bidoof", "Bidoof", "Bidoof", "Bewear", "Bewear", "Growlithe", "Electabuzz"];
            pokemonName = bibsMons[Math.floor(Math.random() * bibsMons.length)];
            if (Math.random() < 0.075) {
                pokemonName = pickGeneral("Alomomola Octillery");
            }
        }

        switch (pokemonName.toLowerCase()) {
            case "owogull":
            case "uwugull": sendToServer(channelID, "https://i.imgur.com/pbFuWez.png"); return; break;
            case "meltan": sendToServer(channelID, "http://assets.pokemon.com/assets/cms2/img/pokedex/full/808.png"); return;
            case "melmetal": sendToServer(channelID, "http://assets.pokemon.com/assets/cms2/img/pokedex/full/809.png"); return;
            case "jellicentf":
            case "jellicent-f":
            case "jellicent-female": sendToServer(channelID, "http://assets.pokemon.com/assets/cms2/img/pokedex/full/593_f2.png"); return;
            case "grookey": sendToServer(channelID, "https://swordshield.pokemon.com/assets/img/common/pokemon-1.png"); return;
            case "scorbunny": sendToServer(channelID, "https://swordshield.pokemon.com/assets/img/common/pokemon-2.png"); return;
            case "sobble": sendToServer(channelID, "https://swordshield.pokemon.com/assets/img/common/pokemon-3.png"); return;
        }

        switch(message.split(' ')[1].toLowerCase()) {
            case "alola":
            case "alolan":
                pokemonName = message.split(' ')[2].toLowerCase() + "-alola";
                break;
            case "mega":
                pokemonName = message.split(' ')[2].toLowerCase() + "-mega";
                break;
        }

        var sqlImage = "";
        if (isNaN(pokemonName)) {
            sqlImage = "SELECT species_id, form_order FROM PokemonForms INNER JOIN Pokemon ON PokemonForms.pokemon_id = Pokemon.id WHERE PokemonForms.identifier=\"" + pokemonName + "\"";
        } else {
            sqlImage = "SELECT species_id, form_order FROM PokemonForms INNER JOIN Pokemon ON PokemonForms.pokemon_id = Pokemon.id WHERE PokemonForms.id=\"" + pokemonName + "\"";
        }
        con.query(sqlImage, function (err, result, fields) {
            if (result.length != 0) {
                var pokemonNumber = result[0].species_id;
                switch (pokemonNumber.toString().length) {
                    case 1: pokemonNumber = "00" + pokemonNumber; break;
                    case 2: pokemonNumber = "0" + pokemonNumber; break;
                }
                if (result[0].form_order != 1) {
                    if (result[0].species_id == "666") {
                        pokemonNumber = pokemonNumber + "_f" + Math.ceil(Math.random() * 7);
                    } else {
                        pokemonNumber = pokemonNumber + "_f" + result[0].form_order;
                    }
                }
                imageLink = "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + pokemonNumber + ".png"
                sendToServer(channelID, imageLink);
            } else {
                sendToServer(channelID, "https://i.imgur.com/JIZeHCi.png\nPokémon not found. Try again?");
            }
        });
    } catch (err) {
        sendToServer(testChannelBugs, "Error in function: displayImage");
        sendToServer(testChannelBugs, err);
    }
}

function eetFroot(channelID) {
    let frootList = ["aapel", "orenj", "gräpe", "banan", "maangoo", "peech", "dragunfr00t", "keewee", "pineaapel", "strobeery", "paire", "lemone", "liem", "melone", "papayea", "bloobeery", "rassbeery", "gräpefr00t", "plom", "chairy", "avocadoo", "feeg", "coconoot", "wotermelone", ];

    let output = "eet " + frootList[Math.floor(Math.random() * frootList.length)];
    sendToServer(channelID, output);
}

function getPTQuote(channelID) {
    try {
        const readline = require('readline');
        const fs = require('fs');
        const rl = readline.createInterface({
            input: fs.createReadStream('phonequotes.csv'),
            crlfDelay: Infinity
        });
        
        var quoserverNamerray = new Array();

        rl.on('line', (line) => {
            quoserverNamerray.push(line.split(",")[1]);
        });
        rl.on('close', () => {
            var randomNumber = Math.floor(Math.random() * quoserverNamerray.length);
            var finalString = "";
            while(quoserverNamerray[randomNumber] != "" || finalString == "") {
                finalString += quoserverNamerray[randomNumber];
                if(quoserverNamerray[randomNumber] != "") {
                    finalString += "\n";
                }
                randomNumber++;
                if(randomNumber == quoserverNamerray.length - 1) {
                    break;
                }
            }
            finalString = finalString.substring(0, finalString.length - 1);
            finalString = finalString.replace(/@/g, ',');
            sendToServer(channelID, "\"" + finalString + "\"");
        });
    }
    catch (err) {
        sendToServer(testChannelBugs, "Error in function: getPTQuote");
        sendToServer(testChannelBugs, err);
    }
}

function getMeme(sourceChannelID, channelID) {
    bot.getMessages({
        channelID: (sourceChannelID == "video")?"436556584345272339":"711595725477249024", // serverName party video-memeries or dnd-memes
        limit: 100,
        after: (sourceChannelID == "video")?pickGeneral("436556752096329758 479043285458092033 509848646226018335 563648929523171338 618815435386650645 651111414307487773 674453303937204236")
                                            : pickGeneral("711596295323779113")
    }, function (err, res) {
        var arrayIndex = Math.floor(Math.random() * res.length);
        var imageLink = "Oops! Something went wrong. (Tell admin)";
        if(res.length == 0) {
            sendToServer(channelID, "But there were no images to be found!");
            return;
        }
        if(res[arrayIndex].content=="") {
            if(res[arrayIndex].attachments.length != 0) {
                imageLink = res[arrayIndex].attachments[0].url;
            }
        } 
        else if(res[arrayIndex].content.includes("http")){
            imageLink = res[arrayIndex].content;
        }
        else {
            getMeme(sourceChannelID, channelID);
            return;
        }
        if(imageLink == "Oops! Something went wrong. (Tell admin)") {
            console.log(arrayIndex + "\n" + res);
        }
        console.log(res[arrayIndex].timestamp)
        sendToServer(channelID, imageLink);
    });
}

function getMeme2(sourceChannelID, channelID) {
    let sourceTable = (sourceChannelID=="video")?"videomemes":"dndmemes";
    let sourceIdName = (sourceChannelID=="video")?"videoID":"dndID"; // the name of the key field in the source table
    let numberOfRowsQuery = "SELECT COUNT(*) AS numberOfRows FROM " + sourceTable + ";"
    con.query(numberOfRowsQuery, function (err, result, fields) { // gets number of rows in respective table
        if(result[0]) {
            let savedMessageId = "";
            let numberOfRows = result[0].numberOfRows;
            let randomRow = Math.ceil(Math.random() * numberOfRows);
            let getMessageIdQuery = "SELECT messageID FROM " + sourceTable + " WHERE " + sourceIdName + " = " + randomRow + ";";
            con.query(getMessageIdQuery, function (err, result2, fields) { // gets the messageID for the randomly selected row
                if (result2[0]) {
                    savedMessageId = result2[0].messageID;
                    bot.getMessage({
                        channelID: (sourceChannelID == "video")?"436556584345272339":"711595725477249024", // serverName party video-memeries or dnd-memes
                        messageID: result2[0].messageID
                    }, function (err, res) {
                        let imageLink = "Oops! Something went wrong. (Tell admin)";
                        if(res) {
                            if(res.attachments.length != 0) {
                                imageLink = res.attachments[0].url;
                            }
                            else if(res.content.includes("http")){
                                imageLink = res.content;
                            }
                            if(imageLink == "Oops! Something went wrong. (Tell admin)") {
                                console.log(0 + "\n" + res);
                            }
                            sendToServer(channelID, imageLink);
                        }
                        else { // messageID not found in discord search - implies message has been deleted, id should be removed from the table
                            sendToServer(testChannelBugs, "GetMeme error - messageID: " + savedMessageId + " was not found in discord search - remove from table: " + sourceTable);
                            getMeme2(sourceChannelID, channelID);
                        }
                    });
                }
                else { // i.e. entry number not found - likely due to deletion - try again
                    console.log("Error - getMessageIdQuery returned no result.");
                    getMeme2(sourceChannelID, channelID);
                }
            });
        }
        else {
            console.log("Error - numberOfRowsQuery returned no result.");
        }
    });
    // setTimeout(getMeme2, 1000, sourceChannelID, testChannelAutospam); -- for testing getMeme spam
}

function goddammitadmin(channelID) {
    var goddammitadminMeter = 0
    var sqlGoddammit = "SELECT number FROM Goddammit";
    con.query(sqlGoddammit, function (err, result, fields) {
        goddammitadminMeter = result[0].number + 1;
        sendMeter();
    });

    function sendMeter() {
        var formattedString = "<><><><><><><><><><><><><><><><>" +
            "\n Bibs' \"GODDAMMIT admin!\" Meter:  " + goddammitadminMeter +
            "  \n<><><><><><><><><><><><><><><><>";

        sendToServer(channelID, formattedString);
        sendToServer("518191106140143626", formattedString);
        sqlGoddammitUpdate = "UPDATE Goddammit SET number=" + goddammitadminMeter + ";"
        con.query(sqlGoddammitUpdate, function (err, result, fields) {
            return;
        })
    }
}

function goddammitadminGeneral() {
    var responseArray = [" thinks you suck!", " reckons you're a second-rate reptile!",
        " thinks you need to be damned by a god!", " doesn't appreciate your little games!",
        " has never seen someone act so out of order as you just did!", " says ur mum lol",
        " pities the fool.", " is outraged by your shenanigans!"];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

function goodGirlResponse() {
    var responseArray = ["Breeeee! Thank you, ", "You're a star, ", "I love you too, ",
        "Oh gosh, thanks ", "Breeeloooom! Thank you, ", "You're too kind, ",
        "Always, ", "Anything for you, ", "Always happy to serve, ",
        "Aww thanks, ", "Thanks, ", "Always happy to help, ", "Any time, "];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

function hangman(user, channelID, message) {
    var acceptedCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ']
    if (!hangmanActive) {
        hangmanActive = true;

        if (user != "Bazaro" && (channelID == serverNamePartySpam || channelID == serverNamePartyGeneral)) {
            hangmanActive = false;
            sendToServer(channelID, "Don't send me that here, silly! Message me privately so the others can't see!");
            return;
        }
        try {
            word = message.split('\"')[1].toLowerCase(); // add fix for invalid command
        } catch (err) {
            hangmanActive = false;
            sendToServer(channelID, "Please enclose your phrase with double quotes (\").");
            return;
        }
        if (word.length == 0) {
            hangmanActive = false;
            sendToServer(channelID, "Input was invalid. Try again.");
            return;
        }
        wordLetters = word.split('');
        var illegalCharacterCheck = false;
        wordLetters.forEach(function (letter) {
            if (!acceptedCharacters.includes(letter)) {
                hangmanActive = false;
                illegalCharacterCheck = true;
            }
        })
        if (illegalCharacterCheck) {
            sendToServer(channelID, "Please only use the 26 letters of the English alphabet.");
            return;
        }
        if (hangmanActive) {
            correctLetters = new Int32Array(wordLetters.length);
            for (var i = 0; i < correctLetters.length; i++) {
                if (wordLetters[i] == ' ') {
                    correctLetters[i] = 1
                } else {
                    correctLetters[i] = 0;
                }
            }
            blankedWord = writeBlankedWord();
            incorrectLetters = [];
            var introMessage = userNickname(user) + " has started a game of hangman! Type *!hangman [letter]* to guess a letter, or *!hangman guess \"[phrase]\"* to guess the phrase itself. Type *!hangmancancel* to cancel the game.\nPhrase:  "
                + blankedWord + "\nIncorrect letters: None\nAttempts remaining: " + hangmanAttemptsLeft;
            if (channelID != serverNamePartySpam) {
                sendToServer(channelID, "Woo! Meet me over in botspam in serverName Party to watch the game!");
            }
            sendToServer(hangmanChannel, introMessage);
        }
    }
    else {
        if (message.split(' ')[1] != null) {
            if (message.split(' ')[1].toLowerCase() == "guess") {
                try {
                    if (word == message.split('\"')[1].toLowerCase()) {
                        var messageForGuesser = userNickname(user) + " correctly guessed **" + word + "**! Way to go!";
                        for (var i = 0; i < wordLetters.length; i++)
                            correctLetters[i] = 1;
                    } else {
                        var messageForGuesser = userNickname(user) + " incorrectly guessed **" + message.split('\"')[1].toLowerCase() + "**!";
                        hangmanAttemptsLeft--;
                        if (hangmanAttemptsLeft <= 0) {
                            messageForGuesser += "\n**Too bad! You ran out of guesses. The phrase was \"" + word + "\"!**";
                            sendToServer(channelID, messageForGuesser);
                            resetGame();
                            return;
                        }
                    }
                    blankedWord = writeBlankedWord();
                    updateHangmanStatus(messageForGuesser);
                    if (word == message.split('\"')[1].toLowerCase()) {
                        resetGame();
                    }
                } catch (err) {
                    sendToServer(channelID, "Write your guess in double quotes please, " + userNickname(user)) + "!";
                }
                return;
            }
        }
        else {
            sendToServer(channelID, "You forgot to write a valid input!");
            return;
        }
        try {
            var guessedLetter = message.split(' ')[1].toLowerCase();
        } catch (err) {
            sendToServer(channelID, "You didn't enter a letter to guess!");
            return;
        }
        if (guessedLetter.length != 1) {
            sendToServer(channelID, "You can only enter one letter at a time, " + userNickname(user) + "!");
            return;
        }
        if (!acceptedCharacters.includes(guessedLetter)) {
            sendToServer(channelID, "Please only use the 26 letters of the English alphabet.");
            return;
        }
        if (incorrectLetters.includes(guessedLetter)) {
            sendToServer(channelID, "That letter has already been guessed, " + userNickname(user) + "!");
            return;
        }
        var letterCorrect = false;
        var messageForGuesser = "";
        for (var i = 0; i < wordLetters.length; i++) {
            if (guessedLetter == wordLetters[i]) {
                correctLetters[i] = 1;
                var gameWon = true;
                correctLetters.forEach(function (letter) {
                    if (letter == 0)
                        gameWon = false;
                })
                if (gameWon) {
                    blankedWord = writeBlankedWord();
                    messageForGuesser += "Correct, " + userNickname(user) + "! \"" + guessedLetter.toUpperCase() + "\" is in the phrase!"
                        + "\n**The game has been won! The phrase was \"" + word + "\"!**";
                    updateHangmanStatus(messageForGuesser);
                    resetGame();
                    return;
                }
                letterCorrect = true;
            }
        }
        if (letterCorrect) {
            messageForGuesser += "Correct, " + userNickname(user) + "! \"" + guessedLetter.toUpperCase() + "\" is in the phrase!";
        } else {
            incorrectLetters.push(guessedLetter);
            messageForGuesser += "Incorrect, " + userNickname(user) + "! \"" + guessedLetter.toUpperCase() + "\" is not in the phrase.";
            hangmanAttemptsLeft--;
            if (hangmanAttemptsLeft <= 0) {
                messageForGuesser += "\n**Too bad! You ran out of guesses. The phrase was \"" + word + "\"!**";
                sendToServer(channelID, messageForGuesser);
                resetGame();
                return;
            }
        }
        blankedWord = writeBlankedWord();
        updateHangmanStatus(messageForGuesser);
        return;
    }

    function updateHangmanStatus(messageForGuesser) {
        incorrectLetters = incorrectLetters.sort();
        var incorrectLetterString = "";
        for (var i = 0; i < incorrectLetters.length; i++) {
            incorrectLetterString += incorrectLetters[i].toUpperCase() + " ";
        }
        messageForGuesser += "\n" + blankedWord + "\nIncorrect letters: " + incorrectLetterString + "\nAttempts remaining: " + hangmanAttemptsLeft;
        sendToServer(channelID, messageForGuesser);
    }

    function writeBlankedWord() {
        var blankedWordBuild = "";
        for (var i = 0; i < word.length; i++) {
            if (wordLetters[i] == ' ') {
                blankedWordBuild += "    "
            } else if (correctLetters[i] == 1) {
                blankedWordBuild += wordLetters[i].toUpperCase() + " ";
            } else {
                blankedWordBuild += "\\_ ";
            }
        }
        return blankedWordBuild;
    }
}

function helixResponse(message) {
    if (message.split(' ')[1] != null) {
        var responseArray = ["Almost certainly!", "That's right!", "Without a doubt!",
            "Sure!", "Sure, let's go for it.", "Sounds good to me!", "Probably.",
            "Most likely.", "That's looking like a solid \"Yes\".", "Yep!", "Oh yes, definitely.",
            "My circuits are feeling tingly, maybe try again?", "Sorry, I got distracted. What?",
            "I don't know, ask " + pickGeneral("Azery Bibs admin Prad Baz Njab Colin Ama Silje Arkhi Hycrox Aika Ice PT Lía") + ".",
            "Gimme a break, I don't know *everything*!", "That sure would be something, wouldn't it?", "Don't count on it.",
            "You know, sometimes these prompts are so weird I have to turn to Arceus for guidance.",
            "That's less likely than admin getting out of bed.", "No way!", "Chances aren't looking good.",
            "no u", "Not at all!", "Not a chance!", "Ha! Good one!", "I can't answer that, I wouldn't want to cause any drama.",
            "You should perish for thinking of that.", "*"];

        return responseArray[Math.floor(Math.random() * responseArray.length)];
    } else {
        return "You know I need something to respond to, right?";
    }
}

function helpResponse(channelID) {
    var helpString = "The Official Clarice Help Guide:"
        + "**\n!help** - shows this help message"
        + "**\n!say** - Clarice will echo back what you say next"
        + "**\n!dt [pokémon/dex number/move/ability/item/nature]** - displays details of the specified element"
        + "**\n!weak [type/pokémon]** - displays defensive type matchups of the specified type or Pokémon"
        + "**\n!analysis [pokémon] [meta]** - produces a link to the Smogon page of the specified Pokémon for the specified meta (if no meta is specified, defaults to SM)"
        + "**\n!image [pokémon]** - produces an image of the specified Pokémon"
        + "**\n!learn [pokémon], [move]** - finds how the specified Pokémon learns the specified move."
        + "**\n!pick [option1] [option2] ...** - Picks one of the specified options at random"
        + "**\n!random** - displays the name of a randomly selected Pokémon"
        + "**\n!helix** - consult the mighty helix fossil for advice"
        + "**\n!goodgirlclarice** - express your love for Clarice"
        + "**\n!goddammitadmin** - damn your favourite reptile to face the wrath of God"
        + "**\n!pt** - get a quote from Earth's mightiest autocorrect"
        + "**\n!nja** - njabify your sentence"
        + "**\n!uwu** - uwufy your sentence"
        + "**\n!cap** - create a randomly generated Pokémon"
        + "**\n!roll [#]d[#]** - roll a quantity and size of dice"
        + "**\n!hangman \"[phrase]\"** - start a hangman game with a word of your choice"
        + "**\n!minesweeper [5-10]** - start a minesweeper game with the specified grid size (blank for default 8)";
    sendToServer(channelID, helpString);
}

function learnMove(channelID, message) {
    var inputPokemon = "", inputMove = "";
    try {
        var inputs = message.split(',');
        inputs[0] = inputs[0].trim();
        inputs[1] = inputs[1].trim();
        inputPokemon = inputs[0].split(' ')[1];
        for (var i = 2; i <= inputs[0].split(' ').length; i++) {
            if (inputs[0].split(' ')[i] != null)
                inputPokemon += " " + inputs[0].split(' ')[i];
        }
        inputMove = inputs[1].split(' ')[0];
        for (var i = 1; i < inputs[1].split(' ').length; i++) {
            if (inputs[1].split(' ')[i] != null)
                inputMove += " " + inputs[1].split(' ')[i];
        }
    }
    catch (e) {
        sendToServer(channelID, "Input invalid, try again.");
        return;
    }

    switch(message.split(' ')[1].toLowerCase()) {
        case "alola":
        case "alolan":
            inputPokemon = message.split(' ')[2].toLowerCase().substring(0,message.split(' ')[2].length - 1) + "-alola";
            break;
        case "mega":
            inputPokemon = message.split(' ')[2].toLowerCase().substring(0,message.split(' ')[2].length - 1) + "-mega";
            break;
    }

    var sqlMoveCheck = "SELECT Pokemon.identifier, identifierM, pokemon_move_method_id, level FROM Moves INNER JOIN (PokemonMoves INNER JOIN Pokemon ON PokemonMoves.pokemon_id = Pokemon.id) ON Moves.id = PokemonMoves.move_id WHERE (Pokemon.identifier=\"" + inputPokemon + "\" AND identifierM=\"" + inputMove + "\")";
    var pokemon, move, method = "", methodNo;
    con.query(sqlMoveCheck, function (err, result, fields) {
        try {
            if (result.length != 0) {
                calculateResultDetails(0, result);
                var finalString = pokemon + " learns " + move + method;
                if (result.length > 1) {
                    for (var i = 1; i < result.length; i++) {
                        calculateResultDetails(i, result);
                        finalString += "\n" + pokemon + " also learns " + move + method;
                        // finalString += "\n" + "It also learns it" + method;
                    }
                }
                sendToServer(channelID, finalString);
            }
            else
                sendToServer(channelID, toTitleCase(inputPokemon) + " does not learn " + toTitleCase(inputMove) + ".");
        }
        catch (err) {
            sendToServer(testChannelBugs, "Error in function: learnMove");
            sendToServer(testChannelBugs, err)
        }
    });

    function calculateResultDetails(i, result) {
        pokemon = result[i].identifier; move = result[i].identifierM; methodNo = result[i].pokemon_move_method_id; level = result[i].level;
        switch (methodNo) {
            case 0: method = " upon evolving."; break;
            case 1: method = " at level " + level + "."; break;
            case 2: method = " by breeding."; break;
            case 3: method = " by move tutor."; break;
            case 4: method = " by TM or HM."; break;
            default: method = " by some weird method admin didn't think it was necessary to program."; break;
        }
    }
}

function minesweeper(channelID, message) {
    var gridSize = 8;
    if (message.split(' ')[1] != null) {
        try {
            gridSize = parseInt(message.split(' ')[1]);
            if (gridSize < 5 || gridSize > 10) {
                sendToServer(channelID, "Grid size must be a number between between 5 and 10!");
                return;
            }
        }
        catch (e) {
            sendToServer(channelID, "Grid size must be a number between between 5 and 10!");
            return;
        }
    }
    var grid = new Array(gridSize);
    for (var i = 0; i < gridSize; i++) // create grid
    {
        grid[i] = new Array(gridSize);
    }
    for (var i = 0; i < gridSize; i++) // initialising grid to 0
    {
        for (var j = 0; j < gridSize; j++) {
            grid[i][j] = 0;
        }
    }
    var bombQuantity;
    switch (gridSize) {
        case 5: bombQuantity = 5; break;
        case 6: bombQuantity = 8; break;
        case 7: bombQuantity = 10; break;
        case 8: bombQuantity = 12; break;
        case 9: bombQuantity = 15; break;
        case 10: bombQuantity = 20; break;
    }
    var mineLocationList = new Array(bombQuantity);
    for (var i = 0; i < mineLocationList.length; i++) // generate bomb locations
    {
        var complete = false;
        while (!complete) {
            var x = Math.floor(Math.random() * gridSize);
            var y = Math.floor(Math.random() * gridSize);
            var duplicateFound = false;
            mineLocationList.forEach(function (location) {
                if (x.toString() + y.toString() == location.toString())
                    duplicateFound = true;
            })
            if (!duplicateFound) {
                complete = true;
                mineLocationList[i] = x.toString() + y.toString();
            }
        }
    }
    mineLocationList.forEach(function (location) // add bombs to grid
    {
        grid[location.substring(0, 1)][location.substring(1, 2)] = -1;
    })
    for (var i = 0; i < gridSize; i++) // grid row
    {
        for (var j = 0; j < gridSize; j++) // grid column
        {
            if (grid[i][j] != -1) {
                var bombCount = 0;
                for (var k = i - 1; k < i + 2; k++) // local grid row
                {
                    for (var l = j - 1; l < j + 2; l++) // local grid column
                    {
                        if (k >= 0 && k < gridSize && l >= 0 && l < gridSize) // handles for corners and edges
                        {
                            if (grid[k][l] == -1)
                                bombCount++;
                        }
                    }
                }
                grid[i][j] = bombCount;
            }
        }
    }
    var testGridString = "";
    for (var i = 0; i < gridSize; i++) // test of numbers
    {
        for (var j = 0; j < gridSize; j++) {
            switch (grid[i][j]) {
                case -1: testGridString += "||:b:||"; break;
                case 0: testGridString += "||:white_large_square:||"; break;
                case 1: testGridString += "||:one:||"; break;
                case 2: testGridString += "||:two:||"; break;
                case 3: testGridString += "||:three:||"; break;
                case 4: testGridString += "||:four:||"; break;
                case 5: testGridString += "||:five:||"; break;
                case 6: testGridString += "||:six:||"; break;
                case 7: testGridString += "||:seven:||"; break;
                case 8: testGridString += "||:eight:||"; break;
                default: testGridString += "||:question:||"; break;
            }
        }
        testGridString += "\n";
    }
    sendToServer(channelID, "**Minesweeper!**\n" + testGridString);
}

function movieList(channelID, message) {
    if (message.split(' ')[1]) {
        if(message.split(' ')[1].toLowerCase() == "add") { // add new movie to list
            let movieName = toTitleCase(message.split("add ")[1]);
            console.log(movieName);
            let sqlAddMovie = "INSERT INTO movielist VALUES ('" + movieName + "');";
            console.log(sqlAddMovie);
            con.query(sqlAddMovie, function (err, result, fields) {
                sendToServer(channelID, "Movie added!");
                return;
            });
        }
        else if(message.split(' ')[1].toLowerCase() == "remove") { // remove existing movie from list
            let movieName = toTitleCase(message.split("remove ")[1]);
            console.log(movieName);
            let sqlAddMovie = "DELETE FROM movielist WHERE movie='" + movieName + "';";
            console.log(sqlAddMovie);
            con.query(sqlAddMovie, function (err, result, fields) {
                sendToServer(channelID, "Movie removed!");
                return;
            });
        }
        else if(message.split(' ')[1].toLowerCase() == "delete") { // remove existing movie from list
            let movieName = toTitleCase(message.split("delete ")[1]);
            console.log(movieName);
            let sqlAddMovie = "DELETE FROM movielist WHERE movie='" + movieName + "';";
            console.log(sqlAddMovie);
            con.query(sqlAddMovie, function (err, result, fields) {
                sendToServer(channelID, "Movie deleted!");
            });
            return;
        }
        else {
            sendToServer(channelID, "Unknown argument - use 'add' or 'delete' next time!");
        }
    }
    else // no requests for command, just display the list
    {
        let movies = "";
        let sqlMovieList = "SELECT * FROM movielist";
        con.query(sqlMovieList, function (err, result, fields) {
            try {
                if (result.length != 0) {
                    movies += "**Movies to Watch:**\n";
                    for(let i = 0; i < result.length; i++) {
                        movies += result[i].movie + "\n";
                    }
                    sendToServer(channelID, movies);
                }
                else
                    sendToServer(channelID, "There are no movies in the list!");
            }
            catch (err) {
                sendToServer(testChannelBugs, "Error in function: movieList");
                sendToServer(testChannelBugs, err)
            }
        });
    }
}

const schedule = require('node-schedule');
const birthdayJob = schedule.scheduleJob('0 9 * * *', function() {
    // time test
    // let d = new Date();
    // sendToServer(testChannelGeneral, "The date and time is: " + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes());
    nextBirthday(serverNamePartyGeneral, true);
  });

const dndPingJob = schedule.scheduleJob('0 16 * * 3', function() {
    dndPing(schedulingChannel);
});

const dndRoleID = "<@&632058827042455583>", schedulingChannel = "797570049908408390";
const saturdayEmoji = "<:OMayaMoeShindeiru:836825404198879302>", sundayEmoji = "<:WhyThis:916421834331799634>";
function dndPing(channelID) {
    let pingMessage = dndRoleID + "\n**D&D is on the horizon!**\nWhich days are you available this weekend? React with " + saturdayEmoji + " for Saturday, " + sundayEmoji + " for Sunday.";
    sendToServer(channelID, pingMessage);
}

function nextBirthday(channelID, autoFlag) {
    let currentDate = new Date(/*"2022-1-5"*/); // comment for testing specific dates
    let formattedCurrentDate = "'2000-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate() + "'";
    let sqlQuery = "SELECT * FROM Birthdays WHERE birthday>=" + formattedCurrentDate + " ORDER BY birthday ASC;";
    con.query(sqlQuery, function (err, result, fields) {
        let output = "";
        if(result.length > 0) {
            let monthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format;
            let dayName = new Intl.DateTimeFormat("en-US", { day:"numeric" }).format;
            let birthdayDateString = result[0].birthday.toDateString();
            let currentDateString = currentDate.toDateString();
            if(monthName(result[0].birthday) === monthName(currentDate) && dayName(result[0].birthday) === dayName(currentDate)) { // checks if today is a birthday
                if(autoFlag) {
                    output += "**Big news!**\n"
                }
                let subject = (result[0].name=="Clarice") ? "my" : result[0].name+"'s";
                output += "Today is " + subject + " birthday!";
                if (result.length > 1 && result[0].birthday.getTime() == result[1].birthday.getTime()) {
                    output += "\nIt's also " + result[1].name + "\'s birthday!";
                }
            }
            else if(!autoFlag) { // stops command if doing daily birthday check
                let subject = (result[0].name=="Clarice") ? "me" : result[0].name;
                output += "Our next birthday is for " + subject;
                // if(result[0].age != '0') {                                   // for declaring age
                //     output += ", who turns " + (result[0].age + 1);
                // }
                let dateFormat = { month: 'long', day: 'numeric' };
                output += " on " + new Intl.DateTimeFormat('en-US', dateFormat).format(result[0].birthday);
                switch(result[0].birthday.getDate()) {
                    case 1:
                    case 21:
                    case 31: output += "st!"; break;
                    case 2:
                    case 22: output += "nd!"; break;
                    case 3:
                    case 23: output += "rd!"; break;
                    default: output += "th!";
                }
                if (result.length > 1 && result[0].birthday.getTime() == result[1].birthday.getTime()) {
                    output += "\nIt will also be " + result[1].name + "\'s birthday";
                    // if(result[1].age != '0') {                                   // for declaring age
                    //     output += ", who turns " + (result[1].age + 1);
                    // }
                    output += "!";
                }
            }
            sendBirthdayMessage();
        }
        else { // after the last listed birthday so no results
            sqlQuery = "SELECT * FROM Birthdays WHERE birthday>'2000-01-01' ORDER BY birthday ASC;"
            con.query(sqlQuery, function (err, result2, fields) {
                if(result2[0].birthday.toDateString() === currentDate.toDateString()) { // checks if today is a birthday
                    output += "Today is " + result2[0].name + "'s birthday!";
                    if (result2.length > 1 && result2[0].birthday.getTime() == result[1].birthday.getTime()) {
                        output += "\nIt's also " + result2[1].name + "\'s birthday!";
                    }
                }
                else {
                    output += "Our next birthday is for " + result2[0].name;
                    // if(result2[0].age != '0') {
                    //     output += ", who turns " + (result2[0].age + 1);
                    // }                                                            // for declaring age
                    let dateFormat = { month: 'long', day: 'numeric' };
                    output += " on " + new Intl.DateTimeFormat('en-US', dateFormat).format(result2[0].birthday);
                    switch(result2[0].birthday.getDate()) {
                        case 1:
                        case 21:
                        case 31: output += "st!"; break;
                        case 2:
                        case 22: output += "nd!"; break;
                        case 3:
                        case 23: output += "rd!"; break;
                        default: output += "th!";
                    }

                    if (result2.length > 1 && result2[0].birthday.getTime() == result2[1].birthday.getTime()) {
                        output += "\nIt will also be " + result2[1].name + "\'s birthday";
                        // if(result2[1].age != '0') {
                        //     output += ", who turns " + (result2[1].age + 1);
                        // }                                                        // for declaring age
                        output += "!";
                    }
                }
                sendBirthdayMessage();
             });
        }
        function sendBirthdayMessage() {
            sendToServer(channelID, output);
        }
    });

    function incrementAge() {

    }
}

function njaaMessage(message) {
    var messageFull = message.substring(5);
    var njaaMessage = "";
    for (var i = 0; i < messageFull.length; i++) {
        if (messageFull.substring(i, 1) == "r" || messageFull.substring(i, 1) == "l")
            njaaMessage += "w";
        else
            njaaMessage += messageFull.substring(i, 1);
    }
    return njaaMessage;
}

function randomGenerator(bmin, bmax, rmin, rmax, n) { // used for BST distribution for !cap
    // Generalized random number generator;
    // sum of n random variables (usually 3).
    // Bell curve spans bmin<=x<bmax; then,
    // values outside rmin<=x<rmax are rejected.
    var i, u, sum;
    do {
        sum = 0;
        for (i = 0; i < n; i++)
            sum += bmin + (Math.random() * (bmax - bmin));
        if (sum < 0)
            sum -= n - 1; /* prevent pileup at 0 */
        u = sum / n;
    } while (!(rmin <= u && u < rmax));
    return Math.floor(u);
}

function randomPokemon(channelID) {
    var sqlRandom = "SELECT Pokemon.identifier FROM Pokemon WHERE species_id=\"" + Math.floor(Math.random() * 808) + "\"";
    con.query(sqlRandom, function (err, result, fields) {
        sendToServer(channelID, "I pick " + result[0].identifier + "!");
    });
}

function removeMeme(channelID, message) {
    if(message.includes("dnd")) {
        let messageID = message.split(' ')[2];
        let sqlRemoveDnd = "DELETE FROM pokemon.dndmemes WHERE messageID=\"" + messageID + "\"";
        con.query(sqlRemoveDnd, function (err, result, fields) {
            if(result) {
                sendToServer(channelID, "Meme with ID: " + message.split(' ')[2] + " removed from table: dndmemes");
                let sqlAutoIncrement = "ALTER TABLE dndmemes AUTO_INCREMENT=1";
                con.query(sqlAutoIncrement, function(err, result, fields) {
                    if(!result) {
                        sendToServer(err.message);
                    }
                });
            } else {
                sendToServer(channelID, "SQL Error:\n" + err.message);
            }
        });
    }
    else if(message.includes("video")) {
        let messageID = message.split(' ')[2];
        let sqlRemoveVideo = "DELETE FROM pokemon.videomemes WHERE messageID=\"" + messageID + "\"";
        console.log(sqlRemoveVideo);
        con.query(sqlRemoveVideo, function (err, result, fields) {
            if(result) {
                sendToServer(channelID, "Meme with ID: " + message.split(' ')[2] + " removed from table: videomemes");
                let sqlAutoIncrement = "ALTER TABLE videomemes AUTO_INCREMENT=1";
                con.query(sqlAutoIncrement, function(err, result, fields) {
                    if(!result) {
                        sendToServer(err.message);
                    }
                });
            }
            else {
                sendToServer(channelID, "SQL Error:\n" + err.message);
            }
        });
    }
}

function resetGame() {
    word = "";
    wordLetters = [];
    correctLetters = [];
    incorrectLetters = [];
    blankedWord = "";
    hangmanActive = false;
    hangmanAttemptsLeft = 8;
}

function rollNewCharacter(channelID) {
    let race = pickGeneral("Dragonborn Dwarf Elf Gnome Half-Elf Halfling Half-Orc Human Tiefling Orc Leonin Satyr Aarakocra Genasi Goliath Aasimar Bugbear Firbolg Goblin Hobgoblin Kenku Kobold Lizardfolk Tabaxi Triton Yuan-ti Tortle Changeling Kalashtar Shifter Warforged Gith Centaur Loxodon Minotaur Vedalken Verdan Locathah Grung Xiphonian Gnoll");

    let charClass = pickGeneral("Barbarian Bard Cleric Druid Fighter Monk Paladin Ranger Rogue Sorcerer Warlock Wizard Artificer");

    let sex = pickGeneral("Male Female");

    let background = ["Acolyte", "Charlatan", "Criminal", "Entertainer", "Folk Hero", "Guild Artisan", "Hermit", "Noble", "Outlander", "Sage", "Sailor", "Soldier", "Urchin"];

    let alignment = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];

    let stats = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];

    let output = "**" + race + " " + charClass + "**\n*" + sex + " – " + background[Math.floor(Math.random() * background.length)] + " – " + alignment[Math.floor(Math.random() * alignment.length)] + "*\n";
    for(let i = 0; i < stats.length; i++) {
        let rolls = [], smallestRoll = 6, sum = 0;
        for(let j = 0; j < 4; j++) {
            rolls.push(Math.ceil(Math.random() * 6));
        }
        for(let j = 0; j < rolls.length; j++) {
            if (rolls[j] < smallestRoll) {
                smallestRoll = rolls[j];
            }
            sum += rolls[j];
        }
        sum -= smallestRoll;
        output += stats[i] + ": " + sum + "   ";
        if(i==2) {
            output += "\n";
        }
    }
    sendToServer(channelID, output);
}

function pick(channelID, message) {
    try {
        console.log(message.substring(6));
        var options = message.substring(6).split(',');
        var randomNumber = Math.floor(Math.random() * options.length);
        if (options[randomNumber] == null)
            sendToServer(channelID, "You didn't give me anything to pick from, silly!");
        else
            sendToServer(channelID, "I pick " + options[randomNumber].trim() + "!");
    }
    catch (err) {
        sendToServer(testChannelBugs, "Error in function: pick");
        sendToServer(testChannelBugs, err);
    }
}

function prune(userID, channelID, message) {
    if(userID == "540791878409256960" /* prad */ || userID == "226459092598784004" /* Hycrox */ || userID == adminID) {
        let numToDelete = 0;
        if(message.split(' ')[1]) {
            try {
                numToDelete = parseInt(message.split(' ')[1]) + 1; // + 1 includes the parse message;
                if(numToDelete > 99) {
                    numToDelete = 99;
                }
                bot.getMessages({
                    channelID: channelID,
                    limit: numToDelete,
                }, function (err, res) {
                    var messagesToDelete = new Array(numToDelete);
                    for(var i = 0; i < numToDelete; i++) {
                        messagesToDelete[i] = res[i].id;
                    }
                    bot.deleteMessages({
                        channelID: channelID,
                        messageIDs: messagesToDelete
                    });
                });
            } catch (err) {
                sendToServer(testChannelBugs, "Error in function: prune");
                sendToServer(testChannelBugs, err);
                sendToServer(channelID, "Something was wrong with that input.");
                return;
            }
        }
    }
}

function pickGeneral(stringOptions) {
    return stringOptions.split(' ')[Math.floor(Math.random() * stringOptions.split(' ').length)];
}

function sendToServer(channelID, message, simulateType) {
    bot.sendMessage({
        to: channelID,
        message: message,
        // typing: (simulateType == null) ? false : true
        typing: false
    });
    bot.sendMessage({
        to: testChannelLog,
        message: "ChannelID: " + channelID + "\n" + message + "\n-"
    });
}

function smogonAnalysis(channelID, message) {
    try {
        var metaValid = false;
        var metaName = "sm";
        var pokemonName = message.split(' ')[1];
        var genNo = 7;
        if (message.split(' ')[2] != null) {
            metaValid = true;
            metaName = message.split(' ')[2].toLowerCase();
            switch (message.split(' ')[2]) {
                case "rb": genNo = 1; break;
                case "gs": genNo = 2; break;
                case "rs": genNo = 3; break;
                case "dp": genNo = 4; break;
                case "bw": genNo = 5; break;
                case "xy": genNo = 6; break;
                case "sm": genNo = 7; break;
                default: metaValid = false; metaName = "sm"; break;
            }
        }
        else
            metaValid = true;

        if (metaValid) {
            var sqlSmogon = "SELECT identifier, generation_id FROM PokemonSpecies WHERE identifier=\"" + pokemonName + "\"";
            con.query(sqlSmogon, function (err, result, fields) {
                if (result.length != 0) {
                    if (result[0].generation_id <= genNo) {
                        pokemonName = result[0].identifier.replace(' ', '_');
                        pokemonName = pokemonName.toLowerCase();
                        var smogonLink = "https://www.smogon.com/dex/" + metaName.toLowerCase() + "/pokemon/" + pokemonName + "/"
                        sendToServer(channelID, smogonLink);
                    }
                    else
                        sendToServer(channelID, result[0].identifier + " is not in Gen " + genNo + "!");
                }
                else
                    sendToServer(channelID, "Pokémon not found. Try again?");
            });
        }
        else
            sendToServer(channelID, "Invalid meta specified. Try RB, GS, RS, DP, BW, XY or SM.");
    }
    catch (err) {
        sendToServer(testChannelBugs, "Error in function: smogonAnalysis");
        sendToServer(testChannelBugs, err);
    }
}

function statRoll(channelID) {
    let output = "Your rolls: ";
    for(let i = 0; i < 6; i++) {
        let rolls = [], smallestRoll = 6, sum = 0;
        for(let j = 0; j < 4; j++) {
            rolls.push(Math.ceil(Math.random() * 6));
        }
        for(let j = 0; j < rolls.length; j++) {
            if (rolls[j] < smallestRoll) {
                smallestRoll = rolls[j];
            }
            sum += rolls[j];
        }
        sum -= smallestRoll;
        output += sum;
        if(i != 5) {
            output += ", ";
        }
    }
    sendToServer(channelID, output);
}

function tellOff(userID, channelID, message) {
   
}

function timeConversion(channelID, message) {
    let messageParts = message.split(' ');
    if(messageParts.length == 3) { // contains both reference person and time as expected
        let refPerson = messageParts[1].toLowerCase(); // person referenced in the original message, used to base starting time off of
        let refTimeContainer = messageParts[2].toLowerCase(), refTime, refMinute; // array to hold referenced time and minute (not yet implemented)
        if(!refTimeContainer.includes(":")) {
            refMinute = 0; // default
            refTime = parseInt(refTimeContainer.substr(0, (refTimeContainer.indexOf('m'))-1)); // substring up to am/pm, gets numbers only
            if(refTimeContainer.substr(refTimeContainer.length-2) == 'pm' && refTime != 12) {
                refTime += 12;
            };
            if(refTimeContainer.substr(refTimeContainer.length-2) == 'am' && refTime == 12) { // 12am i.e. midnight
                refTime -= 12;
            };
            let utcMod; // the referenced person's 'standard' reference point from UTC based on their time zone, i.e. before daylight savings time is applied
            switch (refPerson) {
                case 'pt': case 'personthing': case 'nick': utcMod = 5.0; break; // CHANGE THESE WHEN DST OCCURS + see timezoneMods below ↴
                case 'baz': case 'bazaro': case 'jon': utcMod = 4.0; break;
                case 'admin': case 'james': case 'adamant': case 'adam': case 'hyc': case 'hycrox': case 'mark': utcMod = -1.0; break;
                case 'lia': case 'lía': case 'etesian': case 'ete': utcMod = -2.0; break;
                case 'prad': case 'pradyot': case 'ironbound': utcMod = /*-5.5;*/ 4.0; break;
                default: sendToServer(channelID, "Name not found. Try again?"); return;
            }
            let utcTime = refTime + utcMod; // calculate UTC time based on standard reference point
            let adjustedTimes = ["", "", "", "", ""];
            let timezoneMods = [-5.0, -4.0, 1.0, 2.0, 5.5]; // CHANGE THESE WHEN DST OCCURS (winnipeg, boston, gb, spain, india)
            let meridian = "";
            for(var i = 0; i < adjustedTimes.length; i++) {
                let tempTime = utcTime + timezoneMods[i];
                if(tempTime >= 0.0 && tempTime <= 12) {
                    if(tempTime == 12) {
                        meridian = "pm";
                    } else {
                        meridian = "am"
                    }
                }
                else {
                    if(tempTime < 0.0) {
                        tempTime = 24.0 + tempTime;
                    }
                    if(tempTime >= 24.0) {
                        meridian = "am";
                    } else {
                        meridian = "pm"
                    }
                    if(tempTime != 12.0)
                        tempTime %= 12;
                }
                if(Number.isInteger(tempTime)) { // for whole hour times
                    if(tempTime == 0.0) // adjusts 0am to 12am
                        tempTime = 12.0;
                    adjustedTimes[i] = tempTime + meridian;
                } else { // for half hour times
                    if(tempTime == 0.0 || tempTime == 0.5)
                        tempTime = 12.0; // adjusts 0am to 12am
                    adjustedTimes[i] = tempTime.toString().split('.')[0] + ":30" + meridian;
                }
                
            }
            let finalString = "**" + refTimeContainer + " in " + toTitleCase(refPerson) + "'s timezone is:**\nPT: " + adjustedTimes[0] + "\nBaz/Prad: " + adjustedTimes[1] + "\nHyc/James/admin: " + adjustedTimes[2] + "\nEte/Lía: " + adjustedTimes[3] /*INDIA + "\nPrad: " + adjustedTimes[4]*/;
                sendToServer(channelID, finalString);
        }
        else {
            sendToServer(channelID, "Time conversions must be formatted as !time [person] [integer][am/pm].");
            return;
        }
        
        let winnipegModifier = -6.0, ohioModifier = -5.0, ukModifier = 0.0, europeModifier = 1.0, indiaModifier = 5.5;
        // let overrideZone = DateTime.fromISO("2000-01-01")
    }
    else {
        sendToServer(channelID, "Time conversions must be formatted as !time [person] [integer][am/pm].");
        return;
    }
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function uptimeFormat(seconds) {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

function userNickname(user) {
    switch (user) {
        /* Code here has been redacted for privacy purposes */
        default: return user;
    }
}

function uwuMessage(message, isForPrevious) {
    var messageFull = message.substring(5);
    var uwuMessage = "";
    for (var i = 0; i < messageFull.length; i++) {
        if (messageFull.substring(i, i + 1) == "r" || messageFull.substring(i, i + 1) == "l")
            uwuMessage += "w";
        else if (messageFull.substring(i, i + 1) == "R" || messageFull.substring(i, i + 1) == "L")
            uwuMessage += "W";
        else
            uwuMessage += messageFull.substring(i, i + 1);
    }
    return uwuMessage;
}

function voltorbFlip(channelID, message) {
    var gameGrid = new Array[5][5];
    var pointCount = 0, voltorbCount = 0;
    console.log(gameGrid.length());
    for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 5; j++) {
            pointCount = 0;
            voltorbCount = 0;
            var number = Math.floor(Math.random() * 5);
            gameGrid[i][j] = number;
            if(number == 0) {
                voltorbCount++;
            }
            else {
                pointCount += number;
            }
        }
    }
    var messageToSend = "";
    // for(var i = 0; i < )
}

function weaknessCheck(channelID, message) {
    var input = message.split(' ')[1].toLowerCase();
    var sqlTypeNo = "SELECT id FROM Types WHERE identifier=\"" + input + "\"";
    var typeNo = -1; 
    con.query(sqlTypeNo, function (err, result, fields) {
        try {
            if (result.length != 0) {
                typeNo = result[0].id;
                var sqlWeaknessType = "SELECT identifier, damage_factor FROM Types INNER JOIN TypeEffectiveness ON Types.id = TypeEffectiveness.damage_type_id WHERE target_type_id=" + typeNo;
                con.query(sqlWeaknessType, function (err, result, fields) {
                    var matchupString = "**" + toTitleCase(input) + " Type Defensive Matchups**\nWeak:   ";
                    var damageFactors = new Array(18);
                    for (var i = 0; i < result.length; i++) {
                        damageFactors[i] = result[i].damage_factor;
                    }
                    if(message.split(' ')[2] != null) { // if second type was specified
                        var sqlTypeNo = "SELECT id FROM Types WHERE identifier=\"" + message.split(' ')[2].toLowerCase() + "\"";
                        con.query(sqlTypeNo, function (err, result, fields) {
                            if(result.length != 0) {
                                typeNo = result[0].id;
                                var sqlWeaknessType = "SELECT identifier, damage_factor FROM Types INNER JOIN TypeEffectiveness ON Types.id = TypeEffectiveness.damage_type_id WHERE target_type_id=" + typeNo;
                                con.query(sqlWeaknessType, function (err, result, fields) {
                                    if(result.length != 0) {
                                        for (var i = 0; i < result.length; i++) {
                                            damageFactors[i] = damageFactors[i] * result[i].damage_factor;
                                        }
                                        var inputTypesString = toTitleCase(message.split(' ')[1]) + " / " + toTitleCase(message.split(' ')[2]);
                                        var matchupString = "**" + inputTypesString + " Defensive Matchups**\nWeak (4x):   "
                                        var weak4Found = false;
                                        for (var i = 0; i < 18; i++) {
                                            if (damageFactors[i] == 40000) {
                                                matchupString += "*" + result[i].identifier + "*   ";
                                                weak4Found = true;
                                            }
                                        }
                                        if (!weak4Found)
                                            matchupString += "None";
                                        matchupString += "\nWeak (2x):   ";
                                        var weak2Found = false;
                                        for (var i = 0; i < 18; i++) {
                                            if (damageFactors[i] == 20000) {
                                                matchupString += "*" + result[i].identifier + "*   ";
                                                weak2Found = true;
                                            }
                                        }
                                        if (!weak2Found)
                                            matchupString += "None";
                                        matchupString += "\nResists (2x):   ";
                                        var resist2Found = false;
                                        for (var i = 0; i < 18; i++) {
                                            if (damageFactors[i] == 5000) {
                                                matchupString += "*" + result[i].identifier + "*   ";
                                                resist2Found = true;
                                            }
                                        }
                                        if (!resist2Found)
                                            matchupString += "None";
                                        matchupString += "\nResists (4x):   ";
                                        var resist4Found = false;
                                        for (var i = 0; i < 18; i++) {
                                            if (damageFactors[i] == 2500) {
                                                matchupString += "*" + result[i].identifier + "*   ";
                                                resist4Found = true;
                                            }
                                        }
                                        if (!resist4Found)
                                            matchupString += "None";
                                        matchupString += "\nImmune:   ";
                                        var immuneFound = false;
                                        for (var i = 0; i < 18; i++) {
                                            if (damageFactors[i] == 0) {
                                                matchupString += "*" + result[i].identifier + "*   ";
                                                immuneFound = true;
                                            }
                                        }
                                        if (!immuneFound)
                                            matchupString += "None";
                                        sendToServer(channelID, matchupString);
                                    }
                                })
                            }
                            else {
                                sendToServer(channelID, "Something was wrong with that input. Try again?");
                            }
                        })
                    }
                    else {
                        finishTypeWeaknessString(result);
                    }

                    function finishTypeWeaknessString(result) {
                        for (var i = 0; i < damageFactors.length; i++) {
                            if (damageFactors[i] == 200)
                                matchupString += "*" + result[i].identifier + "*   ";
                        }
                        matchupString += "\nResists:   ";
                        for (var i = 0; i < result.length; i++) {
                            if (damageFactors[i] == 50)
                                matchupString += "*" + result[i].identifier + "*   ";
                        }
                        matchupString += "\nImmune:   ";
                        var immuneFound = false;
                        for (var i = 0; i < result.length; i++) {
                            if (damageFactors[i] == 0) {
                                matchupString += "*" + result[i].identifier + "*   ";
                                immuneFound = true;
                            }
                        }
                        if (!immuneFound)
                            matchupString += "None";
                        sendToServer(channelID, matchupString);
                    }
                })
            }
            else // if pokemon name was entered rather than type name
                pokemonWeaknessCheck();
        }
        catch (err) {
            sendToServer(testChannelBugs, "Error in function: weaknessCheck");
            sendToServer(testChannelBugs, err)
        }
    });

    function pokemonWeaknessCheck() {
        for (var i = 2; i < message.split(' ').length; i++) {
            if (message.split(' ')[i] != null)
                input += " " + message.split(' ')[i];
        }
        var sqlWeaknessPokemon = "SELECT type_id FROM Pokemon INNER JOIN PokemonTypes ON Pokemon.id = PokemonTypes.pokemon_id WHERE identifier=\"" + input + "\"";
        con.query(sqlWeaknessPokemon, function (err, result, fields) {
            try {
                if (result.length != 0) {
                    var typeNames = new Array(18);
                    var type1Matchups = new Int16Array(18);
                    var type2Matchups = new Int16Array(18);
                    var sqlType1Check = "SELECT identifier, damage_factor FROM Types INNER JOIN TypeEffectiveness ON Types.id = TypeEffectiveness.damage_type_id WHERE target_type_id=" + result[0].type_id;
                    con.query(sqlType1Check, function (err, result, fields) {
                        for (var i = 0; i < result.length; i++) {
                            type1Matchups[i] = result[i].damage_factor;
                            typeNames[i] = result[i].identifier;
                        }
                        attemptType2Query();
                    })

                    function attemptType2Query() {
                        if (result.length > 1) {
                            var sqlType2Check = "SELECT identifier, damage_factor FROM Types INNER JOIN TypeEffectiveness ON Types.id = TypeEffectiveness.damage_type_id WHERE target_type_id=" + result[1].type_id;
                            con.query(sqlType2Check, function (err, result, fields) {
                                for (var i = 0; i < result.length; i++)
                                    type2Matchups[i] = result[i].damage_factor;
                                finishWeaknessString();
                            })
                        }
                        else {
                            for (var i = 0; i < 18; i++)
                                type2Matchups[i] = 100;
                            finishWeaknessString();
                        }
                    }

                    function finishWeaknessString() {
                        var matchupString = "**" + toTitleCase(input) + " Defensive Matchups**\nWeak (4x):   "
                        var weak4Found = false;
                        for (var i = 0; i < 18; i++) {
                            if (type1Matchups[i] * type2Matchups[i] == 40000) {
                                matchupString += "*" + typeNames[i] + "*   ";
                                weak4Found = true;
                            }
                        }
                        if (!weak4Found)
                            matchupString += "None";
                        matchupString += "\nWeak (2x):   ";
                        var weak2Found = false;
                        for (var i = 0; i < 18; i++) {
                            if (type1Matchups[i] * type2Matchups[i] == 20000) {
                                matchupString += "*" + typeNames[i] + "*   ";
                                weak2Found = true;
                            }
                        }
                        if (!weak2Found)
                            matchupString += "None";
                        matchupString += "\nResists (2x):   ";
                        var resist2Found = false;
                        for (var i = 0; i < 18; i++) {
                            if (type1Matchups[i] * type2Matchups[i] == 5000) {
                                matchupString += "*" + typeNames[i] + "*   ";
                                resist2Found = true;
                            }
                        }
                        if (!resist2Found)
                            matchupString += "None";
                        matchupString += "\nResists (4x):   ";
                        var resist4Found = false;
                        for (var i = 0; i < 18; i++) {
                            if (type1Matchups[i] * type2Matchups[i] == 2500) {
                                matchupString += "*" + typeNames[i] + "*   ";
                                resist4Found = true;
                            }
                        }
                        if (!resist4Found)
                            matchupString += "None";
                        matchupString += "\nImmune:   ";
                        var immuneFound = false;
                        for (var i = 0; i < 18; i++) {
                            if (type1Matchups[i] * type2Matchups[i] == 0) {
                                matchupString += "*" + typeNames[i] + "*   ";
                                immuneFound = true;
                            }
                        }
                        if (!immuneFound)
                            matchupString += "None";
                        sendToServer(channelID, matchupString);
                    }
                }
                else
                    sendToServer(channelID, "No type or Pokémon was found. Try again?");
            }
            catch (err) {
                sendToServer(testChannelBugs, "Error in function: pokemonWeaknessCheck");
                sendToServer(testChannelBugs, err)
            }
        })
    }
}

let wordleGameInProgress = false;
    let currentPlayer, wordleValidAnswers = "", wordleValidGuesses = "", correctAnswer, wordleGuessesLeft = 6, cumulativeOutput = "";
    function wordle(channelID, message, user) {
        // check if there is a game in progress
        if(wordleGameInProgress) {
            //check if an input has been entered
            if(!message.split(' ')[1]) {
                sendToServer(channelID, "There's already a Wordle game in progress. Wait for it to finish before starting a new one. To cancel the current game, type \`\`!wordle cancel\`\`.");
                return;
            }
            else { // an input has been entered
                let input = message.split(' ')[1].toLowerCase();
                // check if cancelling game
                if (input == "cancel") {
                    sendToServer(channelID, `Game cancelled. The correct answer was **${correctAnswer}**.`);
                    wordleGameInProgress = false;
                    return;
                }
                // check if asking for reminder
                if (input == "reminder" || input == "remind") {
                    if(cumulativeOutput == "") {
                        sendToServer(channelID, "You haven't started guessing yet!");
                        return;
                    }
                    sendToServer(channelID, "Your current guesses:" + cumulativeOutput);
                    return;
                }
                if (input == "who") {
                    sendToServer(channelID, "The current player is " + userNickname(currentPlayer) + "!");
                    return;
                }
                if (input == "letters") {
                    // check for unused letters here
                }
                // check if current player
                if (user != currentPlayer) {
                    sendToServer(channelID, userNickname(currentPlayer) + " is currently playing! Wait for them to finish, or type \`\`!wordle cancel\`\` to stop the current game.");
                    return;
                }
                // test input for valid characters
                if (input.length != 5) {
                    sendToServer(channelID, "Your guess must be 5 letters long!")
                    return;
                }
                if (!input.match("[a-z]{5}")) {
                    sendToServer(channelID, "Your guess must only contain English letters!");
                    return;
                }
                if(!wordleValidGuesses.includes(input) && !wordleValidAnswers.includes(input)) {
                    sendToServer(channelID, "That guess isn't a valid word!");
                    return;
                }
                // input is valid hereafter
                let output = "";
                let correctlyGuessedLetters = "";
                for(var i = 0; i < correctAnswer.length; i++) {
                    if(correctAnswer.substring(i,i+1) == input.substring(i,i+1)) {
                        correctlyGuessedLetters += correctAnswer.substring(i,i+1);
                    }
                }
                for(var i = 0; i < correctAnswer.length; i++) {
                    if(correctAnswer.includes(input.substring(i,i+1))) { // letter matches
                        if(correctAnswer.substring(i,i+1) == input.substring(i,i+1)) { // position matches
                            output += getWordleEmoji("green", input.substring(i,i+1));
                        } 
                        else { // position doesn't match
                            let numberOfThisLetterInCorrectlyGuessed = 0; // note: *in* 'correctlyGuessed', not 'incorrectlyGuessed'
                            let numberOfThisLetterInCorrectWord = 0; // same as above
                            for(var j = 0; j < correctlyGuessedLetters.length; j++) {
                                if(correctlyGuessedLetters[j] == input.substring(i,i+1)) {
                                    numberOfThisLetterInCorrectlyGuessed++;
                                }
                            }
                            for(var j = 0; j < correctAnswer.length; j++) {
                                if(correctAnswer[j] == input.substring(i,i+1)) {
                                    numberOfThisLetterInCorrectWord++;
                                }
                            }
                            if(numberOfThisLetterInCorrectlyGuessed < numberOfThisLetterInCorrectWord) {
                                output += getWordleEmoji("yellow", input.substring(i,i+1));
                            }
                            else {
                                output += getWordleEmoji("grey", input.substring(i,i+1));
                            }
                        }
                    }
                    else { // letter doesn't match
                        output += getWordleEmoji("grey", input.substring(i,i+1));
                    }

                    function getWordleEmoji(colour, letter) {
                        let emojiID;
                        switch(colour) {
                            case "green":
                                switch(letter) {
                                    case "a": emojiID = "938084998664314920"; break;
                                    case "b": emojiID = "938085009829548032"; break;
                                    case "c": emojiID = "938085060526112808"; break;
                                    case "d": emojiID = "938085071313862816"; break;
                                    case "e": emojiID = "938085081216589834"; break;
                                    case "f": emojiID = "938085089634553937"; break;
                                    case "g": emojiID = "938085098555834508"; break;
                                    case "h": emojiID = "938085108370505728"; break;
                                    case "i": emojiID = "938085117853859891"; break;
                                    case "j": emojiID = "938085127492354110"; break;
                                    case "k": emojiID = "938085136996663346"; break;
                                    case "l": emojiID = "938085145594982470"; break;
                                    case "m": emojiID = "938085153677385790"; break;
                                    case "n": emojiID = "938085161852104717"; break;
                                    case "o": emojiID = "938085182731337779"; break;
                                    case "p": emojiID = "938085193997238292"; break;
                                    case "q": emojiID = "938085203686064189"; break;
                                    case "r": emojiID = "938085214415118366"; break;
                                    case "s": emojiID = "938085222241693776"; break;
                                    case "t": emojiID = "938085231938908221"; break;
                                    case "u": emojiID = "938085326533066803"; break;
                                    case "v": emojiID = "938085336817471489"; break;
                                    case "w": emojiID = "938085350792888349"; break;
                                    case "x": emojiID = "938085360855035935"; break;
                                    case "y": emojiID = "938085370896199703"; break;
                                    case "z": emojiID = "938085390458421268"; break;
                                }
                            break;
                            case "yellow":
                                switch(letter) {
                                    case "a": emojiID = "938090629253185637"; break;
                                    case "b": emojiID = "938090639340503050"; break;
                                    case "c": emojiID = "938090648492458014"; break;
                                    case "d": emojiID = "938090660282630156"; break;
                                    case "e": emojiID = "938090671863128124"; break;
                                    case "f": emojiID = "938090681891688528"; break;
                                    case "g": emojiID = "938090691890933791"; break;
                                    case "h": emojiID = "938090716951883826"; break;
                                    case "i": emojiID = "938090727815147551"; break;
                                    case "j": emojiID = "938090737562693712"; break;
                                    case "k": emojiID = "938090747037614110"; break;
                                    case "l": emojiID = "938090757112352868"; break;
                                    case "m": emojiID = "938090768101425182"; break;
                                    case "n": emojiID = "938090778490699856"; break;
                                    case "o": emojiID = "938090788875808889"; break;
                                    case "p": emojiID = "938090799424503809"; break;
                                    case "q": emojiID = "938090809822175312"; break;
                                    case "r": emojiID = "938090819259359253"; break;
                                    case "s": emojiID = "938090830382657626"; break;
                                    case "t": emojiID = "938090840901951540"; break;
                                    case "u": emojiID = "938090850557231145"; break;
                                    case "v": emojiID = "938090861336616960"; break;
                                    case "w": emojiID = "938090883331555348"; break;
                                    case "x": emojiID = "938090903556476979"; break;
                                    case "y": emojiID = "938090914063187988"; break;
                                    case "z": emojiID = "938090925865988126"; break;
                                }
                            break;
                            case "grey":
                                switch(letter) {
                                    case "a": emojiID = "938085441310175303"; break;
                                    case "b": emojiID = "938085450785120286"; break;
                                    case "c": emojiID = "938085468476670042"; break;
                                    case "d": emojiID = "938085490949750834"; break;
                                    case "e": emojiID = "938085500613447711"; break;
                                    case "f": emojiID = "938085546461368391"; break;
                                    case "g": emojiID = "938085558704558151"; break;
                                    case "h": emojiID = "938085575796338760"; break;
                                    case "i": emojiID = "938085586063995001"; break;
                                    case "j": emojiID = "938085596822388777"; break;
                                    case "k": emojiID = "938085608218329139"; break;
                                    case "l": emojiID = "938085619249324032"; break;
                                    case "m": emojiID = "938085629609250876"; break;
                                    case "n": emojiID = "938085643047825468"; break;
                                    case "o": emojiID = "938085655454572575"; break;
                                    case "p": emojiID = "938085666871472239"; break;
                                    case "q": emojiID = "938085677583716382"; break;
                                    case "r": emojiID = "938085688237256744"; break;
                                    case "s": emojiID = "938085697984790619"; break;
                                    case "t": emojiID = "938085707480694784"; break;
                                    case "u": emojiID = "938085716670423111"; break;
                                    case "v": emojiID = "938085726128590879"; break;
                                    case "w": emojiID = "938085735557378098"; break;
                                    case "x": emojiID = "938085744600301608"; break;
                                    case "y": emojiID = "938090605643456552"; break;
                                    case "z": emojiID = "938090616833835038"; break;
                                }
                            break;
                        }
                        return `<:${colour}_${letter}:${emojiID}>`;
                    }
                }
                if(input == correctAnswer) { // win
                    let comment;
                    output = cumulativeOutput + "\n" + output;
                    switch(wordleGuessesLeft) {
                        case 1: comment = "You got there"; break;
                        case 2: comment = "Good work"; break;
                        case 3: comment = "Well done"; break;
                        case 4: comment = "Impressive"; break;
                        case 5: comment = "Incredible"; break;
                        case 6: comment = "Wha- HOW?"; break;
                        default: comment = "Nice"; break;
                    }
                    output += `\n${comment}! You won in ${(wordleGuessesLeft==6)?"a":7-wordleGuessesLeft} ${(wordleGuessesLeft==6)?"single guess":"guesses"}! The correct answer was **${toTitleCase(correctAnswer)}**!`;
                    sendToServer(channelID, output);
                    wordleGameInProgress = false;
                    return;
                }
                wordleGuessesLeft--;
                if(wordleGuessesLeft == 0) { // lose
                    output = cumulativeOutput + "\n" + output;
                    output+= `\nBad luck! You're out of guesses. The correct answer was **${correctAnswer}**!`;
                    sendToServer(channelID, output);
                    wordleGameInProgress = false;
                    return;
                }
                else {
                    output = cumulativeOutput + "\n" + output;
                    cumulativeOutput = output;
                    output += `\nGuesses remaining: ${wordleGuessesLeft}`;
                    sendToServer(channelID, output);
                }
            }
        }
        else { // new game start
            wordleGameInProgress = true;
            currentPlayer = user;
            wordleGuessesLeft = 6;
            cumulativeOutput = "";
            if(wordleValidAnswers == "")
                wordleValidAnswers = fs.readFileSync("wordle-answers.txt", "utf-8").split("\n");
            if(wordleValidGuesses == "")
                wordleValidGuesses = fs.readFileSync("wordle-guesses.txt", "utf-8").split("\n");
            correctAnswer = wordleValidAnswers[Math.floor(Math.random() * wordleValidAnswers.length)];
            let output = `**${userNickname(user)} is playing Wordle!**\nI've picked a 5-letter word you have to guess. Type \`\`!wordle [word]\`\` to make a guess. Type \`\`!wordle cancel\`\` to stop the game. Type \`\`!wordle reminder\`\` to see your current guesses.\n Type \`\`!wordle who\`\` to see who is currently playing.\n**Key:**\n<:grey_a:938085441310175303> = incorrect letter\n<:yellow_b:938090639340503050> = correct letter but incorrect position\n<:green_c:938085060526112808> = correct letter and position`;
            sendToServer(channelID, output);
            console.log("Correct answer: " + correctAnswer);
        }
    }
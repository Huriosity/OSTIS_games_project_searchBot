const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const Buffer = require('buffer').Buffer;
iconv = require('iconv-lite');

console.log("OSTIS_GAME_PROJECT_TBOT_KEY");
console.log(process.env.OSTIS_GAME_PROJECT_TBOT_KEY);

const bot = new Telegraf(process.env.OSTIS_GAME_PROJECT_TBOT_KEY)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('text', (ctx) => checkString(ctx))// (ctx) => ctx.reply("find text"))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()





function checkString(ctx) {
    let str = ctx.update.message.text;
    let arrStr = str.split(' ');
    switch (arrStr[0]) {
        case "game": {
            console.log("should get game by name");
            let gameName = getFullGameName(arrStr);
            fetchData(`http://localhost:8080/game_id?name=${gameName}`, ctx);
            break;
        }
        case "allGames": {
            console.log("should get all games");
            const url = "http://localhost:8080/game?";
            // getXHR("http://localhost:8080/game?");
            fetchData(url, ctx);
            break;
        }
        case "partOfGames": {
            console.log("should get many games by filters");
            // http://localhost:8080/game_part?publisher=Valve
            let gameName = getFilter("name", arrStr);
            let publisher = getFilter("publisher", arrStr);
            let developer = getFilter("developer", arrStr);
            console.log("find this publisher ", publisher);
            fetchData(`http://localhost:8080/game_part?name=${gameName}&publisher=${publisher}&developer=${developer}`, ctx)

            break;
        }
        default: {

            break;
        }
    }
}

function getFullGameName(arrStr) {
    let nameIndex = arrStr.findIndex( el => el === "name");
    if (nameIndex === -1) {
        return "";
    }

    let arrayOfFilterNames = ["name","publisher", "developer", "platform"];
    let result = "";

    for (let i = nameIndex + 1; i < arrStr.length; i += 1) {
        if (arrayOfFilterNames.includes(arrStr[i])) {
            break;
        }
        result += arrStr[i] + "+";
    }
    result = result.substring(0, result.length -1);
    console.log("result = ", result);
    return result;
}

function getFilter(filterName, arrStr) {
    let arrayOfFilterNames = ["name","publisher", "developer", "platform"];
    for (let i = 0; i < arrStr.length; i += 1) {
        if (arrStr[i] === filterName && i <= arrStr.length - 2) {
            if (!arrayOfFilterNames.includes(arrStr[i + 1])) {
                return arrStr[i + 1];
            }
        }
    }
    console.log("return empty");
    return "";
}


function fetchData(url, ctx) {
    let result;

    console.log("fetch data url ", url);
    fetch(url, { mode: "cors", 'Content-Type': 'text/plain; charset=windows-1251' }) //, 
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => iconv.decode(Buffer.from(arrayBuffer), 'win1251').toString())
        .then(response => {

            return JSON.parse(response)})
        .then(data => {
            console.log("response ", data);
            console.log(typeof data);
            console.log(Array.isArray(data));
            if(Array.isArray(data)){
                result = parseResponse((data));
            } else {
                let tmparr = [];
                tmparr.push(data);
                result = parseResponse((tmparr));
                console.log(Array.isArray(tmparr));
            }

        }).then(() => {
           
            for(let i = 0; i < result.length; i += 1) {
                console.log("result ", result[i]);
                ctx.reply("название: "+ " " + result[i]["name"] + "\n" + 
                          "издатель: "+ " " + result[i]["publisher"] + "\n" + 
                          "разработчик: "+ " " + result[i]["developer"] + "\n" +  
                          "платформа: "+ " " + result[i]["platform"] + "\n" +
                          "жанр: " + " " + result[i]["genre"] + "\n" +
                          "сеттинг"  + " " + result[i]["setting"]);
    
            }
        });
}

function parseResponse(response) {
    let result = [];
    for (let i = 0; i < response.length; i += 1) {
        result[i] = {};
        result[i].name = (replaceRepeat(response[i].name));
        result[i].publisher = (replaceRepeat(response[i].publisher));
        result[i].developer = (replaceRepeat(response[i].developer));
        result[i].platform = (replaceRepeat(response[i].platform));
        result[i].genre = (replaceRepeat((response[i].genre)));
        result[i].setting = (replaceRepeat((response[i].setting)));
    }
    return result;
}

function replaceRepeat(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i += 1) {
        if (!result.includes(arr[i])) {
            result.push(arr[i]);
        }
    }
    return result;
}
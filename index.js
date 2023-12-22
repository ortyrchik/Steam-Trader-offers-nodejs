const SteamUser = require('steam-user');
const axios = require('axios');
const querystring = require('querystring'); // coding form
let sessionID, cookies;

const steamUsername = '';
const steamPassword = '';
const itemsToSend = [
    {
        appid: 570, // Dota 2
        contextid: '2', // Context inventory for Dota 2
        assetid: '' // ID item
    }
];


const client = new SteamUser();
client.logOn({
    accountName: steamUsername,
    password: steamPassword
});
client.on('loggedOn', () => {
    console.log('Logged into Steam');
    client.setPersona(SteamUser.EPersonaState.Online);
});
client.on('webSession', (sid, cks) => {
    sessionID = sid;
    cookies = cks.join('; ');
    sendTradeOffer('id', 'steamid64', 'token', itemsToSend); // Trade function

    // You are required to get an id, steamID64 and a token for the trade
    // https://steamcommunity.com/tradeoffer/new/?partner=910358571&token=AockN7Y7
    // 910358571 - id
    // AockN7Y7 - token
    // You need to get an steamID64 that starts with 765.
});

function sendTradeOffer(partnerSteamId, partnerSteamid64, tradeOfferToken, itemsToSend) {

    const itemAsset = itemsToSend.map(item => ({
        "appid": item.appid,
        "contextid": item.contextid,
        "amount": "1",
        "assetid": item.assetid
    }));

    const jsonTradeOffer = {
        "newversion": true,
        "version": 4,
        "me": {
            "assets": itemAsset,
            "currency": [],
            "ready": false
        },
        "them": {
            "assets": [],
            "currency": [],
            "ready": false
        }
    };

    const data = {
        sessionid: sessionID,
        serverid: '1',
        partner: partnerSteamid64, // You need to get an steamID64 that starts with 765.
        tradeoffermessage: 'Your trade offer message',
        json_tradeoffer: JSON.stringify(jsonTradeOffer),
        captcha: '',
        trade_offer_create_params: JSON.stringify({
            trade_offer_access_token: tradeOfferToken
        }),
        tradeofferid_countered: ''
    };

    const config = {
        headers: {
            'referer': `https://steamcommunity.com/tradeoffer/new/?partner=${partnerSteamId}&token=${tradeOfferToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies
        }
    };

    axios.post('https://steamcommunity.com/tradeoffer/new/send', querystring.stringify(data), config)
        .then(response => console.log('Trade offer sent successfully:', response.data))
        .catch(error => console.error('Error sending trade offer:', error));
}
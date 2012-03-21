var sprintf = require('sprintf').sprintf,
    crypto  = require('crypto');

function AnobiiAPI()
{
    // Init variables
    this.sessionId = 0;
    this.apiSecret = '';
    this.apiKey = '';

};

AnobiiAPI.prototype = {
    getAuthHeader: function(method, url, key, secret)
    {
        this.apiSecret = secret || this.apiSecret;
        this.apiKey = key || this.apiKey;
        var time = this._getTime(),
            nonce = this._getNonce(),
            base = sprintf('%s %s %s %d %s', method, url, this.sessionId, time, nonce),
            sig = crypto.createHmac('sha1', this.apiSecret).update(base).digest('hex');
        return sprintf('%s %s %s %d %s %s', 'Anobiiv1', this.apiKey, this.sessionId, time, nonce, sig);

    },
    setSessionId: function(id)
    {
        this.sessionId = id;
    },
    _getNonce: function()
    {
        return crypto.createHash('md5').update('' + Math.random() + '').digest('hex');
    },
    _getTime: function()
    {
        return Math.round(Date.now() / 1000);
    }
};

var api = new AnobiiAPI();

exports.handleResponse = function(response)
{
    console.log(response.substr(0,9));
    if (response.substr(0, 9) == 'while(1);') {
        var obj = JSON.parse(response.substr(9));
        if (obj.session_id) {
            api.setSessionId(obj.session_id);
        }
        return obj;
    }
    return response;
};

exports.getHeaders = function(method, url, key, secret)
{

    var obj = {
        'Authorization': api.getAuthHeader(method, url, key, secret),
        'Content-Type': 'application/json'
    };

    return obj;
};

exports.getBody = function(params)
{
    return JSON.stringify(params);
};

exports.getIdentity = function()
{

};
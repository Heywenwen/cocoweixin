var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');
var request = require('request');

exports.exec = function (params, cb) {
    if (params.signature) {
        checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
    } else {
        console.log("type: " + params.xml.MsgType);
        switch (params.xml.MsgType.toString()) {
            case "text":
                //receiveMessage(params, cb);
                requestRobot(params, cb);
                break;
            case "event":
                receiveEvent(params, cb);
                break;
            default:
                break;
        }
    }
};

// 验证签名
var checkSignature = function (signature, timestamp, nonce, echostr, cb) {
    var oriStr = [config.token, timestamp, nonce].sort().join('');
    var code = crypto.createHash('sha1').update(oriStr).digest('hex');
    debug('code:', code);
    if (code == signature) {
        cb(null, echostr);
    } else {
        var err = new Error('Unauthorized');
        err.code = 401;
        cb(err);
    }
};

// 接收普通消息
var receiveMessage = function (msg, cb) {
    var result = {
        xml: {
            ToUserName: msg.xml.FromUserName[0],
            FromUserName: '' + msg.xml.ToUserName + '',
            CreateTime: new Date().getTime(),
            MsgType: 'text',
            Content: getReceiveMessage(msg.xml.Content)
        }
    };
    cb(null, result);
};

// 接收事件消息
var receiveEvent = function (msg, cb) {
    var result = {
        xml: {
            ToUserName: msg.xml.FromUserName[0],
            FromUserName: '' + msg.xml.ToUserName + '',
            CreateTime: new Date().getTime(),
            MsgType: 'text',
            Content: getEventMessage(msg.xml.Event)
        }
    };
    cb(null, result);
};

var getReceiveMessage = function (receiveMessage) {
    switch (receiveMessage.toString()) {
        case "hi":
            return "hello android";
        default :
            return "";
    }
};

// 请求智能机器人
var requestRobot = function (msg, cb) {
    console.log("开启智能机器人");
    request.get("http://www.tuling123.com/openapi/api?key=247f9381e19327aa4b988aa50ab23281&info=" + msg.xml.Content,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                if (info.code == 100000) {
                    var result = {
                        xml: {
                            ToUserName: msg.xml.FromUserName[0],
                            FromUserName: '' + msg.xml.ToUserName + '',
                            CreateTime: new Date().getTime(),
                            MsgType: 'text',
                            Content: info.text
                        }
                    };
                    cb(null, result);
                }
            }
        });
};

var getEventMessage = function (event) {
    switch (event.toString()) {
        case "subscribe":
            return "您好，谢谢关注。";
            break;
        default :
            break;
    }
};
var request = require('request');
var RedisClient = require('./db');
var Proxy = require('./getproxy')
var CONFIG = require('../config');
var log = console.log.bind(console)

var options = {
    url: CONFIG.TEST_API,
    method: 'GET',
    proxy: '',
    timeout: 10 * 1000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.8'
    }
}

class Validity {
    constructor() {
        this.client = RedisClient;
        this.uncheckedProxies;
    }
    // 获取proxies的方法应该是一个async 或则promise 
    setProxies(proxies) {
        this.uncheckedProxies = proxies;
    }
    getProxies() {
        return this.uncheckedProxies;
    }

    async testSingleProxy(proxy) {
        options.proxy = `http://${proxy}`;
        try {
            var proxy = await new Promise((resolve, reject) => {
                request(options, function (err, res, body) {
                    if (err) return reject(`Invalid Ip : ${proxy}`)
                    if (!err && res.statusCode === 200) {
                        resolve(proxy)
                    }
                    resolve(false)
                })
            })
        } catch (e) {
            log(e)
            proxy = false;
        }
        proxy && await this.client.put(proxy).then(e => { log(`Valid Ip : ${proxy}`) }).catch(log);
    }
    async test() {
        var proxies= this.getProxies();
        log(`proxies's length is : ${proxies.length}`)
        var tasks = proxies.map(function (proxy) {
            return this.testSingleProxy(proxy)
        }.bind(this));
        await Promise.all(tasks)
        log('Phase test has been completed。。。。。')
    }
}

module.exports = Validity;


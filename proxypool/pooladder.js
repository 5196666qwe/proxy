var request = require('request');
var RedisClient = require('./db');
var Proxy = require('./getproxy')
var Validity = require('./validity')
var CONFIG = require('../config');
var log = console.log.bind(console)


class PoolAdder {
    constructor() {
        this.threshold = CONFIG.POOLMAXTHRESHOLD;
        this.validity = new Validity();
        this.proxy = Proxy;
        this.client = RedisClient;
    }

    async isOverThreShoud() {
        return (await this.client.len() ) > this.threshold ;
    }

    async addProxy() {
        while( ! await this.isOverThreShoud() ){
            var proxies = await this.proxy.getProxiesList();
            this.validity.setProxies(proxies);
            await this.validity.test();
            if ( await this.isOverThreShoud() ){
                log('Ip is enough')
                break;
            }
        }
    }
}

module.exports = PoolAdder




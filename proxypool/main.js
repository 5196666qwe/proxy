var RedisClient = require('./db');
var PoolAdder = require('./pooladder');
var Validity = require('./validity')
var CONFIG = require('../config');
var Proxy = require('./getproxy')
var request = require('request');
var log = console.log.bind(console)


const CYCLE = 60 * 1000;
class Time {
    static pausecomp(millis) {
        var date = new Date();
        var curDate = null;
        do { curDate = new Date(); }
        while (curDate - date < millis);
        console.log('hah')
    }
    static sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis))
    }
}

class Task {
    static async testProxy() {
        var client = RedisClient;
        var proxy = new Validity();
        while ( true ) {
            var count = Math.floor(0.5 * (await client.len()));
            if (!count) {
                await Time.sleep(CYCLE);
                continue;
            }
            log('testing outdated ip')
            var overDueProxies = await client.get(count)
            proxy.setProxies(overDueProxies);
            await proxy.test();
            await Time.sleep(CYCLE);
        }
    }

    static async checkPool() {
        var client = RedisClient;
        var adder = new PoolAdder();
        while ( true ) {
            log('checkPool is running')
            var queueLen = await client.len();
            if (queueLen < CONFIG.POOLMINTHRESHOLD) await adder.addProxy();
            await Time.sleep(CYCLE)
        }
    }

    static run(){
        Task.testProxy()
        Task.checkPool()
    }
}

module.exports = Task;


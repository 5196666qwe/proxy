var Redis = require('ioredis');
var CONFIG = require('../config');
var log = console.log.bind(console);


class RedisClient {
    constructor(host = CONFIG.redis.host,
        port = CONFIG.redis.port,
        pass = CONFIG.redis.pass) {
        this._db = new Redis({
            port: port,
            host: host,
            pass: pass,
            db: 9
        });
    }

    // 获取左边的 元素，然后删除，这样保证一直是 更新的
    get(count = 1) {
        var self = this._db;
        return self.lrange('proxies', 0, count - 1)
            .then(function (proxies) {
                return self.ltrim('proxies', count, -1)
                    .then(v => {
                        return proxies;
                    })
            })
    }
    put(proxy) {
        return this._db.rpush('proxies', proxy);
    }

    pop() {
        return this._db.rpop('proxies')
    }

    len() {
        return this._db.llen('proxies')
    }
}


module.exports = new RedisClient();

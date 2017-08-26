var request = require('request')
var cheerio = require('cheerio')
var CONFIG = require('../config')
var log = console.log.bind(console)

var options = {
    url: "",
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.8'
    }
}

class FreeProxyGetter {

    constructor() {
        this.proxies = [];
    }

    crawlGoubanjia() {
        var start_url = CONFIG.GOUBANJIA_URL;
        options.jar = true
        var urlCount = Array.from(Array(4).keys());
        urlCount.shift();
        var requestPromiseArr = urlCount.map(function (i) {
            return requestPromise(`${start_url}index${i}.shtml`).then(__parse)
        })
        return Promise.all(requestPromiseArr).then(v => {
            var proxies = [];
            v.forEach(function (i) {
                proxies = proxies.concat(i)
            })
            return proxies;
        })
        function __parse(body) {
            delete options.jar;
            var proxy_list = [];
            if (body) {
                var $ = cheerio.load(body);
                $('td.ip').each(function () {
                    $(this).find('p').remove()
                    proxy_list.push($(this).text().replace(' ', ''))
                })
            }
            return proxy_list;
        }
    }

    crawlBugpg() {
        var start_url = CONFIG.BUGNG_URL;
        return requestPromise(start_url).then(__parse)
        function __parse(body) {
            var uri = [];
            if (body) {
                var $ = cheerio.load(body);
                $('#target tr').each(function () {
                    var ip = $(this).children('td').eq(0).text().trim();
                    var port = $(this).children('td').eq(1).text().trim();
                    uri.push([ip, port].join(":"))
                })
            }
            return uri;
        }
    }

    crawDaili66() {
        var start_url = CONFIG.IP66_URL;
        var urlCount = Array.from(Array(5).keys());
        urlCount.shift();
        var requestPromiseArr = urlCount.map(function (i) {
            return requestPromise(`${start_url}${i}.html`).then(__parse)
        })
        return Promise.all(requestPromiseArr).then(v => {
            var proxies = [];
            v.forEach(function (i) {
                proxies = proxies.concat(i)
            })
            return proxies;
        })

        function __parse(body) {
            var uri = [];
            if (body) {
                var $ = cheerio.load(body);
                $('#main > div > div:nth-child(1) > table > tbody > tr:nth-child(1)').remove();
                $('.containerbox table').find('tr').each(function () {
                    var ip = $(this).find('td').eq(0).text();
                    var port = $(this).find('td').eq(1).text();
                    uri.push([ip, port].join(":"))
                })
            }
            return uri;
        }
    }

    crawlProxy360() {
        var start_url = CONFIG.PROXY360_URL;
        return requestPromise(start_url).then(__parse)
        function __parse(body) {
            var uri = [];
            if (body) {
                var $ = cheerio.load(body);
                $('.proxylistitem').each(function () {
                    var ip = $(this).find('span').eq(0).text().trim();
                    var port = $(this).find('span').eq(1).text().trim();
                    uri.push([ip, port].join(':'))
                })
            }
            return uri;
        }
    }
}

module.exports.getProxiesList = async function () {
    var Proxy = new FreeProxyGetter();
    return await Promise.all([
        Proxy.crawlBugpg(),
        Proxy.crawlGoubanjia(),
        Proxy.crawDaili66(),
        Proxy.crawlProxy360()
    ])
        .then(proxyList => {
            if (proxyList.length) {
                for (var proxy of proxyList) {
                    Proxy.proxies = Proxy.proxies.concat(proxy);
                }
            }
            return Array.from(new Set(Proxy.proxies));
        })
}


function requestPromise(url) {
    options.url = url;
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) return reject(err)
            if (!err && res.statusCode === 200) {
                resolve(body)
            } else {
                resolve(false)
            }
        })
    })
}


var app = require('./proxypool/web')
var Task = require('./proxypool/main')

function main() {
    app.listen(5555);
    Task.run();
}

main()
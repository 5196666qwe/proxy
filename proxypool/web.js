var Koa = require('koa');
var Router = require('koa-router')
var db = require('./db')
var app = new Koa();
var home = new Router();

home.get('/', async (ctx, next) => {
    ctx.body = `<h1>welcome to Proxy Pool System</h1>
    <p>route <strong>/get</strong>  Get a proxy </p> 
    <p>route <strong>/count</strong>  Get the count of proxy </p> 
    <p>route <strong>/all</strong>  Get all proxies </p> 
    `
})
home.get('/get', async (ctx, next) => {
    ctx.body  = await db.pop();
})

home.get('/count',async (ctx,next)=>{
    ctx.body = await db.len();
})

home.get('/all',async (ctx,next)=>{
    ctx.body = await db.getAll();
})


app.use(home.routes())
app.use(home.allowedMethods())

module.exports = app;
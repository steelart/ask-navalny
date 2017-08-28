"use strict";
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var WebpackDevServerPort = 8091;
var WebpackDevServerURL = 'http://localhost:' + WebpackDevServerPort;

var config = {
    entry: [ './src/main.jsx',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?' + WebpackDevServerURL
    ],
    output: {
        publicPath: WebpackDevServerURL + "/static/askp/js/",
        path: __dirname + '/public/static/askp/js/',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /public/]
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader!autoprefixer-loader",
                exclude: [/public/]
            },
            {
                test: /\.less$/,
                loader: "style-loader!css-loader!autoprefixer-loader!less-loader",
                exclude: [/node_modules/, /public/]
            },
            {
                test: /\.gif$/,
                loader: "url-loader?limit=10000&mimetype=image/gif"
            },
            {
                test: /\.jpg$/,
                loader: "url-loader?limit=10000&mimetype=image/jpg"
            },
            {
                test: /\.png$/,
                loader: "url-loader?limit=10000&mimetype=image/png"
            },
            {
                test: /\.svg/,
                loader: "url-loader?limit=26000&mimetype=image/svg+xml"
            },
            {
                test: /\.jsx$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /public/],
                query:
                      {
                        presets:['react', 'es2015'],
                        plugins: ['syntax-decorators','transform-object-rest-spread']
                      }
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    plugins : [new webpack.HotModuleReplacementPlugin()]
};
//config.plugins.push(new webpack.HotModuleReplacementPlugin());
var compiler = webpack(config);

var express = require('express');
var proxy = require('proxy-middleware');
var httpproxy = require('http-proxy-middleware');
var url = require('url');

//## --------your proxy----------------------
var app = express();
//## proxy the request for static assets
app.use('/static/askp/js', proxy(url.parse(WebpackDevServerURL + '/static/askp/js')));
app.use('/api', proxy(url.parse('http://localhost:8000/api')));
app.use('/accounts', proxy(url.parse('http://localhost:8000/accounts')));

app.use('/', httpproxy({target: 'ws://localhost:8000', changeOrigin: true, ws : true}));


app.get('/static/askp/*', function(req, res) {
    console.log("static data:", req.url);
    res.sendFile(__dirname + '/public' + req.url);
});

app.get('/*', function(req, res) {
    console.log("Request:", req.url);
    res.sendFile(__dirname + '/public/index.html');
});


//# -----your-webpack-dev-server------------------
var server = new WebpackDevServer(compiler, {
    contentBase: __dirname,
    hot: true,
    quiet: false,
    noInfo: false,
    publicPath: "/static/askp/js/",

    stats: { colors: true }
});

//## run the two servers
server.listen(WebpackDevServerPort, "localhost", function() {});
app.listen(8090);

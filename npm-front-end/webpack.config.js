var webpack = require('webpack');

module.exports = {
    entry: "./src/main.jsx",
    output: {
        path: __dirname + '/public/static/askp/js/',
        publicPath: "static/askp/js/",
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
                exclude: [/node_modules/, /public/]
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
 devServer: {
    proxy: {
      '/rawjson': {
        target: 'http://localhost:8000',
        secure: false
      }
    }
  }
}

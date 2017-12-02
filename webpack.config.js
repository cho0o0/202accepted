module.exports = {
    entry: [
        'themes/202accepted/source/js/index.js',
    ],
    module: {
        loaders: [{
            test: /\.js/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: [
                    ['es2015', {
                        modules: false,
                        loose: true
                    }]
                ]
            }
        }]
    }
};
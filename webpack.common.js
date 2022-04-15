const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');;

module.exports = {
    entry: ['./src/main.js', './src/scss/style.scss'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.svg$/i,
                type: 'asset/inline',
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.s[ac]ss$/i,
                use:
                [
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            scriptLoading: 'blocking',
            template: './src/index.html',
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin({
            // filename: 'cum.css',
        }),
    ],
};

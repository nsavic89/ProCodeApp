const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');


module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '/',
		filename: 'bundle.js'
	},
	devServer: {
		contentBase: './build'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader', 'eslint-loader']
			},
			{
				test: /\.(less|css)$/,
				use: ['style-loader', 'css-loader', 'less-loader']
			},
			{
				test: /\.(png|jpg)$/,
				use: ['file-loader']	
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve('./public/index.html')
		}),
		new Dotenv()
		],
	devServer: {
		historyApiFallback: true
	}
};

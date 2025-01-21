const mix = require('laravel-mix');
const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

mix.webpackConfig({
  plugins: [
    new webpack.ProvidePlugin({
        '@popperjs/core': ['@popperjs/core', 'default'],
        Bootstrap: 'bootstrap/dist/js/bootstrap.bundle.min.js',
    }),
  ],
});

mix
  .js('resources/js/neo.js', 'admin')
  .sass('resources/scss/neo.scss', 'admin')
  .sass('resources/scss/dev.scss', 'admin')
  .sass('resources/scss/wp-colors/neo/colors.scss', 'admin/wp-colors/neo')
  .options({
    processCssUrls: true,
    fileLoaderDirs: {
      images: 'admin/images',
      fonts: 'admin/fonts',
    }
  })
  .copyDirectory('resources/images', 'admin/images')
  .copyDirectory('resources/json', 'admin/json');

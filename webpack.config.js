const path = require('path')
module.exports = {
  entry: ['./src/Galorants_In-Houses_script.js'],
  output: {
    filename: 'in-houses.js',
    path: path.resolve(__dirname, 'dist'),
  }
};

var folder = require('./managed-folder')

if (require.main === module) {
  var fs = require('fs')
  var path = require('path')
  var opts = {}
  var argv = require('minimist')(process.argv.slice(2))
  var config = fs.readFileSync(path.join(__dirname, '.config')).toString()
  var tuples = config.split('\\').map(line => line.split('='))

  tuples.forEach(tuple => {
    opts[tuple[0]] = tuple[1]
  })

  Object.assign(opts, argv)

  folder(opts)
} else {
  module.exports = folder
}

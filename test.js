var test = require('tape')
var path = require('path')
var Folder = require('./index.js')

test('it runs', function (t) {
  var folder = Folder({ appdir: path.join(require('os').homedir(), 'test') })

  folder.close()
  t.end()
})

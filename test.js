var test = require('tape')
var musicfolder = require('./index.js')

test('it runs', function (t) {
  var folder = musicfolder({ appdir: require('os').homedir() })
  t.ok(folder)
  folder.on('watching', function () {
    folder.close()
    t.end()
  })
})

const inbox = 'Inbox'
const ms = 250

var crypto = require('crypto')
var fs = require('fs')
var path = require('path')
var test = require('tape')
var mkdirp = require('mkdirp')
var Folder = require('./index.js')
var folderName = 'test-' + crypto.randomBytes(16).toString('hex')
var appdir = path.join(require('os').homedir(), folderName)
var testdir = path.join(appdir, inbox)
var testfile = path.join(testdir, 'test.txt')
var EventEmitter = require('events')

var folder

test('setup', function (t) {
  mkdirp.sync(appdir)

  folder = Folder({
    appdir,
    subfolders: { inbox }
  })

  var stat = fs.statSync(testdir)

  t.ok(stat && stat.isDirectory(), 'subfolder has been created')
  t.ok(folder.watcher instanceof EventEmitter, 'watcher created')

  t.end()
})

test('should emit events', function (t) {
  t.plan(3)

  folder.on('ready', async function () {
    folder.on('inbox:add', function (filepath) {
      t.ok(filepath === testfile, 'add event emitted')
    })

    folder.on('inbox:change', function (filepath) {
      t.ok(filepath === testfile, 'change event emitted')
    })

    folder.on('inbox:remove', function (filepath) {
      t.ok(filepath === testfile, 'remove event emitted')
    })

    await sleep(ms)
    fs.writeFileSync(testfile, 'abc')

    await sleep(ms)
    fs.appendFileSync(testfile, 'abc', { flags: 'a+' })

    await sleep(ms)
    fs.unlinkSync(testfile)
  })
})

test('teardown', function (t) {
  folder.close()
  t.ok(Object.entries(folder.watchers).every(w => !(w instanceof EventEmitter)), 'no more watchers')

  fs.rmdirSync(testdir)
  fs.rmdirSync(appdir)

  t.end()
})

function sleep (t) {
  return new Promise((resolve) => {
    var timeout = setTimeout(() => {
      clearTimeout(timeout)
      resolve()
    }, t)
  })
}

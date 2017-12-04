var fs = require('fs')
var assert = require('assert')
var nanobus = require('nanobus')
var path = require('path')
var mkdirp = require('mkdirp')
var parallel = require('run-parallel')
var log = console.log
const IGNORED = ['.DS_Store']

module.exports = MusicFolder

function MusicFolder (opts = {}) {
  if (!(this instanceof MusicFolder)) return new MusicFolder(opts)

  assert.ok(opts.appdir, 'appdir was not specified')

  nanobus.call(this)
  this.appdir = opts.appdir

  this.createSubfolders(getSubfolderNames())
}

MusicFolder.prototype = Object.create(nanobus.prototype)

MusicFolder.prototype.createSubfolders = function (folderNames) {
  var appdir = this.appdir
  var tasks = Object.keys(folderNames).map(createFolderTask)

  mkdirp.sync(appdir)

  parallel(tasks, () => {
    log('done creating directories.')
    this.watchdir = path.join(this.appdir, folderNames.inbox)
    this.watcher = fs.watch(this.watchdir, { recursive: true }, this.onFolderEvent.bind(this))
    this.emit('watching')
    log('watching', this.watchdir)
  })

  function createFolderTask (key) {
    return function task (done) {
      var dirname = path.join(appdir, folderNames[key])
      mkdirp(dirname, done)
    }
  }
}

MusicFolder.prototype.onFolderEvent = function (eventType, filename) {
  if (IGNORED.includes(filename)) return
  switch (eventType) {
    case 'rename':
      // emitted whenever a file appears or disappears in the folder
      var filepath = path.join(this.watchdir, filename)
      fs.open(filepath, 'r', err => {
        if (err) {
          if (err.code === 'ENOENT') {
            this.emit('remove', filepath)
          } else {
            this.emit('add', filepath)
          }
        }
      })
      break

    case 'change':
      // TODO
      break

    default:
      break
  }
}

MusicFolder.prototype.close = function () {
  this.watcher.close()
}

function getSubfolderNames () {
  return {
    inbox: 'Inbox',
    unsupported: 'Unsupported',
    archives: 'Archives',
    duplicates: 'Duplicates',
    processing: 'Processing',
    processed: 'Processed'
  }
}

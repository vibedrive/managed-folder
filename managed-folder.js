var assert = require('assert')
var nanobus = require('nanobus')
var path = require('path')
var mkdirp = require('mkdirp')
var chokidar = require('chokidar')
const IGNORED = '.DS_Store'

module.exports = ManagedFolder

function ManagedFolder (opts = {}) {
  if (!(this instanceof ManagedFolder)) return new ManagedFolder(opts)

  assert.ok(opts.appdir, 'appdir was not specified')

  nanobus.call(this)

  this.appdir = opts.appdir
  this.subfolders = opts.subfolders || { inbox: 'Inbox' }
  this.watchers = {}

  this.createSubfolders()
}

ManagedFolder.prototype = Object.create(nanobus.prototype)

ManagedFolder.prototype.createSubfolders = function () {
  mkdirp.sync(this.appdir)

  // Create subfolders inside the specified 'appdir'
  // Create a watcher for each subfolder
  Object.entries(this.subfolders).forEach(([namespace, folderName]) => {
    var dirname = path.join(this.appdir, folderName)
    var opts = {
      ignored: IGNORED
    }

    mkdirp.sync(dirname)

    var watcher = chokidar.watch(dirname, opts)

    this.watchers[namespace] = watcher
    this.watchers[namespace].on('all', (eventName, filepath) => {
      this.handleFolderEvent(eventName, namespace, filepath)
    })
  })
}

ManagedFolder.prototype.handleFolderEvent = function (eventName, namespace, filepath) {
  switch (eventName) {
    case 'add':
      this.emit(`${namespace}:add`, filepath)
      break

    case 'change':
      this.emit(`${namespace}:change`, filepath)
      break

    case 'unlink':
      this.emit(`${namespace}:remove`, filepath)
      break

    default:
      break
  }
}

ManagedFolder.prototype.close = function () {
  Object.entries(this.watchers).forEach(([_, watcher]) => {
    if (watcher) watcher.close()
  })
}

var fs = require('fs')
var assert = require('assert')
var nanobus = require('nanobus')
var path = require('path')
var mkdirp = require('mkdirp')
const IGNORED = ['.DS_Store']

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
  Object.entries(this.subfolders).forEach(([folderKey, folderName]) => {
    var dirname = path.join(this.appdir, folderName)
    var opts = { recursive: true }

    mkdirp.sync(dirname)

    this.watchers[folderKey] = fs.watch(dirname, opts, (eventType, filename) => {
      this.handleFolderEvent(eventType, folderKey, filename)
    })
  })
}

ManagedFolder.prototype.handleFolderEvent = function (eventType, namespace, filename) {
  if (IGNORED.includes(filename)) return

  var filepath = path.join(this.appdir, this.subfolders[namespace], filename)

  switch (eventType) {
    // emitted whenever a file appears or disappears in the folder
    case 'rename':
      fs.open(filepath, 'r', err => {
        if (err) {
          if (err.code === 'ENOENT') {
            this.emit(`${namespace}:remove`, filepath)
          } else {
            this.emit(`${namespace}:add`, filepath)
          }
        }
      })
      break

    // emitted whenever a file gets changed
    case 'change':
      this.emit(`${namespace}:change`, filepath)
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

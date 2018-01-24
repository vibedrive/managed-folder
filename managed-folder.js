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
  this._subfolders = opts.subfolders || { inbox: 'Inbox' }
  this.watchers = {}

  this.createSubfolders()
}

ManagedFolder.prototype = Object.create(nanobus.prototype)

ManagedFolder.prototype.subfolder = function (key) {
  var dir = this._subfolders[key]
  return path.join(this.appdir, dir)
}

ManagedFolder.prototype.createSubfolders = function () {
  mkdirp.sync(this.appdir)

  Object.entries(this._subfolders).forEach(([namespace, folderName]) => {
    var dirname = path.join(this.appdir, folderName)
    mkdirp.sync(dirname)
  })

  var opts = {
    ignored: IGNORED
  }

  this.watcher = chokidar.watch(this.appdir, opts)
  this.watcher.on('ready', () => {
    this.emit('ready')
  })
  this.watcher.on('all', this.handleFolderEvent.bind(this))
}

ManagedFolder.prototype.handleFolderEvent = function (eventName, filepath) {
  var namespace = this.getNamespace(filepath)
  if (!namespace) return

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

ManagedFolder.prototype.getNamespace = function (filepath) {
  var dirname = path.dirname(filepath)
  var tuple = Object.entries(this._subfolders).find(([namespace, folderName]) => {
    return dirname === path.join(this.appdir, folderName)
  })

  return tuple && tuple.length ? tuple[0] : null
}

ManagedFolder.prototype.close = function () {
  this.watcher.close()
}

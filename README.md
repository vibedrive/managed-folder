# managed-folder

Create subfolders inside a given folder and emit a namespaced event 
when a change happens inside any of them.

Currently handles 3 types of events: `add`, `remove`, `change`.
Can be passed a map of namespace to folder name as an option. 

```js
// default subfolder map (namespace -> folder name)
{
  inbox: 'Inbox'
}
```

### usage

```js
var Folder = require('managed-folder')
var opts = {
  appdir: '/Users/kareniel/Vibedrive',
  subfolders: { inbox: 'Inbox' }
}

var folder = Folder(opts)

folder.on('ready', function () {
  folder.on('inbox:add' function (filepath) {
    console.log('file added to inbox folder:', filepath)
  })
})

```

### api

`folder.on(eventName, callback)`
register an event handler.
events are named after the subfolder's key followed by `add`, `remove` or `change`
ie: `mySubfolder:add`

`folder.subfolder(key)`
return the full path to a given subfolder key


---

if used from the command line you can pass opts either 

1. through cli arguments

```bash
node managed-folder --appdir /Users/kareniel/Vibedrive
```

or

2. with a config file (`/.config`)

```
appdir=/Users/kareniel/Vibedrive
```

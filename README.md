# music-folder
manage a music folder

### usage

```js
var opts = {
  appdir: '/Users/kareniel/Vibedrive'
}

var folder = musicfolder(opts)

folder.on('add', function (filepath) {
  console.log('add', filepath)
})

folder.on('remove', function (filepath) {
  console.log('remove', filepath)
})
```

if used from the command line you can pass opts either 

1. through cli arguments

```bash
node musicfolder --appdir /Users/kareniel/Vibedrive
```

or

2. with a config file

```
appdir=/Users/kareniel/Vibedrive
```

var http = require('http')
var fs = require('fs')
var linestream = require('line-stream')
var through = require('through2')

var file = fs.createReadStream(process.argv[2])
var ls = linestream()
var transform = org2web()

file
  .pipe(ls)
  .pipe(transform)
  .pipe(process.stdout)

var doneKeywords = ['DONE']
var notDoneKeywords = ['TODO', 'WAITING', 'STARTED']

function org2web() {
  var firstLine = true
  var depth = 0
  var transform = through(function(chunk, enc, cb) {
    if (firstLine) {
      this.push('<html><meta name="viewport" content="width=device-width, initial-scale=1"><code>')
      firstLine = false
    }

    var line = chunk.toString()
    line = line.replace(/\n/g, '<br/>')

    for (var i in notDoneKeywords) {
      line = line.replace(new RegExp(notDoneKeywords[i]), '<b><font color=red>' + notDoneKeywords[i] + '</font></b>')
    }
    for (var i in doneKeywords) {
      line = line.replace(new RegExp(doneKeywords[i]), '<b><font color=green>' + doneKeywords[i] + '</font></b>')
    }

    if (/^\* /.test(line)) {
      depth = 1
      this.push('<font color=blue>')
    }
    else if (/^\*\* /.test(line)) {
      depth = 2
      this.push('<font color=green>')
    }
    else {
      for (var i=0; i < depth + 2; i++) {
        this.push('&nbsp;')
      }
    }

    this.push(line)

    this.push('</font>')

    cb()
  },
  function flush(cb) {
    this.push('</code></html>')
  })
  return transform
}
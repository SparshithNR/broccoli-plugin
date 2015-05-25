var fs = require('fs')
var path = require('path')
// var RSVP = require('rsvp')
var assert = require('assert')
var fixturify = require('fixturify')
var fixtureTree = require('broccoli-fixturify')
// var quickTemp = require('quick-temp')
var Plugin = require('../index')

var broccoli_0_16_3 = require('./dependencies/broccoli-0.16.3')


TestPlugin.prototype = Object.create(Plugin.prototype)
TestPlugin.prototype.constructor = TestPlugin
function TestPlugin(inputTrees) {
  Plugin.call(this)
  this.inputTrees = inputTrees
}

TestPlugin.prototype.didInit = function() {
  this.initialized = true
  this.inputPaths = this.registerInputTrees(this.inputTrees)
  this.outputPath = this.getOutputPath()
  this.cachePath = this.getCachePath()
}

TestPlugin.prototype.build = function() {
  for (var i = 0; i < this.inputPaths.length; i++) {
    var files = fs.readdirSync(this.inputPaths[i])
    for (var j = 0; j < files.length; j++) {
      var content = fs.readFileSync(path.join(this.inputPaths[i], files[j]))
      content += ' - from input tree #' + i
      fs.writeFileSync(path.join(this.outputPath, files[j]), content)
    }
  }
}

// var TestPlugin = Plugin.extend({
//   didInit: function(inputTrees) {

//   }
// })


describe('integration test', function(){
  var tree1, tree2

  beforeEach(function() {
    tree1 = fixtureTree({ 'foo.txt': 'foo contents' })
    tree2 = fixtureTree({ 'bar.txt': 'bar contents' })
  })

  describe('Broccoli with .read API', function(){
    it('works without errors', function(){
      var self = this
      var plugin = new TestPlugin([tree1, tree2])
      var builder = new broccoli_0_16_3.Builder(plugin)
      return builder.build()
        .then(function(hash) {
          assert.deepEqual(fixturify.readSync(hash.directory), {
            'foo.txt': 'foo contents - from input tree #0',
            'bar.txt': 'bar contents - from input tree #1'
          })
          return builder.cleanup()
        })
    })
  })
})

// TODO assert(!this.initialized, 'didInit should not run twice')

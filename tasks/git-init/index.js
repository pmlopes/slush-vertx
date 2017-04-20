/**
 * This task will run git init.
 */
'use strict';

var exec = require('child_process').exec;

module.exports = {
  id: 'git-init',
  depends: [],
  task: function (done) {
    exec('git init', function (error) {
      if (error) {
        throw error;
      }

      done();
    });
  }
}

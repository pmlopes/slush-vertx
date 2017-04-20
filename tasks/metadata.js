var inquirer = require('inquirer');

module.exports = {

  dependencies: [
    { "group": "io.vertx", "artifact": "vertx-core", "version": "3.4.1" }
  ],

  prompt: function (key, message, defaultValue, done) {
    var self = this;

    if (self.hasOwnProperty(key)) {
      return done();
    }

    inquirer.prompt({ name: 'anwser', message: message, default: defaultValue }, function (q1) {
      self[key] = q1.anwser;
      done();
    });
  },

  select: function (key, message, list, done) {
    var self = this;

    if (self.hasOwnProperty(key)) {
      return done();
    }

    if (this.hasOwnProperty(key)) {
      return done();
    }

    if (list.length > 1) {
      inquirer.prompt({ name: 'anwser', message: message, type: 'list', choices: list }, function (q2) {
        self[key] = q2.anwser;
        done();
      });
    } else {
      self[key] = list[0];
      done();
    }
  }
}



var gulp = require('gulp');

function registerTask(module) {
  gulp.task(module.id, module.depends, module.task);
}

// register tasks
registerTask(require('./tasks/git-init'));
registerTask(require('./tasks/project'));
registerTask(require('./tasks/verticle'));

gulp.task('default', ['project']);

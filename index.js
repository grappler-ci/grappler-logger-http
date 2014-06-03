/**
 * Module dependencies
 */

var request = require('superagent');

/**
 * Create a HTTP logger
 *
 * @param {Object} config
 * @return {Function}
 */

module.exports = function(config) {
  var defaultHost = config.host;
  var drain = config.drain;
  var debug = config.debug;

  return function(app) {
    app.logger(function(ns, level, str, task) {
      var host = task.repo ? task.repo + '#' + task.branch : host;

      // TODO compute severtiy from level
      var prefix = [
        '<110>6',
        (new Date).toISOString(),
        'host',
        ns,
        'proc',
        '- -'
      ].join(' ');

      var out = str.split('\n').map(function(line) {
        if (ns === 'progress') return prefix + line;
        return prefix + line + '\n';
      });

      request
        .post(drain)
        .send(out)
        .set('content-type', 'text/plain')
        .end(function(err, res) {
          if (err && debug) return console.error(err.stack || err);
          if (!res.ok && debug) return console.error(res.text);
        });
    });
  };
};

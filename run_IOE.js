var forever = require('forever-monitor');

var child = new (forever.Monitor)('main.js', {
  max: 100,
  silent: true,
  spinSleepTime: 1000,
  logFile: 'runLog.txt', // Path to log output from forever process (when daemonized)
  outFile: 'outLog.txt', // Path to log output from child stdout
  errFile: 'errLog.txt', // Path to log output from child stderr
  args: []
});
child.on('error', ()=> {

})
child.on('exit', function () {
  console.log('your-filename.js has exited after 3 restarts');
});

child.start();
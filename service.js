var Service = require('node-linux').Service;

var svc = new Service({
    name:'logalert',
    description: 'Monitoring tool that sends email when changes in files match certain pattern',
    script: require('path').join(__dirname, 'log-alert.js')
});

svc.on('install', function() {
    console.log('Service installed');
});
svc.on('uninstall', function() {
    console.log('Service uninstalled');
});

if (process.argv[2] === 'uninstall') {
    svc.uninstall();
} else {
    svc.install();
}


var fs = require('fs');
var mailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('./config.json');

if (config.pid !== undefined && typeof config.pid === 'string' && config.pid.length > 0) {
    fs.writeFileSync(config.pid, process.pid);
}

var mailQueue = [];

var queueMailer = function(callback) {
    var mail = mailQueue.shift();

    if (mail === undefined) {
        callback();
        return;
    }
    var smtp = mailer.createTransport(smtpTransport(config.mailer.smtp));

    smtp.sendMail(mail, function(err, resp) {
        if (err) {
            console.log('sending mail from queue failed');
            console.log(err);
            mailQueue.push(mail);
        }
        callback();
    });
};

var queueTimeout;
var processQueue = function() {
    var timeout = config.queueTimeout;
    queueTimeout = setTimeout(function() {
        queueMailer(processQueue);
    }, timeout * 1000);
};
queueMailer(processQueue);

for (var i in config.files) {
    (function(file) {
        var path = file.path;
        var stats = fs.statSync(path);
        var fileSize = stats.size;
        var regExp;
        var emails = [];
        var subject = file.subject || 'Log Alert';

        if (typeof file.email === 'string') {
            emails.push(file.email);
        } else {
            for (var iter in file.email) {
                if (typeof iter === 'number') {
                    emails.push(file.email[iter]);
                } else {
                    emails.push(file.email[iter] + ' <' + iter + '>');
                }
            }
        }

        if (file.pattern !== undefined && file.pattern !== '') {
            if (file.regExpFlags !== undefined && file.regExpFlags !== '') {
                regExp = new RegExp(file.regExpFlags);
            } else {
                regExp = new RegExp(file.pattern);
            }
        }
        
        fs.watch(path, function(event) {
            if (event === 'change') {
                var newStats = fs.stat(path, function(err, newStats) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    var oldSize = fileSize;
                    fileSize = newStats.size;
                    
                    if (fileSize < oldSize) {
                        oldSize = 0;
                    }
                    
                    var changesSize = fileSize - oldSize;
                    
                    if  (oldSize === fileSize) {
                        return;
                    }
                    fs.open(path, 'r', function(err, file) {
                        if (err) {
                            return;
                        }
                        var buffer = new Buffer(changesSize);
                        fs.read(file, buffer, 0, changesSize, oldSize, function(err, bytes, buffer) {

                            var changes = buffer.toString();

                            if (
                                regExp === undefined
                                || changes.match(regExp)
                            ) {
                                var smtp = mailer.createTransport(smtpTransport(config.mailer.smtp));

                                var mail = {
                                    from: config.mailer.from.name + ' <' + config.mailer.from.email + '>',
                                    to: emails.join(', '),
                                    subject: subject,
                                    text: changes
                                };

                                smtp.sendMail(mail, function(err, resp) {
                                    if (err) {
                                        console.log(err);
                                        mailQueue.push(mail);
                                    }
                                });
                            }
                            fs.close(file);
                        });
                    });
                });
            }
        });
    })(config.files[i]);
}

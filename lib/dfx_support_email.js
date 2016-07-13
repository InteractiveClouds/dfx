/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var Q = require('q'),
    endpoints = require('./utils/endpoints'),
    log = new (require('./utils/log')).Instance({label:'SUPPORT_EMAIL'});

var sendMailToSupport = {
    send: function(parsed){
        var D = Q.defer();
        transporter.sendMail({
            from:       parsed.body.contactEmail,
            to:         'support@interactive-clouds.com',
            subject:    parsed.body.subject,
            text:        'From user: ' + parsed.user + ', tenant id: ' + parsed.tenant + ', name: ' + parsed.body.contactName  + "\r\n" + 'Message: ' + parsed.body.contactMsg
        }, function(error, info){
            if(error){
                log.error('error while trying to send email to support from user with id: ' + parsed.user +  ', tenant id: ' + parsed.tenant + '.');
                D.reject(error) ;
            }
            log.info('Message has been successfully sent. User id: ' + parsed.user + ' , tenant id: ' + parsed.tenant + '. Message content:\r\n' + parsed.body.contactMsg);
            D.resolve(info);
        });
        return D.promise;
    }
};

exports.api = endpoints.json({

    parser : function ( req ) {
        return {
            action   : req.params.action,
            data:{
                tenant   : req.session.tenant.id,
                user     : req.session.user.id,
                body     : req.body
            }
        }
    },

    action  : sendMailToSupport,
    log     : log
});


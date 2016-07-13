/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var fs = require('graceful-fs'),
    Q = require('q'),
    path = require('path'),
    endpoints = require('./utils/endpoints'),
    log = new (require('./utils/log')).Instance({label: 'STUDIO_TEMPLS'}),
    SETTINGS = require('./dfx_settings');

var TMPLS_PATH = SETTINGS.path_to_templates,
    cache = SETTINGS.cacheTemplates && {} || null,
    cacheSize = 0,
    RGXP_WRONG_PATH = /\.\./,
    RGXP_JADE_EXT = /\.jade$/;

log.info( 'will ' + (cache ? '' : 'not ') + 'use cache' );

exports.get = endpoints.json({
    parser : function ( req ) {
        
        return isPathWrong( req.params[0] )
            ? Q.reject('wrong path "' + req.params[0] + '"')
            : {
                path   : path.resolve(__dirname, '..', TMPLS_PATH, req.params[0]),
                tenant : req.user.tenantid,
                user   : req.user.userid
            };
    },
    action : _get,
    log : log
});

function _get ( o ) {
    var ts = ( new Date() ).getTime(),
        te;

    return Q.when(get(o), function(data){
        te = ( new Date() ).getTime();

        log.info(
            o.tenant + ':' + o.user +
            ' requested templates "' + o.path + '", ' +
            'done in ' + ( te - ts ) + ' ms.'
        );

        return data;
    })
}

function get ( o ) {

    return cache && cache[o.path]
        ? cache[o.path]
        : readFromFs(o.path).then(function(data){
                var cacheChunkSize;

                data = JSON.stringify(data);

                if ( cache ) {

                    cache[o.path] = data;
                    cacheChunkSize = data.length;
                    cacheSize += cacheChunkSize;

                    log.info(
                        'cached "' + o.path + '" ' +
                        'size is ' + cacheChunkSize + ' bytes, ' +
                        ' total cache size is ' +
                        cacheSize + ' bytes now.'
                    );
                }

                return data;
            })
}

function readFromFs ( pth ) {
    var D = Q.defer(),
        templates = {},
        promises = [];

    fs.readdir( pth, function(error, list){
        if ( error ) return D.reject(error);

        list.forEach(function(fn){

            if ( ! RGXP_JADE_EXT.test(fn) ) return;

            promises.push(
                readFile( path.join(pth, fn) ).then(function( text ){
                    templates[ fn.replace(RGXP_JADE_EXT, '') ] = text;
                })
            );
        });

        Q.all(promises).then(function(){
            D.resolve(templates)
        });

    });

    return D.promise;
}

function readFile ( pth ) {
    var D = Q.defer();

    fs.readFile(pth, function ( error, buffer ){
        error ? D.reject(error) : D.resolve(buffer.toString('utf-8'))
    });

    return D.promise;
}

function isPathWrong ( pth ) {
    return RGXP_WRONG_PATH.test(pth);
}

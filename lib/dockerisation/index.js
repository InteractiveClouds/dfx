var SETTINGS   = require('../dfx_settings'),
    endpoints  = require('../utils/endpoints'),
    Docker     = require('dockerode'),
    Q          = require('q'),
    QFS        = require('q-io/fs'),
    path       = require('path'),
    tar        = require('tar-fs'),
    tmpDirTool = require('../utils/tempdir'),
    templator  = require('../utils/simpleTemplator'),
    util       = require('util'),

    log = new (require('../utils/log')).Instance({label: "DOCKERISATION"}),
    api = {},
    docker,
    db,
    opts = {},
    templs = {
        dockerfile : templator.compileFile(
                path.join(__dirname, 'templates', 'Dockerfile')
            ),
        run_dep    : templator.compileFile(
                path.join(__dirname, 'templates', 'run_dep.js')
            ),
        packageJson : templator.compileFile(
                path.join(__dirname, 'templates', 'package.json')
            )
    };

const DB_PREFIX = SETTINGS.databases_tenants_name_prefix,
    CL_SETTINGS = SETTINGS.tenant_settings_collection_name;

if (SETTINGS.docker_daemon.host) opts.host = SETTINGS.docker_daemon.host;
if (SETTINGS.docker_daemon.port) opts.port = SETTINGS.docker_daemon.port;
if (SETTINGS.docker_daemon.ca)   opts.ca   = SETTINGS.docker_daemon.ca;
if (SETTINGS.docker_daemon.cert) opts.cert = SETTINGS.docker_daemon.cert;
if (SETTINGS.docker_daemon.key)  opts.key  = SETTINGS.docker_daemon.key;


if ( Object.keys(opts).length ) {
    log.info('Dockerization is ON with custom settings: ', {
        host : opts.host || '',
        port : opts.port || '',
        ca   : opts.ca   ? 'is set' : 'is not set',
        cert : opts.cert ? 'is set' : 'is not set',
        key  : opts.key  ? 'is set' : 'is not set'
    });
    docker = new Docker(opts);
} else if ( SETTINGS.docker_daemon.useDefaultSettings ) {
    log.info('Dockerization is ON with default settings');
    docker = new Docker();
} else {
    exports.isOFF = true;
    log.warn('Dockerization is OFF.');
}


//$.get('http://localhost:9000/studio/docker/list').then(function(d){console.log(JSON.stringify(d.data,null,4))})
api.list = function ( o ) {
    var D = Q.defer();

    docker.listImages(function (error, images) {
        if ( error ) return D.reject(error);

        return D.resolve(
            images
            .map(function(img){

                if ( !img.Labels || !img.Labels.content ) return img;

                try {
                    img.Labels.content    = JSON.parse(img.Labels.content);
                } catch (e) {}

                return img;
            })
            .filter(function(img){
                return  img.Labels &&
                        img.Labels.content &&
                        img.Labels.content.tenant === o.tenant;
            })
        );
    });

    return D.promise;
};

function compile ( o, wrkDir ) {
    return Q.all([
        QFS.write(
            path.join(wrkDir, 'Dockerfile'),
            makeDockerfile(o.cnt)
        ),
        QFS.write(
            path.join(wrkDir, 'package.json'),
            templs.packageJson({})
        ),
        QFS.write(
            path.join(wrkDir, 'run_dep.js'),
            makeRunFile()
        ),
        QFS.copy(
            SETTINGS.auth_conf_path,
            path.join(wrkDir, '.auth.conf')
        ),
        QFS.makeTree(
            path.join(wrkDir, 'apps')
        ),
    ])
    .then(function(){
        var pathToAppsDir = path.join(wrkDir, 'apps');
    
        return Q.all(o.cnt.applications.map(function(app){
            var name = app.name + '_' + app.build,
                source = path.join(
                    __dirname,
                    '..',
                    '..',
                    'app_builds',
                    o.tenant,
                    app.platform,
                    name,
                    name + '.zip'
                ),
                target = path.join(pathToAppsDir, name + '.zip');
    
            log.info('COPYING "' + source + '" TO "' + target + '"');
            return QFS.copy(source, target);
        }));
    })
}

//$.get('http://localhost:9000/studio/docker/build').then(function(d){console.log(JSON.stringify(d.data,null,4))})
api.build = function ( o ) {

    return tmpDirTool.exec(function(wrkDir){

        return compile(o, wrkDir)
        .then(function(){

            var D = Q.defer(),
                tarStream = tar.pack(wrkDir);

            docker.buildImage(tarStream, {t : o.imgName}, function(error, output){

                if ( error ) return D.reject(error);

                output.on('end', function(){
                    D.resolve();
                });
                output.on('error', function(error){
                    D.reject(error);
                });
                output.pipe(process.stdout);
            });

            return D.promise;
        })
    });
};

api.push = function ( o ) {
    
    return getRegistryInfo(o.tenant).then(function(registryInfo){
        var _user = o.tenant + ':' +  o.user,
            _parsed = imageName.parse(o.imgName);

        if ( _parsed instanceof Error ) return Q.reject(_parsed);

        var img = docker.getImage(imageName.join({
                user : _parsed.user,
                name : _parsed.name
            })),
            opts = { authconfig : registryInfo };

        if ( _parsed.hasOwnProperty('tag') ) opts.tag = _parsed.tag;

        img.push(opts,function(error, data) {
            if ( error ) return log.error(
                'error, while trying to push the image "' + o.imgName +
                '", by user ' + _user, error
            );

            data.on('data', function(chunk){
                try { chunk = JSON.parse(chunk) }
                catch ( error ) {
                    log.error(
                        'parse error, while pushing image "' + o.imgName +
                        '", by user ' + _user, error
                    );
                }

                if ( !chunk.error ) {
                    var p;
                    if ( chunk.progressDetail && chunk.progressDetail.total ) {
                        p = Math.round((chunk.progressDetail.current / chunk.progressDetail.total) * 1000000)/100;
                    }
                    log.debug(
                        _user + ' is pushing ' + o.imgName + '\t' + chunk.id +
                        '\t' + chunk.status + ( p ? '\t' + p + '%' : '')
                    );
                } else {
                    log.error(
                        'error, while pushing image ' + o.imgName + ', id: ' +
                        chunk.id + ', by user ' + _user, chunk.error
                    );
                }
            });
            data.on('end',  function(){
                log.ok( _user + ' pushed ' + o.imgName );
            });
        });
    });
};

api.remove = function ( o ) {
    
    return getRegistryInfo(o.tenant).then(function(registryInfo){
        var _user = o.tenant + ':' + o.user,
            D = Q.defer(),
            _parsed = imageName.parse(o.imgName);

        if ( _parsed instanceof Error ) return D.reject(_parsed);

        var img,
            opts = { authconfig : registryInfo };

        try {
            img = docker.getImage(imageName.join({
                user : _parsed.user,
                name : _parsed.name,
                tag  : _parsed.tag
            }))
        } catch ( error ) {
            log.error(
                'error, while trying to remove image ' + o.imgName +
                ' by user ' + _user, error
            );

            D.reject( error.reason || error );
        }

        img.remove(opts,function(error, data) {
            if ( error ) {
                log.error(
                    'error, while trying to remove image ' + o.imgName +
                    ' by user ' + _user, error
                )
                D.reject( error.reason || error );
            } else {
                log.ok(
                    'docker image ' + o.imgName +
                    ' has been removed by ' + _user, data
                );
                D.resolve();
            }
        });

        return D.promise;
    });
};

function getRegistryInfo ( tenant ) {
    return db.get(DB_PREFIX + tenant, CL_SETTINGS, {
        name : 'docker_reqistry_info'
    })
    .then(function(docs){
        return docs[0];
    })
}

api.registry = (function ( o ) {
    var _api = {};

    _api.GET = function ( o ) {
        return getRegistryInfo(o.tenant);
    };

    _api.POST = function ( o ) {
        if ( !o.cnt ) return Q.reject('cnt is required');
        return db.update(
            DB_PREFIX + o.tenant,
            CL_SETTINGS,
            {
                name : 'docker_reqistry_info'
            },
            {
                name          : 'docker_reqistry_info',
                username      : o.cnt.username,
                password      : o.cnt.password,
                auth          : o.cnt.auth || '',
                email         : o.cnt.email,
                serveraddress : o.cnt.serveraddress
            },
            { upsert : true, multi : false }
        );
    };

    return function ( o ) {
        return !_api.hasOwnProperty(o.method)
            ? Q.reject('unknown dockerization registry method ' + o.method)
            : _api[o.method](o);
    }
})();

var imageName = (function(){

    var RE = /^([^:/]+)\/([^:/]+)(:([^:]+))?$/;

    return {
        parse : function parseImageName ( imgName ) {
                var parsed = RE.exec(imgName)
                    res = {};

                if ( parsed === null ) return Error(
                    'wrong format "' + imgName + '"'
                );

                if ( parsed[1] ) res.user = parsed[1];
                if ( parsed[2] ) res.name = parsed[2];
                if ( parsed[4] ) res.tag  = parsed[4];

                return res;
            },
        join : function ( o ) {
            var user = o.hasOwnProperty('user') && o.user,
                name = o.hasOwnProperty('name') && o.name,
                tag  = o.hasOwnProperty('tag')  && o.tag,
                res;

            if ( !name ) return Error('wrong format. name is not defined.');

            res = name;

            if ( user ) res = user + '/' + res;
            if ( tag ) res += ':' + tag;

            return res;
        }
    }
})();

function makeDockerfile ( contentDescription ) {

    // second JSON.stringify shields "
    var c = templs.dockerfile({
        LABEL  : 'content=' + JSON.stringify(JSON.stringify(contentDescription)),
        EXPOSE : '3000'
    });
    log.dbg('Dockerfile : ', c);
    return c;
    //return [
    //    'FROM surr/dreamface_dep_on_start:v3',
    //    //'MAINTAINER surr <litichevskij.vova@gmail.com>',
    //    'LABEL content=' + JSON.stringify(JSON.stringify(contentDescription)),
    //    'EXPOSE 3300',
    //    'COPY apps/ /dreamface/apps/',
    //    'COPY .auth.conf /dreamface/',
    //    'COPY run_dep.js /dreamface/',
    //    'ENTRYPOINT ["node", "/dreamface/run_dep.js"]',
    //].join('\n')
}

function makeRunFile () {

    var c = templs.run_dep({
        PORT : '3000'
    });
    log.dbg('run_dep.js : ', c);
    return c;
    //return [
    //    "var path = require('path');",
    //    "",
    //    "require('./dfx.js')",
    //    ".init({",
    //    "    server_host  : '0.0.0.0',",
    //    "    auth_conf_path : path.resolve(__dirname, './.auth.conf'),",
    //    "    edition: 'deployment',",
    //    "    storage: 'file',",
    //    "    server_port: 3300,",
    //    "    deploy_path: path.resolve(__dirname, './deploy'),",
    //    "    fsdb_path: path.resolve(__dirname, './app_fsdb'),",
    //    "    deploy_on_start_apps_from : path.join(__dirname, './apps')",
    //    "})",
    //    ".start();",
    //].join('\n');
}


exports.init = function ( o ) {
    db = o.db;
    delete exports.init;
};

exports.compile = compile;

exports.api = endpoints.json({
    parser: function (req) {
        var cnt;
// {\"tenant\":\"com\",\"applications\":[{\"name\":\"a3\",\"build\":\"1.0.12\",\"description\":\"d4\",\"date\":\"8/29/2015, 2:22:08 PM\"}]}
        try {
            var _cnt = req.query.cnt || req.body && req.body.cnt,
                _type = typeof _cnt;

            if ( _type === 'string' ) cnt = JSON.parse(_cnt);
            else if ( _type === 'object' ) cnt = _cnt;
        } catch (error) {
            return Q.reject(log.error('can not parse cnt : ', error))
        }

        return {
            action : req.params.action,
            data   : {
                method  : req.method,
                tenant  : req.session.tenant.id,
                user    : req.session.user.id,
                cnt     : cnt,
                imgName : req.query.imgName

            }
        }
    },
    action : api,
    log    : log
});

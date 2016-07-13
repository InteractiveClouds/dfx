const
    RGXP_IS_CT_JSON = /application\/json/,
    INFO_FLD_AUTH_ENDPOINT = 'authorization_endpoint',
    API_BLUEMIX_ENDPOINT = 'api.ng.bluemix.net';

var util          = require('util'),
    https         = require('https'),
    Q             = require('q'),
    qhttp         = require('q-io/http'),
    Docker        = require('dockerode'),
    tar           = require('tar-fs'),
    endpoints     = require('./utils/endpoints'),
    tmpDir        = require('./utils/tempdir'),
    dockerization = require('./dockerisation'),
    sockets       = require('./dfx_sockets'),
    api           = {},
    inProgress    = {},
    log,
    db,

    undefined;

Q.longStackSupport = true;


function setBody ( params, reqObject ) {

    if ( typeof params.body !== 'string') {
        params.body = JSON.stringify(params.body);
    }

    reqObject.headers['Content-Length'] = params.body.length;
    reqObject._entireBody = params.body;

    reqObject.body = {
        forEach: function(write){
            write(params.body);
        }
    };
}

function request ( o ) {
    o.headers = o.headers || {};
    o.headers['User-Agent'] = 'DFX.BlueMix_CloudFoundry_Client';

    var opts = qhttp.normalizeRequest(o);

    return qhttp.request(opts)
    .then(function (res) {
        return res.body.read()
        .then(function (body) {
            var answer = {
                headers : res.headers,
                status  : res.status,
                data    : body.toString('utf8')
            };

            if ( RGXP_IS_CT_JSON.test(res.headers['content-type']) ) {
                try { answer.data = JSON.parse(answer.data); } catch (error) {}
            }

            if ( DEBUG ) log.dbg(
                '-----------',
                'REQUEST : ', util.inspect(opts, {color:true, depth:1, }),
                'RESPONSE : ', util.inspect(answer, {color:true, depth:1, })
            );

            return  answer;
        })
    })
}

function getInfo () {
    return request({
        method   : 'GET',
        hostname : API_BLUEMIX_ENDPOINT,
        path     : '/v2/info',
        headers  : {
            'Accept' : 'application/json'
        }
        
    })
    .then(function(res){
        if ( res.status !== 200 ) return Q.reject(errors[2](tenant, {
            message : 'BLUEMIX API /v2/info returns status ' + res.status +
                        ' data ' + res.data
        }));

        if ( DEBUG ) log.dbg('auth info : ', res.data);

        return res.data;
    });
}

function loginBlueMix ( o ) {
    if ( !o.tenant || !o.email || !o.password ) return errors[3]();

    return obtainToken(
        o.tenant,
        'grant_type=password&password='+o.password+'&scope=&username='+o.email
    )
    .then(saveToken.bind(null, o.tenant, o.email))
    .then(function(token){})
    .fail(function(error){
        return error instanceof endpoints.ResponseError
            ? Q.reject(error)
            : Q.reject(errors[2](o.tenant, error));
    });
}

function logout ( o ) {
    return db.rm( getDbName(o.tenant), getClName() );
}

function saveToken (tenant, email, token){

    token.__expires_at  = now() + token.expires_in;
    token.__obtained_at = now();
    token.__name        = 'tokens';
    token.__email       = email;

    return db.update(
        getDbName(tenant),
        getClName(),
        {__name : 'tokens'},
        token,
        {
            upsert : true,
            multi  : false
        }
    )
    .then(function(){
        return token;
    })

}

function obtainToken (tenant, body) {
    var agent = new https.Agent({ rejectUnauthorized : false });

    return getInfo()
    .then(function(info){

        var opts = {
                url : info[INFO_FLD_AUTH_ENDPOINT] + '/oauth/token',
                headers  : {
                    'Content-Type'  : 'application/x-www-form-urlencoded',
                    'Accept'        : 'application/json',
                    'Authorization' : 'Basic ' +
                                        new Buffer('cf:').toString('base64')
                },
                method   : 'POST',
                agent    : agent
            };

        setBody({body:body}, opts);

        return request(opts)
        .then(function(res){

            //agent.destroy();

            var data = res.data;

            if ( res.status === 401 ) return Q.reject(errors[1]());

            if ( res.status !== 200 ) return Q.reject(errors[2](tenant, {
                message : util.inspect(res.headers, {depth:1}) +
                            util.inspect(res.body, {depth:1})
            }));

            return data;
        })
        .fail(function(error){
            //agent.destroy();
            return Q.reject(error);
        });
    });
}

function getToken ( tenant, entire ) {
    return db.get(
        getDbName(tenant),
        getClName(),
        {__name : 'tokens'}
    )
    .then(function(docs){
        if ( !docs || !docs[0] ) return Q.reject(errors[1]());

        var token = docs[0],
            _now = now();

        if ( DEBUG ) {
            if ( token.__expires_at <= _now + 60*5 ) log.dbg(
                'BulueMix token of the tenant "' + tenant + '" is expired',
                'TOKEN TIME : ' + token.__expires_at,
                'TIME NOW   : ' + _now
            );
            else log.dbg(
                'BulueMix token of the tenant "' + tenant + '" looks fresh enough',
                'TOKEN TIME : ' + token.__expires_at,
                'TIME NOW   : ' + _now
            );
        }

        var _token = token;
        return token.__expires_at > ( _now + 60*5 )
            ? Q.resolve(entire ? _token : token.access_token)
            : refreshToken(tenant, token)
                .then(function(token){
                    return entire ? _token : token.access_token
                })
                .fail(function(error){
                    return error instanceof endpoints.ResponseError
                        ? Q.reject(error)
                        : Q.reject(errors[2](tenant, error));
                });
    })
}

function refreshToken ( tenant, token ) {
    if ( DEBUG ) log.dbg('refreshing token for tenant "' + tenant + '" ...');

    return obtainToken(
        tenant,
        'grant_type=refresh_token&refresh_token='+token.refresh_token+'&scope='
    )
    .then(saveToken.bind(null, tenant, token.__email));
}

/**
 * @returns time now in seconds
 */
function now () {
    return Math.floor((new Date).getTime()/1000);
}

function loginStatus ( o ) {

    return Q.all([
        getOrgsList(o),
        getSpacesList(o),
        getChoosenOrganization(o),
        getChoosenSpace(o),
        getToken(o.tenant, true)
    ])
    .spread(function(orgs, spaces, org, space, token){
        return {
            organizations : orgs,
            spaces        : spaces,
            choosenOrg    : org,
            choosenSpace  : space,
            email         : token.__email
        };
    })
    .fail(function(error){
        if ( !(error instanceof endpoints.ResponseError) ) {
            log.error('GET LOGIN STATUS ERROR : ', ( error || 'empty') );
        }
        return {};
    })
}

function getOrgsList ( o ) {
    return getToken(o.tenant)
    .then(function(token){
        return request({
            method   : 'GET',
            hostname : API_BLUEMIX_ENDPOINT,
            path     : '/v2/organizations',
            headers  : {
                'Authorization' : 'Bearer ' + token,
                'Accept'        : 'application/json'
            }
        })
        .then(function(res){
            var orgs = {},
                raw = res.data;

            if ( raw.total_pages > 1 ) return Q.reject(errors[2](
                o.tenant,
                {
                    message : 'more than one page of result are gotten : ' +
                                JSON.stringify(raw,null,4)
                }
            ));

            raw.resources.forEach(function(item){
                orgs[item.metadata.guid] = item;
            });

            return orgs;
        });
    })
    .fail(function(error){
        return error instanceof endpoints.ResponseError
            ? Q.reject(error)
            : Q.reject(errors[2](o.tenant, error));
    });
}

function setChoosenOrg ( o ) {
    return db.update(
        getDbName(o.tenant),
        getClName(),
        { __name : 'choosenOrganization' },
        { __name : 'choosenOrganization', guid : o.guid },
        { upsert : true, multi : false }
    )
    .fail(function(error){
        return Q.reject(errors[2](o.tenant, error));
    });
}

function getChoosenOrganization ( o ) {
    return db.get(
        getDbName(o.tenant),
        getClName(),
        { __name : 'choosenOrganization' }
    )
    .then(function(docs){
        if ( !docs || !docs[0] ) return;
        return docs[0].guid;
    })
}

function getSpacesList ( o ) {
    return Q.all([
        getOrgsList({ tenant : o.tenant }),
        getChoosenOrganization(o)
    ])
    .spread(function(orgsList, choosenOrganizationGuid){
        if (
            !choosenOrganizationGuid ||
            !orgsList.hasOwnProperty(choosenOrganizationGuid)
        ) {
            return Q.reject(errors[4](orgsList));
        }

        return getToken(o.tenant)
        .then(function(token){
            return request({
                method   : 'GET',
                hostname : API_BLUEMIX_ENDPOINT,
                path     : orgsList[choosenOrganizationGuid].entity.spaces_url +
                            '?inline-relations-depth=1',
                headers  : {
                    'Authorization' : 'Bearer ' + token,
                    'Accept'        : 'application/json'
                }
            })
            .then(function(res){
                var spaces = {},
                    raw    = res.data.resources;

                if ( raw.total_pages > 1 ) return Q.reject(errors[2](
                    o.tenant,
                    {
                        message : 'more than one page of result are gotten : ' +
                                    JSON.stringify(raw,null,4)
                    }
                ));

                raw.forEach(function(item){
                    spaces[item.metadata.guid] = item.entity.name
                });

                return spaces;
            })
        })
    })
}

function setChoosenSpace ( o ) {
    return db.update(
        getDbName(o.tenant),
        getClName(),
        { __name : 'choosenSpace' },
        { __name : 'choosenSpace', guid : o.guid },
        { upsert : true, multi : false }
    )
    .fail(function(error){
        return Q.reject(errors[2](tenant, error));
    });
}

function getChoosenSpace ( o ) {
    return db.get(
        getDbName(o.tenant),
        getClName(),
        { __name : 'choosenSpace' }
    )
    .then(function(docs){
        if ( !docs || !docs[0] ) return Q.reject();
        return docs[0].guid;
    })
}

function getGroupsList ( o ) {
    return Q.all([
        getToken(o.tenant),
        getChoosenSpace(o)
    ])
    .spread(function(token, space){
        var agent = new https.Agent({ rejectUnauthorized : false });

        return request({
            method  : 'GET',
            url     : 'https://containers-api.ng.bluemix.net:8443/v3/containers/groups',
            headers : {
                'X-Auth-Token'      : token,
                'X-Auth-Project-Id' : space
            },
            agent   : agent
        })
        .then(function(res){
            return res.data;
        })
    })
}

function loginCF ( o ) {
    return Q.all([
        getToken(o.tenant),
        getChoosenOrganization(o),
        getChoosenSpace(o)
    ])
    .spread(function(token, org, space){
        var agent = new https.Agent({ rejectUnauthorized : false });

        return request({
            method  : 'PUT',
            url     : 'https://containers-api.ng.bluemix.net:8443/v3/tlskey/refresh',
            headers : {
                'X-Auth-Token'      : token,
                'X-Auth-Project-Id' : space
            },
            agent   : agent
        })
        .then(function(res){
            return saveCerts(o.tenant, space, res.data);
        })
    })
}

function getNamespace (o) {
    return db.get(
        getDbName(o.tenant),
        getClName(),
        { __name : 'namespace' }
    )
    .then(function(docs){
        if ( docs && docs[0] ) {
            if ( DEBUG ) log.dbg('got namespace from db for tenant ' + o.tenant);
            return docs[0].value;
        }

        return Q.all([
            getToken(o.tenant),
            getChoosenOrganization(o),
            getChoosenSpace(o)
        ])
        .spread(function(token, org, space){
            var agent = new https.Agent({ rejectUnauthorized : false });

            return request({
                method  : 'GET',
                url     : 'https://containers-api.ng.bluemix.net:8443/v3/registry/namespaces',
                headers : {
                    'X-Auth-Token'      : token,
                    'X-Auth-Project-Id' : space
                },
                agent   : agent
            })
            .then(function(res){

                if ( DEBUG ) log.dbg(
                    'got namespace "' + res.data.namespace +
                    '" from BM for tenant ' + o.tenant
                );

                db.update(
                    getDbName(o.tenant),
                    getClName(),
                    { __name : 'namespace' },
                    { __name : 'namespace', value : res.data.namespace },
                    { upsert : true, multi : false }
                )
                .done();

                return res.data.namespace;
            })
        });
    });
}


const
    IMG_PREFIX             = 'dfx-',
    BM_REPO                = 'registry.ng.bluemix.net',
    RGX_SEARCH_IMG_PREFIX  = new RegExp('^' + IMG_PREFIX ),
    RGX_REPLACE_IMG_PREFIX = new RegExp('^(?:' + IMG_PREFIX + ')?'),
    RGX_PARSE_IMAGE_NAME   = /^([^\/]+)\/([^\/]+)\/([^:]+):([^:]+)$/,
    RGX_TEST_IMG_NAME      = /^[-a-z0-9]+$/,
    imgn = {
        parse : function ( name ) {
            var parts = RGX_PARSE_IMAGE_NAME.exec(name);
            return !parts
                ? parts
                : {
                        repository : parts[1],
                        namespace  : parts[2],
                        name       : parts[3],
                        version    : parts[4]
                    }
        },
        isDFX : function ( name ) {
            return RGX_SEARCH_IMG_PREFIX.test(name);
        },
        clearName : function ( raw ) { return raw.replace(RGX_SEARCH_IMG_PREFIX, '') },
        compose : function ( namespace, name, version ) {
            var _name = name.replace(RGX_REPLACE_IMG_PREFIX, IMG_PREFIX);

            return BM_REPO + '/' + namespace + '/' + _name + ':' + version;
        }
    };

const RGX_HAS_SUCCESSFULLY_BUILT = /^Successfully built/;
function build ( o ) {

    if (
        !RGX_TEST_IMG_NAME.test(o.imageName) ||
        !RGX_TEST_IMG_NAME.test(o.imageVersion)
    ) return Q.reject(errors[7]());

    return Q.all([
        getCerts(o.tenant),
        getNamespace(o)
    ])
    .spread(function(certs, namespace){

        var imgName = imgn.compose(namespace, o.imageName, o.imageVersion),
            docker = new Docker({
                host : 'containers-api.ng.bluemix.net',
                port : 8443,
                ca   : certs.ca_cert,
                cert : certs.user_cert,
                key  : certs.user_key,
                version : 'v1.21'
            });

        return tmpDir.exec(function(wrkDir){
            return dockerization.compile(o, wrkDir)
            .then(function(){

                var D = Q.defer(),
                    startedTime = (new Date).getTime(),
                    done = false,
                    timeout,
                    tarStream = tar.pack(wrkDir);

                docker.buildImage(tarStream, {t : imgName}, function(error, stream){

                    if ( error ) {
                        sockets.sendMessage('tenant_'+ o.tenant +'_bmImageBuild', {
                            result         : 'failed',
                            clearImageName : o.imageName,
                            version        : o.imageVersion,
                            rawName        : imgName,
                            doneInMs       : (new Date).getTime() - startedTime,
                            reason         : JSON.stringify(error)
                        });

                        log.error('failed to build BM image ' + imgName, error);

                        return D.reject(error);
                    }

                    inProgress[o.tenant] = inProgress[o.tenant] || {};

                    docker.modem.followProgress(
                        stream,
                        function (error, output){
                            if ( error ) {
                                if ( DEBUG ) log.dbg('-----------', output, '------------');
                                delete inProgress[o.tenant][imgName];
                                sockets.sendMessage('tenant_'+ o.tenant +'_bmImageBuild', {
                                    result         : 'failed',
                                    clearImageName : o.imageName,
                                    version        : o.imageVersion,
                                    rawName        : imgName,
                                    doneInMs       : (new Date).getTime() - startedTime,
                                    reason         : JSON.stringify(error)
                                });

                                log.error('failed to build BM image ' + imgName, error);
                            } else {
                                if ( done ) return;
                                clearTimeout(timeout);
                                log.ok('image %s successfully built', imgName);
                                delete inProgress[o.tenant][imgName];
                                sockets.sendMessage('tenant_'+ o.tenant +'_bmImageBuild', {
                                    result         : 'success',
                                    clearImageName : o.imageName,
                                    version        : o.imageVersion,
                                    rawName        : imgName,
                                    doneInMs       : (new Date).getTime() - startedTime
                                });
                            }
                        },
                        function (event) {
                            if ( RGX_HAS_SUCCESSFULLY_BUILT.test(event.stream) ) {
                                log.ok('it looks like the image is successfully built : ', imgName);
                                timeout = setTimeout(function(){
                                    done = true;

                                    log.ok('suppose that the image %s successfully built', imgName);
                                    delete inProgress[o.tenant][imgName];
                                    sockets.sendMessage('tenant_'+ o.tenant +'_bmImageBuild', {
                                        result         : 'success',
                                        clearImageName : o.imageName,
                                        version        : o.imageVersion,
                                        rawName        : imgName,
                                        doneInMs       : (new Date).getTime() - startedTime
                                    });
                                }, 60000); // 1 minute
                            }
                        }
                    );

                    setTimeout(function(){
                        if ( !D.promise.isPending ) return;
                        inProgress[o.tenant][imgName] = {
                            clearImageName : o.imageName,
                            version        : o.imageVersion,
                            rawName        : imgName,
                            started        : (new Date(startedTime)).toISOString(),
                            namespace      : namespace,
                            content        : o.cnt
                        };
                        D.resolve('building is started');
                    }, 5000);
                });

                return D.promise;
            })
        });
    })
    .fail(function(error){
        return error instanceof endpoints.ResponseError
            ? Q.reject(error)
            : Q.reject(errors[2](o.tenant, error));
    });
}

function saveCerts ( tenant, space, certs ) {

    certs.__name = 'certs';
    certs.space  = space;

    return db.update(
        getDbName(tenant),
        getClName(),
        { __name : 'certs', space : space },
        certs,
        { upsert : true, multi : false }
    );
}

function getCerts ( tenant ) {

    return getChoosenSpace({ tenant : tenant })
    .fail(function(error){
        return Q.reject(errors[5](tenant))
    })
    .then(function(space){
        return db.get(
            getDbName(tenant),
            getClName(),
            { __name : 'certs', space : space }
        )
    })
    .then(function(docs){
        if ( !docs || !docs[0] ) return Q.reject(errors[2](
            tenant,
            { message : 'no certificates was found' }
        )); // TODO

        return docs[0];
    })
    .fail(function(error){
        return error instanceof endpoints.ResponseError
            ? Q.reject(error)
            : Q.reject(errors[2](o.tenant, error));
    });
}

function imgNamesList ( certs ) {
    // registry.ng.bluemix.net/NAMESPACE/IMGNAME:VERSION
}

function remoteImagesRawList ( o ) {
    return getCerts(o.tenant)
    .then(function(certs){

        var D = Q.defer(),
            docker = new Docker({
                host : 'containers-api.ng.bluemix.net',
                port : 8443,
                ca   : certs.ca_cert,
                cert : certs.user_cert,
                key  : certs.user_key,
                version : 'v1.21'
            });

        docker.listImages({}, function(error, data){
            error
                ? D.reject(error)
                : D.resolve({ list : data, docker : docker })
        });

        return D.promise;
    })
    .fail(function(error){
        return error instanceof endpoints.ResponseError
            ? Q.reject(error)
            : Q.reject(errors[2](o.tenant, error));
    });
}

function remoteImagesList ( o ) {
    const tenant = o.tenant;
    return remoteImagesRawList(o)
    .then(function(o){
        var rawList = o.list,
            docker = o.docker, // TODO getDockerInstance(tenant, org, space)
            filtered = rawList.filter(function(descr){
                var parsed = imgn.parse(descr.Image);
                return parsed
                    ? imgn.isDFX(parsed.name)
                    : false;
            }),
            inspected = [];

        return Q.all(filtered.map(function(obj){
            var D = Q.defer();
            docker.getImage(obj.Image)
            .inspect(function(error, data){
                error
                    ? D.reject(error)
                    : D.resolve(inspected.push({
                            name : obj.Image,
                            data : data
                        }));
            })
            return D.promise;
        }))
        .then(function(){
            return inspected.map(function(obj){
                var parsed = imgn.parse(obj.name);
                return {
                    rawName        : obj.name,
                    id             : obj.data.Config.Image,
                    created        : obj.data.Created,
                    repository     : parsed.repository,
                    namespace      : parsed.namespace,
                    imageName      : parsed.name,
                    clearImageName : imgn.clearName(parsed.name),
                    version        : parsed.version,
                    content        : parseContent(obj.data.Config.Labels.Content)
                }
            })
            .concat(Object.keys(inProgress[tenant] || {}).map(function(name){
                return {
                    rawName        : inProgress[tenant][name].rawName,
                    started        : inProgress[tenant][name].started,
                    namespace      : inProgress[tenant][name].namespace,
                    clearImageName : inProgress[tenant][name].clearImageName,
                    version        : inProgress[tenant][name].version,
                    content        : inProgress[tenant][name].content
                }
            }));
        })
    })
}

function parseContent ( str ) {
    var obj,
        apps = {};
    try { obj = JSON.parse(str) }
    catch (e) {}
    if ( !obj ) return [];

    obj.applications.forEach(function(app){
        apps[app.name] = apps[app.name] || [];
        apps[app.name].push(app.build);
    });

    return Object.keys(apps).map(function(appName){
        return {
            name   : appName,
            builds : apps[appName]
        }
    });
}

function removeImage ( o ) {
    return Q.all([
        getCerts(o.tenant),
        getNamespace(o)
    ])
    .spread(function(certs, namespace){

        var D = Q.defer(),
            docker = new Docker({
                host : 'containers-api.ng.bluemix.net',
                port : 8443,
                ca   : certs.ca_cert,
                cert : certs.user_cert,
                key  : certs.user_key,
                version : 'v1.21'
            }),
            imgName = imgn.compose(namespace, o.imageName, o.version),
            img;

        try {
            img = docker.getImage(imgName)
        } catch ( error ) {
            log.error(
                'error, while trying to remove image ' + imgName +
                ' by tenant ' + o.tenant, error
            );

            return D.reject( error);
        }

        img.remove(function(error, data) {
            if ( error ) {
                log.error(
                    'error, while trying to remove image ' + imgName +
                    ' by tenant ' + o.tenant, error
                )
                return D.reject( error );
            } else {
                log.ok(
                    'BlueMix image ' + imgName +
                    ' has been removed by ' + o.tenant, data
                );
                return D.resolve();
            }
        });

        return D.promise;
    })
    .fail(function(error){
        return error instanceof endpoints.ResponseError
            ? Q.reject(error)
            : Q.reject(errors[2](o.tenant, error));
    });
}

function init ( o ) {

    log       = o.log;
    db        = o.db;
    getDbName = o.getDbName;
    getClName = o.getClName;
    DEBUG     = o.DEBUG;

    delete exports.init;

    exports.api = endpoints.json({
        parser : function ( req ) {
            var data = req.method === 'POST' ? req.body : req.query;

            data.tenant = req.user.tenantid;

            return {
                action : req.params.action,
                data : data
            }
        },
        action : api,
        log : log
    });

    o.log.info('inited.');
}

var errors = {
    '1' : function () {
            return new endpoints.ResponseError({
                title   : 'request error',
                message : 'unauthorized',
                code    : 1,
                status  : 400
            });
        },

    '2' : function ( tenant, error ) {

            error = error || {message:'empty error'};

            return new endpoints.ResponseError({
                type    : 'internal server error',
                code    : 2,
                status  : 500,
                message : error.message
            });
        },

    '3' : function () {
            return new endpoints.ResponseError({
                title   : 'request error',
                message : 'either "tenant", "email", "password" MUST be set',
                code    : 3,
                status  : 200
            });
        },
    '4' : function (orgsList) {
            return new endpoints.ResponseError({
                title    : 'request error',
                message  : 'choose organization',
                code     : 4,
                status   : 400,
                data     : orgsList
            });
        },
    '5' : function () {
            return new endpoints.ResponseError({
                title    : 'request error',
                message  : 'choose space',
                code     : 5,
                status   : 400,
                /*data     : orgsList*/
            });
        },

    '6' : function (imgName) {
            return new endpoints.ResponseError({
                title    : 'request error',
                message  : 'the image name already exists',
                code     : 6,
                status   : 400,
                data     : imgName
            });
        },
    '7' : function () {
            return new endpoints.ResponseError({
                title    : 'request error',
                message  : 'set valid imageName and imageVersion',
                code     : 7,
                status   : 400,
            });
        }
};

api.loginBlueMix     = loginBlueMix;
api.getSpacesList    = getSpacesList;
api.setChoosenSpace  = setChoosenSpace;
api.getChoosenSpace  = getChoosenSpace;
api.getOrgsList      = getOrgsList;
api.setChoosenOrg    = setChoosenOrg;
api.loginCF          = loginCF;
api.getNamespace     = getNamespace;
api.remoteImagesList = remoteImagesList;
api.build            = build;
api.logout           = logout;
api.loginStatus      = loginStatus;
api.removeImage      = removeImage;

//exports.test = function () {
//    getGroupsList({tenant:'com'}).then(function(data){
//        console.log(' --------------------------------- TEST\n');
//        console.log(data);
//    })
//    .done();
//};


exports.init = init;


/*
 * EXAMPLES :

$.post('/studio/bm/loginBlueMix', {email:'EMAIL', password:'PASS'})
.then(function(data){console.log(data)})
.fail(function(error){console.log(error), console.log(JSON.stringify(JSON.parse(error.responseText).error, null, 4))})

$.get('/studio/bm/getOrgsList')

$.post('/studio/bm/setChoosenOrg', {guid:'da818d15-2d19-4b82-81da-cbfb69960df7'})

$.get('/studio/bm/getSpacesList')

$.post('/studio/bm/setChoosenSpace', {guid:'ae819dcd-50ef-4536-b6a9-b2139ea5e1e2'})

$.get('/studio/bm/getChoosenSpace')

$.get('/studio/bm/remoteImagesList')

$.get('/studio/bm/remoteImagesList')

$.post('/studio/bm/loginCF')

$.get('/studio/bm/remoteImagesList')

$.get('/studio/bm/getNamespace')

$.get('/studio/bm/getNamespace')

$.post('/studio/bm/build', {
    cnt : {
        applications : [ { name : 'a1', build : '1.0.10'} ]
    },
    imgName : 'registry.ng.bluemix.net/dfxsample/bmapitest:v1'
})

*/

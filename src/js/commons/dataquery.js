/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/**
 * DataQuery
 * Construct a new DataQuery object.
 * @class This class is used for execute DataQuery (external url or DB)
 * @param {String|Object} params. The DataQuery name as String or params as Object {par1:val1,...}.
 * @return A new DataQuery instance
 */
function DataQuery(params) {
    this.name = null;
    this.data = null;
    this.queryMetaData = null;
    this.queryRequestData = null;
    if (typeof params == 'string') {
        this.name = params;
        this.setOptions({});
    } else if (typeof params == 'object') {
        this.setOptions(params);
    }

    return this;
};

DataQuery.prototype.type = "DataQuery";

/**
 * set Options
 * @param {Object} options
 * required params:
 * {'url':url,
 *  'source':'db/ext'
 *  'typeRequest':'POST'
 *  'params': []/{},
 * }
 *
 * optional parameters:
 * 'params':
 * [
 *     {'name':'account','value':'123','type':'request','operation':'eq'},
 *     {...}
 * ]
 */
DataQuery.prototype.setOptions = function (options) {
    var self = this,
        settings = {
            'source': null,
            'url': null,
            'typeRequest': 'GET',
            'auth': {'auth': 'none'},
            'urlRandom': 0,
            'params': self.getParameters(),
            'appexpr':[],
            'precode':[],
            'postcode':[],
            'reqbody':''
        };

    settings = jQuery.extend(settings, options);
    // set this.url, this.source....
    $.each(settings, function (key, val) {
        self[key] = val;
    });
};

/**
 *
 * @param {Object} parameters
 * example :
 * JSON as
 *     {"name":"John"}
 * or array as
 *   for external source
 *     arrParams[index] = {
 *         name: name,
 *         type: "request/header",
 *         value: value
 *     };
 *   for db source
 *     arrParams[index] = {
 *         name: name,
 *         value: value,
 *         operation: "eq/ne/lt/gt",
 *     }
 *
 */
DataQuery.prototype.setParameters = function (parameters) {
    this.params = parameters;
};

/**
 * get Parameters
 * @returns {*}
 */
DataQuery.prototype.getParameters = function () {
    return (this.params && this.params.length) ? this.params : [];
};

DataQuery.prototype.setReqBody = function (body) {
    this.reqbody = body;
};


/**
 * Executes the Query.
 */
DataQuery.prototype.execute = function () {
    var ajaxOptions = {cache: false, data: {}};
    if(this.typeRequest == 'POST'){
        ajaxOptions.type = 'POST';
    }
    return this.executeDo(ajaxOptions);
};

DataQuery.prototype.executePost = function(){
    return this.executeDo({cache: false, data: {}, type:'POST'})
}

DataQuery.prototype.executeDo = function (ajaxOptions) {
    var self = this,
        dfd = $.Deferred();
    // check
    if(self.name == null){
        if (self.source == null) {
            dfd.reject({'error':'Not set source!','typeError':'request'});
            return dfd;
        }
        if(self.url == null){
            dfd.reject({'error':'Please enter the Request URL!','typeError':'request'});
            return dfd;
        }
    }

    ajaxOptions.url = (IS_STUDIO || ((!authRequest.isInitialized()) && sessionStorage.dfx_appname == '_preview'))
        ? '/studio/query/execute' : '/app/query/execute';

    // set ajax data options
    ajaxOptions.data = {
        queryName: self.name,
        typeRequest: self.typeRequest,
        source: self.source,
        auth: self.auth,
        url: self.url,
        urlRandom: self.urlRandom,
        appexpr: self.appexpr,
        reqbody: self.reqbody,
        dbnames: self.dbnames,
        precode: self.precode,
        postcode: self.postcode,
        format: self.format,
        tenantid: sessionStorage.dfx_tenantid,
        application: self.application
    }
    if(self.soap){
        ajaxOptions.data.soap = self.soap;
    }
    // set parameters
    ajaxOptions.data.data = self.params;
    // ajax request
    return connector = h.getFromServer(ajaxOptions)
    .then(function (data) {
        if ( data && data.typeError === 'oAuth2 redirection is required' ) {

            $('#showQueryMetaData').hide();
            $('#showQueryData').hide();
            $('#showQueryRequestData').hide();

            window.location.replace(
                '/studio/obtainaccesstoken'                                         +
                '?application='  + encodeURIComponent(ajaxOptions.data.application) +
                '&authProvider=' + encodeURIComponent(ajaxOptions.data.auth.auth)   +
                '&studiourl='    + encodeURIComponent(window.location.toString())   +
                '&isStudio=true'
            );

            return; // it looks like window.location.replace is async ???
        }

        var txtError = "", typeError = 'request';
        if (data.error) {
            txtError = data.error;
        } else if (self.source == 'db') {
            if (data.data && data.data.length == 0 && self.params == "") {
                txtError = 'there is no such database or collection';
            }
        }
        if (txtError != "") {
            if(data.typeError){
                typeError = data.typeError;
            }
            dfd.reject({'error':txtError,'typeError':typeError});
            return dfd;
        }
        var metadata = (data.metadata) ? data.metadata : null,
            requestData = (data.requestData) ? data.requestData : null;
        data = (data.data) ? data.data : null;
        self.generateAllData(data, metadata, requestData);

    }, function (error) {
        var resErr = 'An error has occurred!';
        if(typeof error == 'string'){
            resErr = error;
        }
        return {'error':resErr,'typeError':'request'};
    });
};


/**
 * Generate the meta data and set the data
 * @param data
 * @param metadata
 * @param requestData
 */
DataQuery.prototype.generateAllData = function (data, metadata, requestData) {
    // set data
    if (data) {
        this.setData(data);
    }
    if (metadata) {
        this.setMetaData(metadata);
    }
    if (requestData) {
        this.setRequestData(requestData);
    }
};


/**
 * Returns the name of the DataQuery.
 * @type String
 */
DataQuery.prototype.getName = function () {
    return this.name;
};

/**
 * Returns the data resulting from the DataQuery execution.
 * @type JSON
 */
DataQuery.prototype.getData = function () {
    return this.data;
};

/**
 * Returns the data resulting from the DataQuery execution as String.
 * @type STRING
 */
DataQuery.prototype.getDataAsString = function () {
    return JSON.stringify(this.data);
};

/**
 * Returns the meta data
 * @type JSON
 */
DataQuery.prototype.getMetaData = function () {
    return this.queryMetaData;
};

/**
 * Returns the Request Data
 * @type JSON
 */
DataQuery.prototype.getRequestData = function () {
    return this.queryRequestData;
};

/**
 * Set the data resulting from the DataQuery execution.
 * @type JSON
 */
DataQuery.prototype.setData = function (data) {
    this.data = data;
};

/**
 * Set the metadata resulting from the DataQuery execution.
 * @type JSON
 */
DataQuery.prototype.setMetaData = function (metadata) {
    this.queryMetaData = metadata;
};

/**
 * Set the requestData resulting from the DataQuery execution.
 * @type JSON
 */
DataQuery.prototype.setRequestData = function (requestData) {
    this.queryRequestData = requestData;
};

/**
 * Ajax Connector
 * @param {Opject} options
 * @param {Function} callbackError
 * @returns Deferred Object
 */
var ajaxConnector = function (options, callbackError) {

    var settings = {
        url: '',
        type: 'get',
        cache: false,
        dataType: 'json',
        data: {}
    };
    settings = jQuery.extend(settings, options || {});
    /*
     if (sessionStorage.dfx_server!=null) {
     settings.url = sessionStorage.dfx_server + settings.url;
     }
     */

    var req = (IS_STUDIO || ((!authRequest.isInitialized()) && sessionStorage.dfx_appname == '_preview'))
        ? $.ajax(settings) : authRequest(settings);

    return req
    .then(null, function(jqXHR, exception){
        // error
        var textError = "";
        if (settings.url == '') {
            textError = 'url is EMPTY!';
        } else if (jqXHR.status === 0) {
            textError = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            textError = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            textError = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            textError = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            textError = 'Time out error.';
        } else if (exception === 'abort') {
            textError = 'Ajax request aborted.';
        } else {
            textError = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        return textError;
    });
};

/**
 * Soap Client
 */
(function ($) {
    var globalConfig = {
        proxyUrl: null,
        soapUrl: null,
        action: ''
    };
    //var soapPortName = 'GlobalWeatherHttpGet';
    $.soapClient = function (options) {
        var config = {};
        $.extend(config, globalConfig, options);
        if (config.action == 'getOperations' && config.proxyUrl && config.soapUrl) {
            SOAPTools.wsdlInfo = new WSDLInfo ();
            SOAPTools.setProxyUrl(config.proxyUrl);
            SOAPTools.loadWsdl({proxyUrl: config.proxyUrl, soapUrl: config.soapUrl})
            .then(function (msg) {
                if (msg.error) {
                    if ($.isFunction(config.error)) {
                        msg.content = msg.error;
                        config.error(msg);
                    }
                } else {
                    if ($.isFunction(config.success)) {
                        config.success(SOAPClient);
                    }
                }
            })
            .fail(function(jqXHR) {
                if ($.isFunction(config.error)) {
                    config.error(new SOAPResponse(jqXHR.status, jqXHR));
                }
            });
        }
    };
    var SOAPResponse = function (status, xhr, msg) {
        this.typeOf = "SOAPResponse";
        this.status = status;
        this.headers = xhr.getAllResponseHeaders().split('\n');
        if (msg) {
            this.content = msg;
        } else {
            this.content = (xhr.responseXML === undefined) ? xhr.responseText : xhr.responseXML;
        }
        if (typeof this.content == 'string') {
            try {
                this.content = JSON.parse(this.content);
            } catch (ex) {}
        }
    };
    var SOAPTools = {
        wsdlInfo: null,
        cacheWsdl: [],
        setProxyUrl: function (url) {
            if (this.wsdlInfo) {
                this.wsdlInfo.setProxyUrl(url);
            }
        },
        loadAjax: function(opts){
            var self = this, dfd = $.Deferred();
            if (self.cacheWsdl[opts.soapUrl]) {
                dfd.resolve(self.cacheWsdl[opts.soapUrl]);
                return dfd;
            }
            return $.ajax({
                url:  opts.proxyUrl,
                type: 'get',
                async: true,
                dataType: "xml",
                data: {'soapUrl': opts.soapUrl}
            }).then(function (req) {
                if (req) {
                    self.cacheWsdl[opts.soapUrl] = req;
                    dfd.resolve(self.cacheWsdl[opts.soapUrl]);
                } else {
                    dfd.reject({'error': 'Not set request data', 'typeError': 'app'});
                }
                return dfd;
            });
        },
        loadWsdl: function (opts) {
            var self = this;
            return self.loadAjax(opts)
                .then(function (data) {
                    var msg = {};
                    try {
                        if ($.isXMLDoc(data)) {
                            self.wsdlInfo.loadWsdl($(data), opts.soapUrl);
                            self.getAllOperations();
                            SOAPClient.soapUrl = opts.soapUrl;
                            msg.success = {};
                        } else {
                            msg.error = {'error': 'The document is not xml!', typeError: 'request'};
                        }
                    } catch (ex) {
                        msg.error = {'error': ex, typeError: 'request'};
                    }
                    return msg;
                });
        },
        getAllOperations: function () {
            var self = this,
                services = self.wsdlInfo.getServices(),
                typeName = '',
                operations = {},
                ports = {},
                types = {};
            SOAPClient.wsdlAllServices = services;
            //soapPortName = "GlobalWeatherSoap";
            for (var serviceIdx in services) {
                if(services.hasOwnProperty(serviceIdx)) {
                    SOAPClient.wsdlService = serviceIdx;
                    //get all WsdlPorts from wsdl as Array
                    ports = services[serviceIdx].getPorts();
                    //console.log('ports=',ports)
                    for (var portIdx  in ports) {
                        if(ports.hasOwnProperty(portIdx)) {
                            // get WsdlPortType from current port
                            types = ports[portIdx].getWsdlPortType();
                            //console.log('types=',types)
                            if(types){
                                typeName = types.getName();
                                //console.log('typeName=',typeName)
                                if(typeName){
                                    operations[typeName] = types.getOperations();
                                    //console.log('operations[typeName]=',operations[typeName])
                                }
                            }
                        }
                    }
                }
            }
            //console.log('operation->',operations);
            SOAPClient.wsdlOperations = operations;
        }
    };

    var SOAPClient = {
        soapUrl: '',
        wsdlAllServices: [],
        wsdlService: '',
        wsdlOperations: {},
        getWSDL: function(){
            return SOAPTools.cacheWsdl[this.soapUrl];
        },
        getInfoObj: function(){
            return SOAPTools.wsdlInfo;
        },
        getAllServices: function(){
            return this.wsdlAllServices;
        },
        getService: function(){
            return this.wsdlService;
        },
        /**
         *
         * @param soapPortName
         * @returns {null}
         */
        getOperationsByPortType: function(soapPortName){
            var res = null;
            if(this.wsdlOperations[soapPortName]){
                res = this.wsdlOperations[soapPortName];
            }
            return res;

        },
        /**
         * find operation
         * @param operationName
         * @param portName
         * @param serviceName
         * @returns {*}
         */
        findOperation: function(operationName, portName, serviceName){
            var parameters = [], res = false;
            try{
                this.operation = SOAPTools.wsdlInfo.findOperation(operationName, portName, serviceName);
            } catch(e){
                console.log('error find operation:',e);
            }

            if(this.operation){
                this.inputParts = this.operation.getInputParts();
                res = true;
            }
            return res;
        }
    }
})(jQuery);

/**
 Stores XSD schemas from remote location
 */
WSDLInfo.XSDCashe = [];

/**
 Errors handler object
 Object should implements handle method:
 handle return type is : Error
 patameters:message(string), exception(Error), target(string)
 */
WSDLInfo.ExceptionHandlerObject = new ErrorHandler();

/**
 Object for handling errors as Alerts
 */
function ErrorHandler()
{
    this.handle = function(message, exception, target) {
        var log = message;
        if(exception){
            if (WSDLInfo.isNetscape()) {
                log =  (target != null?target + " : ":"") + message + " : original error is : " + exception;
            } else {
                log =  (target != null?target + " : ":"") + message + " : original error is : " + exception.message;
            }
        } else if(target){
            log =  target + " : " + message;
        }
        console.log(log);
        return message;

    }
}

/**
 Object for parsing WSDL XML document
 */
function WSDLInfo() {

    var WsdlURL = null;

    /** w3c WSDL document */
    var WSDL = null;

    /** Holds all schema elements */
    var SchemaElements = [];

    /** Holds all availible services for current wsdl*/
    var SERVICES = [];

    /** Holds proxyUrl*/
    var ProxyUrl = null;

    /** Hold all import resources(XSD) */
    var importResources = [];
    this.wsdlNamespaceURI = 'http://schemas.xmlsoap.org/wsdl/';
    this.schemaNamespaceURI = 'http://www.w3.org/2001/XMLSchema';

    this.getImportResources = function() {
        return importResources;
    };

    this.addImportResource = function(url) {
        importResources[url] = WSDLInfo.XSDCashe[url];
    };

    this.getImportResource = function(url) {
        return importResources[url];
    };

    this.getSchemaElements = function() {
        return SchemaElements;
    };

    this.getServices = function() {
        return SERVICES;
    };

    this.setServices = function(services) {
        SERVICES = services;
    };

    this.getWsdlUrl = function() {
        return WsdlURL;
    };

    /**  WSDL xml document */
    this.setWsdl = function(wsdl) {
        WSDL = wsdl;
    };
    this.getWSDL = function() {
        return WSDL;
    };

    /** ProxyUrl */
    this.setProxyUrl = function(url) {
        ProxyUrl = url;
    };
    this.getProxyUrl = function() {
        return ProxyUrl;
    };

    /** namespace */
    // todo
    this.setNameSpaceWsdl = function(nc) {
        this.wsdlNamespaceURI = nc;
    };
    this.setNameSpaceSchema = function(nc) {
        this.schemaNamespaceURI = nc;
    };

    /** retrieving all services and type elements */
    this.parseWsdl = function(wsdl) {
        try {
            /** Init  wsdl types */
            var types = WSDLInfo.getElementsByTagName(wsdl, 'service', this.wsdlNamespaceURI);
            if(!types.length){
                throw new Error("Service not found");
            }
            for (var i = 0; i < types.length; ++i){
                this.getServices()[WSDLInfo.getXmlAttributeValue(types[i], 'name')] = new WsdlService(types[i], this);
            }
            SchemaElements = WSDLInfo.getSchemaElement(wsdl, this);
            //console.log('SchemaElements ----->',SchemaElements)
        }
        catch(ex) {
            WSDLInfo.exceptionHandler("[Parsing WSDL]", ex, "WSDLInfo.parseWsdl");
        }
    };

    /** Method for loading wsdl */
    this.loadWsdl = function(wsdl, url) {
        WsdlURL = url;
        this.parseWsdl(wsdl);
        this.setWsdl(wsdl);
    };

    /** find operation from current webservice */
    this.findOperation = function(operationName, portName, serviceName) {
        try {
            var services = this.getServices();
            if (services[serviceName]) {
                if (services[serviceName].getPorts()[portName]) {
                    var types = services[serviceName].getPorts()[portName].getWsdlPortType();
                    return types.findOperation(operationName);
                } else {
                    WSDLInfo.exceptionHandler("[Port Name " + portName + " not found]", null, "WSDLInfo.findOperation");
                }
            } else {
                WSDLInfo.exceptionHandler("[Service " + serviceName + " not found]", null, "WSDLInfo.findOperation");
            }
        } catch(e) {
            WSDLInfo.exceptionHandler("[Operation finder]", e, "WSDLInfo.findOperation");
        }
    }
}

/**
 * Getting simple inputs from wsdl type
 * @param element
 * @param xmlsimpleElements
 * @param namespace
 */
WSDLInfo.getSimpleTypesFromElement = function(element, xmlsimpleElements, namespace) {
    try {
        var children = element.childNodes;

        if (children.length == 0 && WSDLInfo.getXmlAttributeValue(element, 'name') == null)
            return;
        if (!WSDLInfo.isNetscape()) {
            if (children.length == 1 && WSDLInfo.getXmlAttributeValue(children[0], 'name') == null && children[0].nodeType == 1) {
                WSDLInfo.getSimpleTypesFromElement(children[0], xmlsimpleElements, namespace);
            }
        } else {
            if (children.length == 3 && WSDLInfo.getXmlAttributeValue(children[1], 'name') == null && children[1].nodeType == 1) {
                WSDLInfo.getSimpleTypesFromElement(children[1], xmlsimpleElements, namespace);
            }
        }
        var elemArray, maxOccurs, type;
        for (var i = 0; i < children.length; i++) {
            //If element with simple or complex type
            if (WSDLInfo.getXmlAttributeValue(children[i], "name") != null && WSDLInfo.getXmlAttributeValue(children[i], "type") != null) {
                elemArray = [];
                elemArray['isArray'] = false;
                maxOccurs = WSDLInfo.getXmlAttributeValue(children[i], "maxOccurs");
                if (maxOccurs != null && maxOccurs > '1') {
                    elemArray['isArray'] = true;
                    elemArray['maxOccurs'] = maxOccurs;
                }

                //get single name(namespace excluded)
                type = WSDLInfo.getXmlAttributeValue(children[i], "type");
                if(type){
                    if (WSDLInfo.getXmlAttributeValue(children[i], "type").split(":").length == 1)
                        elemArray['type'] = type;
                    else
                        elemArray['type'] = type.split(":")[1];
                }
                elemArray['namespace'] = namespace;
                xmlsimpleElements[WSDLInfo.getXmlAttributeValue(children[i], "name")] = elemArray;
            } else { //If ref to element
                if (WSDLInfo.getXmlAttributeValue(children[i], "ref") != null && WSDLInfo.getXmlAttributeValue(children[i], "type") == null) {
                    elemArray['isArray'] = false;
                    if (WSDLInfo.getXmlAttributeValue(children[i], "maxOccurs") != null && WSDLInfo.getXmlAttributeValue(children[i], "maxOccurs") > '1')
                        elemArray['isArray'] = true;

                    //get siggle name(namespace excluded)
                    if(WSDLInfo.getXmlAttributeValue(children[i], "type")) {
                        if (WSDLInfo.getXmlAttributeValue(children[i], "type").split(":").length == 1)
                            elemArray['Ref'] = WSDLInfo.getXmlAttributeValue(children[i], "ref");
                        else
                            elemArray['Ref'] = WSDLInfo.getXmlAttributeValue(children[i], "ref").split(":")[1];
                    }
                    xmlsimpleElements[WSDLInfo.getXmlAttributeValue(children[i], "ref")] = elemArray;
                } else {
                    if (WSDLInfo.getXmlAttributeValue(children[i], "name") != null && WSDLInfo.getXmlAttributeValue(children[i], "type") == null) {
                        elemArray['isArray'] = false;
                        if (WSDLInfo.getXmlAttributeValue(children[i], "maxOccurs") != null && WSDLInfo.getXmlAttributeValue(children[i], "maxOccurs") > '1')
                            elemArray['isArray'] = true;
                        elemArray['namespace'] = namespace;
                        xmlsimpleElements[WSDLInfo.getXmlAttributeValue(children[i], "name")] = elemArray;
                        //alert("Push :" + WSDLInfo.getXmlAttributeValue(children[i], "name") + " : NameSpace: " + namespace);
                    }
                }
            }
        }
    } catch(e) {
        WSDLInfo.exceptionHandler("[Error when getting inner elements]", e, "WSDLInfo.getSimpleTypesFromElement");
    }
};

/**
 * get import schema
 * @param wsdlInfo
 * @param schemaLocation
 * @returns {*}
 */
WSDLInfo.getImport = function(wsdlInfo, schemaLocation){
    var res = null;
    var reUrlPattern = new RegExp("^(http|ftp|https|file)://(.*?)");
    var proxyUrl = wsdlInfo.getProxyUrl();
    var replacePattern, responseImport;
    //validate import location
    if(schemaLocation){
        if (!reUrlPattern.test(schemaLocation)) {
            replacePattern = new RegExp("[/]([^/])*$");
            schemaLocation = wsdlInfo.getWsdlUrl().replace(replacePattern, "/" + schemaLocation);
        }
        responseImport = WSDLInfo.ImportXsdAsSchemaElement(schemaLocation, proxyUrl);
    }
    return responseImport;
};

/**
 * Get all  schema elements
 * @param wsdl
 * @param wsdlInfo
 */
WSDLInfo.getSchemaElement = function(wsdl, wsdlInfo) {
    try {
        var schemaReal = null,
            schemas = [],
            sElements = [],
            schemaLocation,
            children,
            childrenImport,
            responseImport,
            namespace,
            elements,
            elementByName = '',
            tgName = '';
        if (WSDLInfo.getElementsByTagName(wsdl, 'schema', wsdlInfo.schemaNamespaceURI))
            schemaReal = WSDLInfo.getElementsByTagName(wsdl, 'schema', wsdlInfo.schemaNamespaceURI);
        //Downloading imports from schemaLocation element if exists
        if (schemaReal.length > 0) {
            for (var j = 0; j < schemaReal.length; ++j) {
                schemaLocation = null;
                // include
                children = WSDLInfo.getChildXmlNodes(schemaReal[j], 'include');
                if (children.length > 0) {
                    for(var l=0; l<childrenImport.length; l++){
                        schemaLocation = WSDLInfo.getXmlAttributeValue(children[l], "schemaLocation");
                        responseImport = WSDLInfo.getImport(wsdlInfo, schemaLocation);
                        //console.log('responseImport1=',responseImport);
                        if(responseImport && !responseImport.error){
                            schemas.push(responseImport);
                            wsdlInfo.addImportResource(schemaLocation);
                        }
                    }
                } else {
                    schemas.push(schemaReal[j]);
                }

                // import
                childrenImport = WSDLInfo.getChildXmlNodes(schemaReal[j], 'import');
                if (childrenImport.length > 0) {
                    for(var k=0; k<childrenImport.length; k++){
                        schemaLocation = WSDLInfo.getXmlAttributeValue(childrenImport[k], "schemaLocation");
                        //console.log('schemaLocation=',schemaLocation)
                        responseImport = WSDLInfo.getImport(wsdlInfo, schemaLocation);
                        //console.log('responseImport2=',responseImport);
                        if(responseImport && !responseImport.error){
                            schemas.push(responseImport);
                            wsdlInfo.addImportResource(schemaLocation);
                        }
                    }
                } else {
                    schemas.push(schemaReal[j]);
                }
            }
        }

        if (schemas.length > 0) {
            for (var j = 0; j < schemas.length; ++j) {
                namespace = WSDLInfo.getXmlAttributeValue(schemas[j], 'targetNamespace');
                //console.log('namespace=',namespace)
                elements = schemas[j].childNodes;
                for (var i = 0; i < elements.length; ++i) {
                    try {
                        elementByName = WSDLInfo.getXmlAttributeValue(elements[i], 'name');
                        tgName = elements[i].tagName.split(":");
                        if (tgName.length == 1){
                            tgName = tgName[0];
                        } else {
                            tgName = tgName[1];
                        }
                        if (sElements[elementByName]) {
                            if (tgName.toLowerCase() == 'complextype'){
                                sElements[elementByName] = new SchemaElement(elements[i], namespace);
                            }
                        } else {
                            if (elements[i].nodeType == 1 && elements[i].nodeName!="import") {
                                //console.log('element_2=',elements[i].nodeName, elementByName)
                                if(elementByName){
                                    sElements[elementByName] = new SchemaElement(elements[i], namespace);
                                }
                            }
                        }
                    } catch(e) {}
                }
            }
            //Fill all
            for (var p in sElements){
                if(sElements.hasOwnProperty(p)){
                    sElements[p].fill();
                }
            }
            //console.log('end!')
        }
        return sElements;
    } catch(e) {
        WSDLInfo.exceptionHandler("[Error when parsing schemas]", e, "WSDLInfo.getSchemaElement");
    }
};

/**
 * Geting Xsd element as type for Wsdp part type
 * @param elementname
 * @param infoClass
 * @returns {*}
 */
WSDLInfo.getTypeFromWsdl = function(elementname, infoClass) {

    // Search Elements
    var ell = WSDLInfo.getElementsByTagName(infoClass.getWSDL(), 'element', infoClass.schemaNamespaceURI);
    var element_name;
    if (elementname.split(":").length == 1)
        element_name = elementname;
    else
        element_name = elementname.split(":")[1];

    if(ell){
        for (var i = 0; i < ell.length; i++) {
            if (WSDLInfo.getXmlAttributeValue(ell[i], "name") != null && element_name == WSDLInfo.getXmlAttributeValue(ell[i], "name")){
                return ell[i];
            }
        }
    }

    //Searching from import XSD if not exists in WSDL
    var remoteResources = infoClass.getImportResources();
    for (var resource in remoteResources) {
        ell = WSDLInfo.getElementsByTagName($(remoteResources[resource]), 'element', infoClass.schemaNamespaceURI);
        for (var i = 0; i < ell.length; i++) {
            if (WSDLInfo.getXmlAttributeValue(ell[i], "name") != null && element_name == WSDLInfo.getXmlAttributeValue(ell[i], "name"))
                return ell[i];
        }
    }
    return null;

};

/**
 * Gets all child nodes with needed name
 * @param element
 * @param childname
 * @returns array
 */
WSDLInfo.getChildXmlNodes = function(element, childname) {
    var resultArray = [];
    try {
        var nodes = $(element).children(), LocalPattern, nodeName;
        if( nodes.length ){
            for (var i = 0, len= nodes.length; i < len; ++i) {
                LocalPattern = new RegExp("^.*:");
                nodeName = nodes[i].nodeName.replace(LocalPattern, "");
                if (nodeName == childname){
                    resultArray.push(nodes[i]);
                }
            }
        }
        return resultArray;
    } catch(e) {
        WSDLInfo.exceptionHandler('[Error when getting child nodes from XML node]', e, 'WSDLInfo.getChildXmlNodes');
    }
};


/**
 * Get XML node by tagName
 * @param doc
 * @param tagName
 * @param ns
 * @returns {*|jQuery}
 */
WSDLInfo.getElementsByTagName = function(doc, tagName, ns) {
    if(doc.length){
        var elem = $(doc).find('*').ns_filter(ns, tagName);
        //console.log('tagname=',tagName)
        if(elem.length){
            return elem;
        }
        /*
        else {
            WSDLInfo.exceptionHandler('[Could not get element by tag name '+tagName+']', null, 'WSDLInfo.getElementsByTagName');
        }
        */
    } else {
        WSDLInfo.exceptionHandler('[Document is empty]', null, 'WSDLInfo.getElementsByTagName');
    }
};


/**
 * Get attr value from MSXML or FireFox
 * @param element
 * @param attrname
 * @returns {null}
 */
WSDLInfo.getXmlAttributeValue = function(element, attrname) {
    var returnValue = null;
    if (element) {
        returnValue = $(element).attr(attrname);
        if(returnValue){
            return returnValue;
        }
    } else {
        WSDLInfo.exceptionHandler('[Error when getting attribute value '+attrname+']', null, 'WSDLInfo.getXmlAttributeValue');
    }
};


/**
 * Loading resources from external location
 * @param url
 * @param proxyUrl
 * @returns {*}
 * @constructor
 */
WSDLInfo.ImportXsdAsSchemaElement = function(url, proxyUrl) {
    var res = null;
    try {
        if (WSDLInfo.XSDCashe[url]){
            return WSDLInfo.getElementsByTagName($(WSDLInfo.XSDCashe[url]), "schema");
        }
        $.ajax({
            url:  proxyUrl,
            type: 'get',
            async: false,
            dataType: "xml",
            data:{'soapUrl':url},
            success: function(xml){
                var getSchema = WSDLInfo.getElementsByTagName($(xml), "schema");
                if(getSchema && getSchema.length){
                    WSDLInfo.XSDCashe[url] = xml;
                    res = getSchema[0];
                }
            }
        });
        return res;
    } catch(e) {
        WSDLInfo.exceptionHandler("[Error when loading external XSD]", e, "WSDLInfo.ImportXsdAsSchemaElement");
    }
};

/**
 Check browser isNetscape
 */
WSDLInfo.isNetscape = function() {
    return navigator.appName.toLowerCase().indexOf("netscape") != -1;
};

/**
 * Handles errors
 * @param message
 * @param exception
 * @param target
 */
WSDLInfo.exceptionHandler = function(message, exception, target) {
    throw WSDLInfo.ExceptionHandlerObject.handle(message, exception, target);
};

/**
 * Object for representing WSDL service
 * @param service
 * @param infoClass
 * @constructor
 */
function WsdlService(service, infoClass) {
    var service_Name = WSDLInfo.getXmlAttributeValue(service, 'name');
    var Ports = [];

    /** get Service name */
    this.getName = function()    {
        return service_Name;
    };

    /** get all wsdl ports for current service */
    this.getPorts = function() {
        try {
            var opList = service.childNodes;
            for (var i = 0; i < opList.length; ++i)
                if (opList[i].nodeName.indexOf("port") != -1) {
                    if (WSDLInfo.getXmlAttributeValue(opList[i], 'name') + "" != "undefined") {
                        Ports[WSDLInfo.getXmlAttributeValue(opList[i], 'name')] = new WsdlPort(opList[i], infoClass);
                    }
                }
            return Ports;
        } catch(e) {
            WSDLInfo.exceptionHandler("[WsdlService when getting ports]", e, "WsdlService.getPorts");
        }
    };
}

/**
 * Object for representing WSDL port
 * @param port
 * @param infoClass
 * @constructor
 */
function WsdlPort(port, infoClass) {
    var port_Name = WSDLInfo.getXmlAttributeValue(port, 'name');
    var binding;

    /** get binding and replace namespace */
    if (WSDLInfo.getXmlAttributeValue(port, 'binding').split(":").length == 1)
        binding = WSDLInfo.getXmlAttributeValue(port, 'binding');
    else
        binding = WSDLInfo.getXmlAttributeValue(port, 'binding').split(":")[1];
    var PortType;

    /** target invokation address */
    var address = "";
    //getting endpoint address
    for (var i = 0; i < port.childNodes.length; i++)
        if (WSDLInfo.getXmlAttributeValue(port.childNodes[i], 'location') + "" != "undefined")
            address = WSDLInfo.getXmlAttributeValue(port.childNodes[i], 'location');


    /** get Port name */
    this.getName = function() {
        return port_Name;
    };

    /** get port types for current wsdl port */
    this.getWsdlPortType = function() {
        try {
            var bindings = WSDLInfo.getElementsByTagName(infoClass.getWSDL(), 'binding', infoClass.wsdlNamespaceURI);
            for (var j = 0; j < bindings.length; ++j) {
                if (WSDLInfo.getXmlAttributeValue(bindings[j], 'name')) {
                    if (WSDLInfo.getXmlAttributeValue(bindings[j], 'name') == binding) {
                        var bindingType;
                        if (WSDLInfo.getXmlAttributeValue(bindings[j], 'type').split(":").length == 1)
                            bindingType = WSDLInfo.getXmlAttributeValue(bindings[j], 'type');
                        else
                            bindingType = WSDLInfo.getXmlAttributeValue(bindings[j], 'type').split(":")[1];

                        var types = WSDLInfo.getElementsByTagName(infoClass.getWSDL(), 'portType', infoClass.wsdlNamespaceURI);
                        for (var i = 0; i < types.length; ++i)
                            if (WSDLInfo.getXmlAttributeValue(types[i], 'name') == bindingType)
                                PortType = new WsdlType(types[i], address, infoClass);
                        if (PortType)
                            return PortType;
                        else
                            WSDLInfo.exceptionHandler("PortType not found", null, "WsdlPort.getWsdlPortType");
                    }
                }
            }
        } catch(e) {
            WSDLInfo.exceptionHandler("[WsdlPort error]", e, "WsdlPort.getWsdlPortType");
        }
    };

    /** Endpoint address*/
    this.getAddressLocation = function() {
        return address;
    }
}

/**
 * Object for representing WSDL port type
 * @param type
 * @param address
 * @param infoClass
 * @constructor
 */
function WsdlType(type, address, infoClass) {
    var type_Name = WSDLInfo.getXmlAttributeValue(type, 'name');
    var Operations = [];
    var opList = type.childNodes;
    for (var i = 0; i < opList.length; ++i) {
        if (WSDLInfo.getXmlAttributeValue(opList[i], 'name') + "" != "undefined") {
            Operations[WSDLInfo.getXmlAttributeValue(opList[i], 'name')] = new WsdlOperation(opList[i], address, infoClass);
        }
    }

    this.getName = function() {
        return type_Name;
    };

    this.getOperations = function() {
        return Operations;
    };

    this.findOperation = function(operationName) {
        try {
            if (Operations) {
                return Operations[operationName];
            } else {
                WSDLInfo.exceptionHandler("Operation not found", null, "WsdlType.findOperation");
            }
        } catch(e) {
            WSDLInfo.exceptionHandler("[WsdlType error]", e, "WsdlType.findOperation");
        }
    }
}

/**
 * Object for representing WSDL operation
 * @param operation
 * @param address
 * @param infoClass
 * @constructor
 */
function WsdlOperation(operation, address, infoClass) {
    var operation_Name = WSDLInfo.getXmlAttributeValue(operation, 'name');
    var Input;
    var Output;
    //get input
    var children = operation.childNodes;
    for (var i = 0; i < children.length; i++)
        if (children[i].nodeName.indexOf("input") != -1)
            Input = new WsdlInput(children[i], infoClass);

    //get output
    children = operation.childNodes;
    for (var i = 0; i < children.length; i++)
        if (children[i].nodeName.indexOf("output") != -1)
            Output = new WsdlOutput(children[i], infoClass);

    this.getAddress = function() {
        return address;
    };
    this.getName = function() {
        return operation_Name;
    };

    this.getInput = function() {
        return Input;
    };
    this.getOutput = function() {
        return Output;
    };

    //Get input parts from operation directly
    this.getInputParts = function() {
        return Input.getMessage().getParts();
    };

    //Get outputs parts from operation directly
    this.getOutPutParts = function() {
        return Output.getMessage().getParts();
    };

    //Get real input parameters MAP
    this.getInputParameterMap = function() {
        try {
            //Helper function
            var getRequestInputs = function(operation) {
                //building parameters object
                var getRequestParametersAsArray = function(element, name) {
                    var params = [], innerElements, innerParams, parArray;
                    if (!element['isArray']) {
                        if (!infoClass.getSchemaElements()[element['type']]) {
                            params[name + ' xmlns="' + element['namespace'] + '"'] = "";
                        } else {
                            innerElements = infoClass.getSchemaElements()[element['type']].getXmlSimpleElements();
                            innerParams = [];
                            for (var i in innerElements)
                                innerParams[i] = getRequestParametersAsArray(innerElements[i], i);
                            params[name + ' xmlns="' + element['namespace'] + '"'] = innerParams;
                        }
                    } else {
                        if (!infoClass.getSchemaElements()[element['type']]) {
                            parArray = [];
                            params[name + ' xmlns="' + element['namespace'] + '"'] = parArray;
                        } else {
                            innerElements = infoClass.getSchemaElements()[element['type']].getXmlSimpleElements();
                            innerParams = [];
                            for (var i in innerElements)
                                innerParams.push(getRequestParametersAsArray(innerElements[i], i));
                            params[name + ' xmlns="' + element['namespace'] + '"'] = innerParams;
                        }
                    }
                    return params;
                };

                var parameters = new WSClientParameters();
                var inputParts = operation.getInputParts();
                if (inputParts) {
                    for (var i in inputParts) {
                        if (!inputParts[i].isDocumentStyle()) {
                            parameters.add(inputParts[i].getName(), "");
                        } else {
                            var documentStyleElement = inputParts[i].getDocumentStyleElement();
                            documentStyleElement.parseElement();
                            var childrenEl = documentStyleElement.getChildren();
                            for (var j in childrenEl) {
                                parameters.add(j, getRequestParametersAsArray(childrenEl[j], j));
                            }
                        }
                    }
                }
                return parameters;
            };
            return getRequestInputs(this);
        } catch(e) {
            WSDLInfo.exceptionHandler("[Error when getting InputMap]", e, "WsdlOperation.getInputParameterMap");
        }
    }
}

/**
 * Object for representing WSDL Input
 * @param input
 * @param infoClass
 * @constructor
 */
function WsdlInput(input, infoClass) {
    var input_Name;
    //check if name or message element present
    if (WSDLInfo.getXmlAttributeValue(input, 'name'))
        input_Name = WSDLInfo.getXmlAttributeValue(input, 'name');
    else
        input_Name = WSDLInfo.getXmlAttributeValue(input, 'message');
    var message;

    this.getName = function() {
        return input_Name;
    };

    this.getMessage = function() {
        try {
            var message_name;
            if (input_Name.split(":").length == 1)
                message_name = input_Name;
            else
                message_name = input_Name.split(":")[1];

            var messages = WSDLInfo.getElementsByTagName(infoClass.getWSDL(), 'message', infoClass.wsdlNamespaceURI);
            for (var i = 0; i,messages.length; ++i){
                if (message_name == WSDLInfo.getXmlAttributeValue(messages[i], 'name'))
                    return new WsdlMessage(messages[i], infoClass);
            }

            WSDLInfo.exceptionHandler("Wsdl is not correct", null, "WsdlOutput.getMessage");
        } catch(e) {
            WSDLInfo.exceptionHandler("[Error when getting WSDL message]", e, "WsdlOutput.getMessage");
        }
    }
}


/**
 * Object for representing WSDL Output
 * @param output
 * @param infoClass
 * @constructor
 */
function WsdlOutput(output, infoClass) {
    var output_Name;
    //check if name or message element present
    if (WSDLInfo.getXmlAttributeValue(output, 'name'))
        output_Name = WSDLInfo.getXmlAttributeValue(output, 'name');
    else
        output_Name = WSDLInfo.getXmlAttributeValue(output, 'message');


    this.getName = function() {
        return output_Name;
    };

    this.getMessage = function() {
        try {
            var message_name;
            if (output_Name.split(":").length == 1)
                message_name = output_Name;
            else
                message_name = output_Name.split(":")[1];
            var messages = WSDLInfo.getElementsByTagName(infoClass.getWSDL(), 'message', infoClass.wsdlNamespaceURI);
            for (var i = 0; i,messages.length; ++i)
                if (message_name == WSDLInfo.getXmlAttributeValue(messages[i], 'name'))
                    return new WsdlMessage(messages[i], infoClass);
            WSDLInfo.exceptionHandler("Wsdl is not correct", null, "WsdlOutput.getMessage");
        } catch(e) {
            WSDLInfo.exceptionHandler("[Error when getting WSDL message]", e, "WsdlOutput.getMessage");
        }
    }
}

/**
 * Object for representing WSDL Message
 * @param message
 * @param infoClass
 * @constructor
 */
function WsdlMessage(message, infoClass) {
    var message_Name = WSDLInfo.getXmlAttributeValue(message, 'name');
    var Parts = [];
    //get message parts
    var nodes = message.childNodes;
    for (var i = 0; i < nodes.length; ++i) {
        if (WSDLInfo.getXmlAttributeValue(nodes[i], 'name') + "" != "undefined")
            Parts[WSDLInfo.getXmlAttributeValue(nodes[i], 'name')] = new WsdlPart(nodes.item(i), infoClass);
    }

    this.getName = function() {
        return message_Name;
    };

    this.getParts = function() {
        return Parts;
    }
}

/**
 * Object for representing WSDL part
 * @param patr
 * @param infoClass
 * @constructor
 */
function WsdlPart(patr, infoClass) {
    var part_Name = WSDLInfo.getXmlAttributeValue(patr, 'name');
    var part_Type;
    var isDocument = false;
    if (WSDLInfo.getXmlAttributeValue(patr, 'type')) {
        part_Type = WSDLInfo.getXmlAttributeValue(patr, 'type');
    } else {
        part_Type = WSDLInfo.getXmlAttributeValue(patr, 'element');
        isDocument = true;
    }

    this.getName = function() {
        return part_Name;
    };
    this.getPartType = function() {
        return part_Type;
    };

    this.isDocumentStyle = function() {
        return  isDocument;
    };

    this.getDocumentStyleElementNode = function() {
        return  WSDLInfo.getTypeFromWsdl(part_Type, infoClass);
    };

    this.getDocumentStyleElement = function() {
        return new DocumentElement(WSDLInfo.getTypeFromWsdl(part_Type, infoClass), infoClass);
    }
}


/**
 * Object for representing document style element
 * @param elementNode
 * @param infoClass
 * @constructor
 */
function DocumentElement(elementNode, infoClass) {
    var Children = [];
    var element_Name = WSDLInfo.getXmlAttributeValue(elementNode, 'name');
    this.getName = function() {
        return element_Name;
    };

    this.parseElement = function() {
        Children = infoClass.getSchemaElements()[element_Name].getXmlSimpleElements();
    };

    this.getChildren = function() {
        return Children;
    }
}

/**
 * Object for representing Schema element
 * @param element
 * @param namespace
 * @constructor
 */
function SchemaElement(element, namespace) {
    var xmlSimpleElements = [];

    this.fill = function(){
        WSDLInfo.getSimpleTypesFromElement(element, xmlSimpleElements, namespace);
    };

    this.getXmlSimpleElements = function() {
        return xmlSimpleElements;
    };

    this.getXmlElement = function() {
        return element;
    };

    this.getNameSpace = function() {
        return namespace;
    }
}

// ns_filter, a jQuery extension for XML namespace queries.
(function($) {
    $.fn.ns_filter = function(namespaceURI, localName) {
        return $(this).filter(function() {
            var domNode = $(this)[0];
            return ((namespaceURI && domNode.namespaceURI == namespaceURI || !namespaceURI) && domNode.localName == localName);
        });
    };

})(jQuery);

/**
 * WSClientParameters
 * Wrapped all invoke parameters as Map
 * @constructor
 */
function WSClientParameters() {
    var parameters = [];
    this.add = function(name, value) {
        parameters[name] = value;
        return this;
    }
    /**
     Iterates Map and builds XML for envelop
     */
    this.toXml = function() {
        var xml = "";
        xml += WSClientParameters.getXML(parameters);
        return xml;
    }
    this.setParameters = function(pars) {
        parameters = pars;
    }
    this.getParameters = function() {
        return parameters;
    }
}

/**
 * Iterate Map
 * @param parameters
 * @param name
 * @returns {string}
 */
WSClientParameters.getXML = function(parameters, name) {
    var xml = "";
    for (var p in parameters) {
        if(parameters.hasOwnProperty(p)){
            if (typeof(parameters[p]) == "object") {
                var iparameters = parameters[p];
                for (var rp in iparameters){
                    if(iparameters.hasOwnProperty(rp)){
                        //Complex object
                        if (typeof(iparameters[rp]) == "object") {
                            if (typeof(iparameters[rp][0]) == "undefined") {
                                xml += "<" + rp + ">";
                                xml += WSClientParameters.getXML(iparameters[rp], rp);
                                if (rp.indexOf(" ") > 0)
                                    xml += "</" + rp.substr(0, rp.indexOf(" ")) + ">";
                                else
                                    xml += "</" + rp + ">";
                            } else{
                                xml += WSClientParameters.getXML(iparameters[rp], rp);
                            }
                        } else { //Simple Array
                            if (rp.indexOf(" ") > 0)
                                xml += "<" + rp + ">" + iparameters[rp].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + rp.substr(0, rp.indexOf(" ")) + ">";
                            else
                                xml += "<" + rp + ">" + iparameters[rp].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + rp + ">";
                        }
                    }
                }
            } else if (typeof(parameters[p]) != "function") {
                if (name) {
                    if (name.indexOf(" ") > 0)
                        xml += "<" + name + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + name.substr(0, name.indexOf(" ")) + ">";
                    else
                        xml += "<" + name + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + name + ">";
                } else {
                    if (p.indexOf(" ") > 0)
                        xml += "<" + p + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + p.substr(0, p.indexOf(" ")) + ">";
                    else
                        xml += "<" + p + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + p + ">";
                }
            }
        }
    }
    return xml;
};

(function(){
    // Convert array to object
    var convertArrToObj = function(array){
        var thisEleObj = new Object();
        if(typeof array == "object"){
            for(var i in array){
                var thisEle = convertArrToObj(array[i]);
                thisEleObj[i] = thisEle;
            }
        }else {
            thisEleObj = array;
        }
        return thisEleObj;
    };
    var oldJSONStringify = JSON.stringify;
    JSON.stringify = function(input){
        if(oldJSONStringify(input) == '[]')
            return oldJSONStringify(convertArrToObj(input));
        else
            return oldJSONStringify(input);
    };
})();
var path = require('path');
var beautifyJsonFilter = {
    "name": "Beautify JSON Filter",
    "code": "var resp = [];\nvar data = response.rss.channel[0].item;\nvar maxResults = (data.length < 15) ? data.length : 15;\nvar i, item;\n//Get only 15 items back to caller\nfor (i=0; i< maxResults; i++){\n    item = data[i];\n    resp.push({\n    'title': item.title[0],\n    'link' : item.link[0],\n    'image_url' : item['media:content'] ? item['media:content'][0].$.url : undefined,\n    'image' : item['media:content'] ? item['media:content'][0].$ : undefined,\n    'description': item.description ? item.description[0] : item['itunes:summary'][0]\n   });  \n}\nresponse = resp;\nterminateFilter(response);"
}
module.exports = {
    categories : [
        {
            name : "Google",
            icon : path.resolve(__dirname, '..', 'tmp'),
            dataSources : [
                {
                    name : "Gmail",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth2",
                            auth_provider_name: "",
                            consumer_key: "",
                            consumer_secret: "",
                            queryName: "",
                            base_site: "https://accounts.google.com",
                            authorize_path : '/o/oauth2/auth',
                            access_token_path: "/o/oauth2/token",
                            response_type: "code",
                            scope: "https://www.googleapis.com/auth/drive.metadata.readonly+https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/plus.login+https://www.googleapis.com/auth/calendar.readonly+https://www.google.com/m8/feeds+https://www.googleapis.com/auth/contacts.readonly",
                            type: "google"

                        },
                        routes: [
                            {
                                "name": "profile",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/gmail/v1/users/me/profile",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "emails/list",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/gmail/v1/users/me/messages",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "emails/get",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/gmail/v1/users/me/messages/{id}",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "id",
                                            "type": "url",
                                            "value": "Email id",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "threads/list",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/gmail/v1/users/me/threads/{id}",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "id",
                                            "type": "url",
                                            "value": "Thread id",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                        ]
                    }
                },
                {
                    name : "Calendar",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth2",
                            auth_provider_name: "",
                            consumer_key: "",
                            consumer_secret: "",
                            queryName: "",
                            base_site: "https://accounts.google.com",
                            authorize_path : '/o/oauth2/auth',
                            access_token_path: "/o/oauth2/token",
                            response_type: "code",
                            scope: "https://www.googleapis.com/auth/drive.metadata.readonly+https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/plus.login+https://www.googleapis.com/auth/calendar.readonly+https://www.google.com/m8/feeds+https://www.googleapis.com/auth/contacts.readonly",
                            type: "google"

                        },
                        routes: [
                            {
                                "name": "calendar",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/calendar/v3/users/me/calendarList",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Contacts",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth2",
                            auth_provider_name: "",
                            consumer_key: "",
                            consumer_secret: "",
                            queryName: "",
                            base_site: "https://accounts.google.com",
                            authorize_path : '/o/oauth2/auth',
                            access_token_path: "/o/oauth2/token",
                            response_type: "code",
                            scope: "https://www.googleapis.com/auth/drive.metadata.readonly+https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/plus.login+https://www.googleapis.com/auth/calendar.readonly+https://www.google.com/m8/feeds+https://www.googleapis.com/auth/contacts.readonly",
                            type: "google"

                        },
                        routes: [
                            {
                                "name": "list",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.google.com/m8/feeds/contacts/default/full",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Drive",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth2",
                            auth_provider_name: "",
                            consumer_key: "",
                            consumer_secret: "",
                            queryName: "",
                            base_site: "https://accounts.google.com",
                            authorize_path : '/o/oauth2/auth',
                            access_token_path: "/o/oauth2/token",
                            response_type: "code",
                            scope: "https://www.googleapis.com/auth/drive.metadata.readonly+https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/plus.login+https://www.googleapis.com/auth/calendar.readonly+https://www.google.com/m8/feeds+https://www.googleapis.com/auth/contacts.readonly",
                            type: "google"

                        },
                        routes: [
                            {
                                "name": "files",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/drive/v2/files",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Translate",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth: false,
                        fields: {
                            queryName: "",
                            apiKey: ""
                        },
                        routes: [
                            {
                                "name": "google/translate/languages",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/language/translate/v2/languages",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "target",
                                            "type": "request",
                                            "value": "en",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "google/translate/detect/language",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/language/translate/v2/detect",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "q",
                                            "type": "request",
                                            "value": "Hello World",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "google/translate",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/language/translate/v2",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "q",
                                            "type": "request",
                                            "value": "Hello World",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "source",
                                            "type": "request",
                                            "value": "en",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "target",
                                            "type": "request",
                                            "value": "fr",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Places",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth: false,
                        fields: {
                            queryName: "",
                            apiKey: ""
                        },
                        routes: [
                            {
                                "name": "google/places/autocomplete",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://maps.googleapis.com/maps/api/place/autocomplete/json",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "input",
                                            "type": "request",
                                            "value": "Paris",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "types",
                                            "type": "request",
                                            "value": "geocode",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "google/places/details",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://maps.googleapis.com/maps/api/place/details/json",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "placeid",
                                            "type": "request",
                                            "value": "ChIJRXe4DXJu5kcR_u_BPeHJ2mE",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "google/places/nearbysearch",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "location",
                                            "type": "request",
                                            "value": "-33.8670,151.1957",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "radius",
                                            "type": "request",
                                            "value": "500",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "types",
                                            "type": "request",
                                            "value": "food",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "me",
                                            "type": "request",
                                            "value": "cruise",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "google/places/searchByQuery",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://maps.googleapis.com/maps/api/place/textsearch/json",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "query",
                                            "type": "request",
                                            "value": "restaurants+in+Paris",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Elevation",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth: false,
                        fields: {
                            queryName: "",
                            apiKey: ""
                        },
                        routes: [
                            {
                                "name": "google/elevation",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://maps.googleapis.com/maps/api/elevation/json",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "locations",
                                            "type": "request",
                                            "value": "46.6495725,32.6077816",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "key",
                                            "type": "request",
                                            "value": "",
                                            "variable" : "apiKey",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
            ]
        },
        {
            name : "Social",
            icon : path.resolve(__dirname, '..', 'tmp'),
            dataSources : [
                {
                    name : "Facebook",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth2",
                            auth_provider_name: "",
                            consumer_key: "",
                            consumer_secret: "",
                            queryName: "",
                            authorize_path : 'https://www.facebook.com/dialog/oauth',
                            access_token_path: "https://graph.facebook.com/v2.3/oauth/access_token",
                            response_type: "code",
                            scope: "manage_notifications+user_friends+user_groups+user_about_me+user_posts+read_stream",
                            type: "facebook"

                        },
                        routes : [
                            {
                                "name": "groups",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.0/me/groups",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "notifications",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.0/me/notifications",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "photos",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.0/me/photos",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "friends",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.0/me/friends",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "profile",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.0/me",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "feeds",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.5/me/feed",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "wall",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://graph.facebook.com/v2.0/me/home",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Twitter",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth1",
                            auth_provider_name: "",
                            signature_method: "HMAC-SHA1",
                            consumer_key: "",
                            consumer_secret: "",
                            access_token: "",
                            access_secret: "",
                            queryName: ""
                        },
                        routes : [
                            {
                                "name": "twitter/statuses/home_timeline",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://api.twitter.com/1.1/statuses/home_timeline.json",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "twitter/statuses/user_timeline",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=twitterapi&count=2",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Google+",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : true,
                        fields: {
                            schema: "oAuth2",
                            auth_provider_name: "",
                            consumer_key: "",
                            consumer_secret: "",
                            queryName: "",
                            base_site: "https://accounts.google.com",
                            authorize_path : '/o/oauth2/auth',
                            access_token_path: "/o/oauth2/token",
                            response_type: "code",
                            scope: "https://www.googleapis.com/auth/drive.metadata.readonly+https://www.googleapis.com/auth/gmail.readonly+https://www.googleapis.com/auth/plus.login+https://www.googleapis.com/auth/calendar.readonly+https://www.google.com/m8/feeds+https://www.googleapis.com/auth/contacts.readonly",
                            type: "google"

                        },
                        routes: [
                            {
                                "name": "plus",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/plus/v1/people/me",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "search",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "https://www.googleapis.com/plus/v1/people",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "service": {
                                        "method": ""
                                    },
                                    "parameters": [
                                        {
                                            "name": "query",
                                            "type": "request",
                                            "value": "dreamface",
                                            "operation": "eq"
                                        },
                                        {
                                            "name": "language",
                                            "type": "request",
                                            "value": "en",
                                            "operation": "eq"
                                        }
                                    ]
                                }
                            },
                        ]
                    }
                },
                //{
                //    name : "LinkedIn",
                //    icon : path.resolve(__dirname, '..', 'tmp'),
                //    cont : []
                //},
                //{
                //    name : "VK",
                //    icon : path.resolve(__dirname, '..', 'tmp'),
                //    cont : []
                //}
            ]
        },
        {
            name : "News",
            icon : path.resolve(__dirname, '..', 'tmp'),
            dataSources : [
                {
                    name : "CNN",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : false,
                        fields: {
                            queryName: ""
                        },
                        routes : [
                            {
                                "name": "cnn/top_stories",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/edition.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "cnn/world",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/edition_world.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "cnn/europe",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/edition_europe.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "cnn/money",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/money_news_international.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "cnn/technology",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/edition_technology.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "cnn/science_and_space",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/edition_space.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "cnn/football",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://rss.cnn.com/rss/edition_football.rss",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "TechCrunch",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : false,
                        fields: {
                            queryName: ""
                        },
                        routes : [
                            {
                                "name": "TechCrunch/startups",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/TechCrunch/startups",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "TechCrunch/fundings-exits",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/TechCrunch/fundings-exits",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "TechCrunch/social",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/TechCrunch/social",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "TechCrunch/Mobilecrunch",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/Mobilecrunch",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "TechCrunch/crunchgear",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/crunchgear",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "TechCrunch/gaming",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/TechCrunch/gaming",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "Techcrunch/TechCrunchIT",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/TechCrunchIT",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "TechCrunch/greentech",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/TechCrunch/greentech",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "Techcrunch/europe",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://feeds.feedburner.com/Techcrunch/europe",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "json",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Forbes",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : false,
                        fields: {
                            queryName: ""
                        },
                        routes : [
                            {
                                "name": "forbes/popstories",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/feeds/popstories.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/europe_news",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/europe_news/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/technology",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/technology/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/education",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/education/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/sportsmoney",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/sportsmoney/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/energy",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/energy/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/autos",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/autos/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/business",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/business/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "forbes/opinions",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.forbes.com/opinions/index.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name : "Bloomberg",
                    icon : path.resolve(__dirname, '..', 'tmp'),
                    cont : {
                        use_auth : false,
                        fields: {
                            queryName: ""
                        },
                        routes : [
                            {
                                "name": "bloomberg/view",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/bloombergview.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/brief",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/bloomberg-brief.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/benchmark",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/benchmark.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/featured",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/featured.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/first-word",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/first-word.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/surveillance",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/surveillance.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/hays-advantage",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/hays-advantage.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/taking-stock",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/taking-stock.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            },
                            {
                                "name": "bloomberg/masters-in-business",
                                "data": {
                                    "metadata": "",
                                    "settings": {
                                        "source": "ext",
                                        "connector": "http",
                                        "postrequestbody": "",
                                        "authentication": "none",
                                        "auth_password": "",
                                        "typerequest": "HTTP_GET",
                                        "urlrandom": "0",
                                        "auth_userid": "",
                                        "url": "http://www.bloomberg.com/feed/podcast/masters-in-business.xml",
                                        "dbdriver": "",
                                        "dbnames": {
                                            "database": "",
                                            "collection": ""
                                        }
                                    },
                                    "format": "xml",
                                    "postcode": [beautifyJsonFilter],
                                    "service": {
                                        "method": ""
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        },
        //{
        //    name : "Travel",
        //    icon : path.resolve(__dirname, '..', 'tmp'),
        //    dataSources : [
        //        {
        //            name : "FlightStats",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : []
        //        },
        //        {
        //            name : "TripAdvisor",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : []
        //        },
        //        {
        //            name : "Expedia",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : {
        //                use_auth: false,
        //                fields: {
        //                    queryName: "",
        //                    app_consumer_key: "",
        //                    app_consumer_secret: ""
        //                },
        //                routes: [
        //                    {
        //                        "name": "expedia/ping",
        //                        "data": {
        //                            "metadata": "",
        //                            "settings": {
        //                                "source": "ext",
        //                                "connector": "http",
        //                                "postrequestbody": "",
        //                                "authentication": "none",
        //                                "auth_password": "",
        //                                "typerequest": "HTTP_GET",
        //                                "urlrandom": "0",
        //                                "auth_userid": "",
        //                                "url": "http://api.ean.com/ean-services/rs/hotel/v3/ping?echo=example",
        //                                "dbdriver": "",
        //                                "dbnames": {
        //                                    "database": "",
        //                                    "collection": ""
        //                                }
        //                            },
        //                            "format": "xml",
        //                            "service": {
        //                                "method": ""
        //                            }
        //                        }
        //                    }
        //                ]
        //            }
        //        }
        //    ]
        //},
        //{
        //    name : "Databases",
        //    icon : path.resolve(__dirname, '..', 'tmp'),
        //    dataSources : [
        //        {
        //            name : "MySQL",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : []
        //        },
        //        {
        //            name : "Mongo",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : []
        //        },
        //        {
        //            name : "Oracle",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : []
        //        },
        //        {
        //            name : "PostgreSQL",
        //            icon : path.resolve(__dirname, '..', 'tmp'),
        //            cont : []
        //        }
        //    ]
        //}
    ]
}

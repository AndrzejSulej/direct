/*
 * Base on 
 * http://webdribble.blogspot.com/2010/07/extdirect-gridpanel-w-connect-on-nodejs.html
 */

/**
 * Module dependencies.
 */

var Buffer = require('buffer').Buffer;

/**
 * Export the `setup()` function.
 */

exports = module.exports = directProvider;

/**
 * JSON-RPC version.
 */

var VERSION = exports.VERSION = '1.0';

/**
 * JSON parse error.
 */

var PARSE_ERROR = exports.PARSE_ERROR = -32700;

/**
 * Invalid request due to invalid or missing properties.
 */

var INVALID_REQUEST = exports.INVALID_REQUEST = -32600;

/**
 * Service method does not exist.
 */

var METHOD_NOT_FOUND = exports.METHOD_NOT_FOUND = -32601;

/**
 * Invalid parameters.
 */

var INVALID_PARAMS = exports.INVALID_PARAMS = -32602;

/**
 * Internal JSON-RPC error.
 */

var INTERNAL_ERROR = exports.INTERNAL_ERROR = -32603;

/**
 * Default error messages.
 */

var errorMessages = exports.errorMessages = {};
errorMessages[PARSE_ERROR] = 'Parse Error.';
errorMessages[INVALID_REQUEST] = 'Invalid Request.';
errorMessages[METHOD_NOT_FOUND] = 'Method Not Found.';
errorMessages[INVALID_PARAMS] = 'Invalid Params.';
errorMessages[INTERNAL_ERROR] = 'Internal Error.';

/**
 * Accepts any number of objects, exposing their methods.
 * 
 * @param {Object} ...
 * @return {Function}
 * @api public
 * 
 * Sposoby notacji controlera:
 * 1. services['action']['method']
 * 2. services['action.method']
 * 
 */

function directProvider(services) {
    services = services || {};
    // Merge methods
    for (var i = 0, len = arguments.length; i < len; ++i) {
        var args = arguments[i];
        Object.keys(args).forEach(function (key) {
        		var action = args[key];
        		Object.keys(action).forEach(function(method){
					services[key+'.'+method] = action[method];
            });
        });
    }        

    /**
     * Handle directProvider request.
     *
     * @param  {Object} rpc
     * @param  {Function} respond
     */

    function handleRequest(rpc, respond){
        if (validRequest(rpc)) {
            var method = services[rpc.action+'.'+rpc.method];
            if (typeof method === 'function') {
                var params = [];
                if (rpc.data instanceof Array) {
                    params = rpc.data;
                } else if (typeof rpc.data === 'object') {
                    var names = method.toString().match(/\((.*?)\)/)[1].match(/[\w]+/g);
                    if (names) {
                        for (var i = 0, len = names.length; i < len; ++i) {
                            params.push(rpc.data[names[i]]);
                        }
                    } else {
                        // Function does not have named parameters
                        return respond({ exception: { code: INVALID_PARAMS, message: 'This service does not support named parameters.' }});
                    }
                }
                var reply = function reply(err, result){
                    if (err) {
                        if (typeof err === 'number') {
                            respond({
								result: {
									success: false,
                                    code: err
                                }
                            });
                        } else {
                            respond({
								result: {success: false,
									code: err.code || INTERNAL_ERROR,
                                    message: err.message
                                }
                            });
                        }
                    } else {
                        respond({
                            result: result
                        });
                    }
                };
                method.apply(reply, params);
            } else {
                respond({ exception: { code: METHOD_NOT_FOUND }});
            }
        } else {
            respond({ exception: { code: INVALID_REQUEST }});
        }
    }

    return function directProvider(req, res, next) {
        var me = this;
       if (req.method === 'POST' && req.is('*/json')) {
           var rpc = req.body, //rec.body jest obiektem, bo jest ustawiony express.bodyParser()
               batch = rpc instanceof Array; //true/false

            /**
             * Normalize response object.
             */

            var normalize = function normalize(rpc, obj) {
				obj.type = 'rpc';
				if (validRequest(rpc)) {
					obj.tid = rpc.tid;
					obj.action = rpc.action;
					obj.method = rpc.method;
				}
                if (obj.error && !obj.error.message) {
                    obj.error.message = errorMessages[obj.error.code];
                }
                return obj;
            };

            /**
             * Respond with the given response object.
             */

            var respond = function respond(obj) {
                var body = JSON.stringify(obj);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                });
                res.end(body);
            };

            // Handle requests

            if (batch) {
                var responses = [],
                    len = rpc.length,
                    pending = len;
                for (var i = 0; i < len; ++i) {
                    (function(rpc){
                        handleRequest.call(me, rpc, function(obj){
                            responses.push(normalize(rpc, obj));
                            if (!--pending) {
                                //dopiero po ukończeniu wszystkich zapytań
                                respond(responses);
                            }
                        });
                    })(rpc[i]);
                }
            } else {
                handleRequest.call(me, rpc, function(obj){
                    respond(normalize(rpc, obj));
                });
            }
        } else {
            next();
        }
    };
}

/**
 * Check if the given request is a valid
 * Direct remote procedure call. 
 *
 *   - "type" must match 'rpc'
 *   - "tid" must be numeric
 *   - "action" must be a string
 *   - "method" must be a string
 *
 * @param  {Object} rpc
 * @return {Boolean}
 * @api private
 */

function validRequest(rpc){
    return rpc && rpc.type === 'rpc'
        && typeof rpc.tid === 'number'
		&& typeof rpc.action === 'string'
        && typeof rpc.method === 'string';
}

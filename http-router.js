var http      = require('http'),
    proxy     = require('http-proxy'),
    util      = require('util'),
    microtime = require('microtime');

var servers = ['10.0.0.152', '10.0.0.151', '10.0.0.150'];
var routing_table = [];

var server = proxy.createServer(function(req, res, proxy) {
	// A microsecond variable to track requests
	var mt = microtime.nowDouble().toString();

	// Get the client IP
	var ip = req.connection.remoteAddress;

	// Parse the requested host
	var host = req.headers.host.toLowerCase();

	if(host.indexOf(':')>0)
		host = host.substr(0, host.indexOf(':'));


	// Log request
	_log('incoming', mt, ip, req.headers.host, req.url);


	// Check the routing table
	for(var i in routing_table)
		if(routing_table[i].host==host) {
			_log('proxy', mt, ip, req.headers.host, req.url, routing_table[i].server);
			
			proxy.proxyRequest(req, res, {
				host: routing_table[i].server,
				port: 80
			});

			return;
		}


	// Find the host server
	for(var i in servers) {
		_log('attempt', mt, ip, req.headers.host, req.url, servers[i]);

		var http_req = http.get({
			host: servers[i],
			port: 80,
			path: '/',
			headers: {
				'Host': req.headers.host,
				'X-HTTP-Router-Server': servers[i],
				'X-HTTP-Router-Microtime': mt,
				'X-HTTP-Router-ClientIP': ip,
				'X-HTTP-Router-URL': req.url
			}
		}, function(http_res) {
			var host = this._headers['host'];
			var server = this._headers['x-http-router-server'];
			var mt = this._headers['x-http-router-microtime'];
			var ip = this._headers['x-http-router-clientip'];
			var url = this._headers['x-http-router-url'];

			_log('status_code', mt, ip, host, url, server+' '+http_res.statusCode);

			if(http_res.statusCode<500) {
				_log('proxy', mt, ip, host, url, server);

				// Add it to the routing table
				routing_table.push({
					'host': host,
					'server': server
				});

				proxy.proxyRequest(req, res, {
					host: server,
					port: 80
				});
			}

			http_res.on('data', function(chunk) {});
		});
	}
});


function _log(cat, mt, ip, host, url, msg) {
	cat = '['+cat+']';

	util.log([mt, cat, ip, host, url, msg].join(' '));
}


server.listen(8080);

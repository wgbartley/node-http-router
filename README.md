node-http-router
================
A simple HTTP proxy server that searches a list of servers for the first one that will answer to a host header with a status of less than 500.

_Host servers should be configured to return a 500+ error if they do not own a site with requested host headers!_


Requirements
------------
* Node.JS microtime - <code>npm install microtime</code>
* [Node.JS http-proxy](https://github.com/nodejitsu/node-http-proxy)


Recommended
-----------
* Node.JS Supervisor - <code>npm install -g supervisor</code>


Run
---
<code>supervisor http-router.js >> logs/access_log</code>

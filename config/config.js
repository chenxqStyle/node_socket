(function() {
    function Config() {
        let socketIo = require('socket.io');
        let express = require('express');
        let httpPort = 7890;
        let app = express();
        app.get('/getData', function() {
            console.log('接收到请求啦 111111')
        })
        let server = require('http').createServer(app);
        // request-promise http同步请求 
        let rp = require('request-promise');
        let io = socketIo(server);

        //设置端口号
        this.setPort = function(port) {
            httpPort = port;
            return port;
        }
        // 返回Socket对象
        this.IO = function() {
            return io
        }
        //打开node服务
        this.openServer = function() {
            server.listen(httpPort, function() {
                console.log(httpPort + '已经打开了')
            })
        }
        this.clienRqueset = function(type, uri, data) {
            data.pid = 'x951k8wEQfd125TtoK';

            let options = null;
            if (type !== 'post') {
                options = {
                    uri: uri,
                    qs: data,
                    headers: {
                        'User-Agent': 'Request-Promise'
                    },
                    json: true
                };
            } else {
                console.log('post请求数据')

                options = {
                    method: 'post',
                    uri: uri,
                    body: data,
                    json: true
                };
            }
            var rPromise = rp(options);
            return rPromise;
        }

    }

    module.exports = Config;
}())
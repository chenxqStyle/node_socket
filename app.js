// 引入配置模块
let Config = require('./config/config');
let configObj = new Config()
let io = configObj.IO();

io.on('connection', function(socket) {

    console.log("socket-ID是：" + socket.id)


    //1. 向another room广播一个事件，在此房间所有客户端都会收到消息//注意：和上面对比，这里是从服务器的角度来提交事件
    //  socket.broadcast.to('my room').emit('event_name', data);}
    //	//2. 向所有客户端广播
    //  io.sockets.in('another room').emit('event_name', data);  
    //  io.sockets.emit('event_name', data);  

    // 接受登陆人员数据(房间信息，在线状态),存储浏览器ID
    socket.on('save browserID', function(data) {
        var uri = 'https://route.showapi.com/341-1';
        var parameter = {
                'maxResult': '20',
                'page': '1',
                'showapi_appid': '44365',
                'showapi_sign': '232d8daf6c8a42729857797064a458e9'
            }
            //模拟客户端发动请求 /存储浏览器ID
            // 任何一位当事人上线，都会将Socket.ID存储在 数据库中，并返回全部的socket.ID 发送给所有房间成员;
        configObj.clienRqueset('get', uri, parameter)
            .then(function(data) {
                console.log('请求道数据啦')
                console.log(data.showapi_res_body.contentlist);
                io.emit(ID, 'receive roomData', data)
            }).catch(function(err) {
                console.log(err)
            });
    })


    socket.on('setID', function(name) {
        console.log('房间名 ' + name);

    });

    io.emit('set browserId', socket.id);
    socket.on('disconnect', function() {
        console.log('用户关闭了呢');
    });

    socket.on('sendImage', function(imsrc) {
        console.log('接受到图片路径: ' + imsrc);
        io.emit('receive image', imsrc);
    });

    socket.on('sendCanvas', function(x, y) {
        //		console.log('正在传输: ',x,y);
        io.emit('receive canvas', x, y);
    });
    socket.on('socketObj', function(obj) {

        io.emit('receive canvasObj', obj);
    })

    socket.on('moveTo', function(x, y) {
        io.emit('receive moveTo', x, y)
    })
});
//server.listen(httpPort); //用server连接 
configObj.openServer()
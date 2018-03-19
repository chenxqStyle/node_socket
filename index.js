// 引入配置模块
let Config = require('./config/config');
let configObj = new Config();
let io = configObj.IO();
var moment = require('moment');

/**
     * roomInfo
      	{	roomId:[{
				userName:'',
				userId:'',
				type: '',
	    		socket_id: '',
	    		userList: '',
	    		ishd:false
      		},{}]
      	}
     */
var roomInfo = {};

io.on('connection', function(socket) {
    // ***('链接了')
    var roomId = '';
    var user = '';
    var ISEND = 0;
    // 加入房间  ();
    socket.on('join', function(joindata) {
        /**
         * 	joindata
         * 	{
          		channel:"59",
				socket_id:"",
				type:1,
				userName:"季春燕",
				user_id:"65",
         * 	}
    	 */
        // 设置socketid 传给接口 存储
        var userData = joindata;
        roomId = userData.channel;
        user = userData.userName;
        // 将来人放入到频道 首先 需要检测有没有改房间
        if (!roomInfo[roomId]) {
            roomInfo[roomId] = [];
        } else {
            // 将登录人的信息放入数组 防止页面卡死 多次点击开始 触发加入房间 检测user_id
            for (var i = 0; i < roomInfo[roomId].length; i++) {
                if (roomInfo[roomId][i].role_id == userData.role_id) {
                    socket.join(roomId);
                    io.to(roomId).emit("receive message", roomInfo[roomId], state);
                    return;
                }
            }
        }

        var data = {};
        data.socket_id = socket.id
        data.userName = userData.userName
        data.role_id = userData.role_id
        data.type = userData.type
        data.ishd = false
        roomInfo[roomId].push(data)

        console.log('加入房间的信息：', roomInfo[roomId]);

        // var status = 200;
        var state = 'success';
        // roomInfo[roomId] 返回的就是在线人数 人员的 对象 数组

        console.log(new Date() + '新人 ' + userData.userName + '加入了' + roomId + "房间，socket_id:" + socket.id)
        socket.join(roomId);
        io.to(roomId).emit("receive message", roomInfo[roomId], state);
    })

    //白板分享图片调用
    socket.on('send canvasUrl', function(socketMessage, canvasUrl) {

        var userId = roomInfo.userId;
        // console.log('接收分享图片参数', socketMessage)
        // console.log('接收分享图片路径', canvasUrl)
        io.to(roomId).emit('receive canvasUrl', canvasUrl, socketMessage); // return;
    });

    // 法官点击下一步进入主流程 当事人端显示参与互动按钮
    socket.on('send showJion', function(data) {
        // console.log(data.mediatorName + "法官进入调解白板界面,房间号：" + roomId);
        io.to(roomId).emit('receive showJion', data);
    })

    //法官上传材料通知房间里面所有的成员
    socket.on('send upData', function(socketMessage) {
        // console.log('法官上传材料信息：', socketMessage)
        var message = user + '上传新材料更新数据了';
        socketMessage.message = message;
        io.to(roomId).emit('receive upData', socketMessage);
    });

    // 将法官的白板移动路径听不到当事人
    socket.on('send canvas', function(socketMessage, placeObj) {
        // console.log('路径分享', socketMessage)
        var message = user + '在分享路径';
        placeObj.message = message;
        io.to(roomId).emit('receive canvas', placeObj, socketMessage);
    });

    /*	//当事人端同步canvas到法官白板
    	socket.on('send UserCanvas', function(roomId, placeObj) {
    		var message = user + '：在分享路径';
    		console.log("当事人:"+message +':'+ roomId)
    		placeObj.message = message;
    		io.to(roomId).emit('receive UserCanvas', placeObj);
    	});*/

    // 鼠标松开存储白板历史纪录
    socket.on('send up', function(socketMessage) {
        var message = user + '：鼠标松开了';
        // console.log(message);
        io.to(roomId).emit('receive up', message);
    })

    // 解决 vue watch 不到vuex里面图片数组变化的问题
    socket.on('update imgArr', function(socketMessage) {
        // console.log('收到信息，更新分享图片数组')
        io.to(roomId).emit('update imgArr');
    })

    // 撤销分享
    socket.on('send cancel', function(socketMessage) {
        var message = user + '：撤销啦';
        socketMessage.message = message;
        // console.log(message);
        io.to(roomId).emit('receive cancel', socketMessage);
    })

    //当事人撤销了
    socket.on('send UserCancel', function(roomId) {
        var message = user + '：撤销啦';
        // console.log(message);
        io.to(roomId).emit('receive UserCancel', message);
    })
    // 清屏
    socket.on('send clearBoard', function(socketMessage) {
        var message = user + '：清屏啦';
        socketMessage.message = message;
        // console.log(message);
        io.to(roomId).emit('receive clearBoard', socketMessage);
    })

    // 切换颜色
    socket.on('send colorAction', function(socketMessage, value) {
        var message = user + '设置画笔颜色：' + value;
        // console.log(message);
        var data = {
            message,
            value
        }
        io.to(roomId).emit('receive colorAction', data);
    })

    //橡皮擦
    socket.on('send rubberAction', function(socketMessage, value) {
        var message = user + '设置橡皮擦大小：' + value;
        // console.log(message);
        var data = {
            message,
            value
        }
        io.to(roomId).emit('receive rubberAction', data);
    })

    //切换画笔大小
    socket.on('send fontAction', function(socketMessage, value) {
        var message = user + '设置画笔大小：' + value;
        var data = {
            message,
            value
        }
        io.to(roomId).emit('receive fontAction', data);
    })

    //当事人申请加入互动
    socket.on('jion session', function(socketMessage) {
        var message = user + '申请加入互动,是否同意?';
        console.log(message);
        socketMessage.message = message;
        io.to(roomId).emit('receive sessions', socketMessage);
    })
    //当事人申请退出
    /*out session*/
    socket.on('out session', function(socketMessage) {
        var message = user + '已退出互动';
        console.log(message);
        socketMessage.message = message;
        io.to(roomId).emit('receive outSessions', socketMessage);
    })
    // 法官同意
    socket.on('agree session', function(socketMessage) {
        var message = user + '法官同意您加入互动';
        console.log(message);
        socketMessage.message = message;
        io.to(roomId).emit('receive agree', socketMessage);
    })

    // 法官拒绝
    socket.on('refuse session', function(socketMessage) {
        var message = user + '法官拒绝您加入互动';
        console.log(message);
        socketMessage.message = message;
        io.to(roomId).emit('receive refuse', socketMessage);
    })


    //发送调解状态
    socket.on('mediate state', function(socketData) {
        var mediateState = socketData.mediateState;
        //***("案件Id为:" + caseId + ',房间号：' + roomId + '，状态为：' + mediateState);
        console.log('调解改变为:', mediateState)
        var stateData = {
            state: mediateState,
            data: socketData.userList
        }
        io.to(roomId).emit("receive mediateState", stateData);
    });

    socket.on('sendImage', function(imsrc) {
        //***('接受到图片路径: ' + imsrc);
        console.log('获取协议，准备签字：', imsrc)
        io.emit('receive image', imsrc);
    });

    socket.on('send signOk', function(roomData) {
        console.log('提交签字~', roomData);
        io.to(roomId).emit("receive signOk", roomData);
    })

    // 监听可以关闭并且不需要发送信息到房间
    socket.on('caseEnd', function() {
        console.log('设置全局的表示结束案件')
        ISEND = 1
    })

    //关闭连接--------------------
    socket.on('disconnect', function() {
        var message = '下线信息： ' + roomId + ' 号房间的 ' + user + ' 下线,isEnd:'+ISEND;
        console.log(new Date() + "::" + message)
        var state = 'out';
        // 删除下线人员
        let data = roomInfo[roomId];
        try {
            for (let i = 0; i < data.length; i++) {
                if (data[i].userName == user) {
                    roomInfo[roomId].splice(i, 1);
                }
            }
        } catch (err) {
            console.log('删除人员出错,人员列表为：', roomInfo[roomId])
        }

        if (ISEND == 1) {
            console.log('人员主动下线传递数据到页面：', roomInfo[roomId])
        } else {
            console.log('人员意外下线传递数据到页面：', roomInfo[roomId])
            io.to(roomId).emit("receive message", roomInfo[roomId], state, user);
        }
    });

    /****************以下是xchat通信的内容*************/
    socket.on('send pid', function(data) {
        //***('正在分享评估报告--- pid');
        //***(data);
        var roomId = data.roomId;
        var pid = data.pid;
        if (!roomId || !pid) {
            //***('参数传输错误,无法分享');
            //***(data)
        } else {
            io.to(roomId).emit("receive pid", pid);
        }
    })

    socket.on('send setState', function(data) {
        //***('正在重置评估报告--- pid');
        //***(data);
        var roomId = data.roomId;
        if (!roomId) {
            //***('参数传输错误,无法分享');
            //***(data)
        } else {
            io.to(roomId).emit("receive setState");
        }
    })

    /*****************************************************/


})

// 接受登陆人员数据(房间信息，在线状态),存储浏览器ID

//server.listen(httpPort); //用server连接 
configObj.openServer()
// 引入配置模块
let Config = require('./config/config');
let configObj = new Config();
let io = configObj.IO();
var moment = require('moment');
//var reqUrl = "http://192.168.1.164/interface/conciliation_solution";
var reqUrl = "http://106.15.131.237/interface/conciliation_solution/"
var otherReqUrl = "http://118.190.64.87/resources/conciliation_solution/" 
//9/30var reqUrl =  'http://106.15.131.237/interface/conciliation_solution/' 

io.on('connection', function(socket) {
	
	var roomInfo = {};
	//***('链接了')
	//加入房间
	socket.on('join', function(userData) {
		userData.socket_id = socket.id;
		var socket_id = socket.id;
		var roomId = userData.channel + "";
		var userName = userData.userName;
		var userId = userData.user_id;
		var type = userData.type;
		console.log('新人 ' + userName + '加入了' + roomId + "房间，socket_id" + userData.socket_id)
		roomInfo.roomId = roomId;
		roomInfo.userName = userName;
		roomInfo.userId = userId;
		roomInfo.type = type;
		roomInfo.socket_id = socket_id;
		var uri = reqUrl + '/save_socket_id.php';
		var parameter = userData;
		//模拟客户端发动请求 /存储浏览器ID
		//***('userData============');
		// 任何一位当事人上线，都会将Socket.ID存储在 数据库中，并返回全部的socket.ID 发送给所有房间成员;
		
		configObj.clienRqueset('post', uri, parameter)
			.then(function(data) {
				//***(userName + ':请求道数据啦')
				socket.join(roomId);
				console.log('服务返回数据如下：', data.data.user_list);
				var uesrList;
				var status = 200;
				var state = 'success';
				var resData = {
					userList: uesrList,
					message: userName + '上线啦',
					status: status,
					state: 'jion',
					resData:data
				}
				if(!data.data) {
					var state = 'error';
					resData.uesrList = false;
					resData.status = 404;
					resData.message = '错误原因：save_socket_id.php';
					console.log(resData);
					console.log(data);
					if(data.info) {
						resData.message = data.info;
					}
					resData.errors = data;
					io.sockets.sockets[socket_id].emit("receive message", resData, state);
				} else {
					//***('房间数据获取成功，即将通知客户端上线啦！')
					resData.userList = data.data.user_list;
					io.to(roomId).emit("receive message", resData, state);
				}
				// socketID存储成功 开始加入房间
				//***('返回数据如下：');
				//***(resData);

			}).catch(function(err) {
			
				var data = {
					uesrList: null,
					status: 404,
					message: "err错误原因：save_socket_id.php"
				}
				console.log(data);
				console.log(err)
				io.to(roomId).emit("receive message", data, 'error');
				//***('错误了');
				//***(err);
			});
	})
	
	//同步白板
	socket.on('send canvasUrl', function(socketMessage, canvasUrl) {
		//***('正在發送房間數據結構：' + roomId);
		var {roomId} = socketMessage; 
		
		var uri = otherReqUrl + '/save_socket_img.php';
		var userId = roomInfo.userId;
		console.log(socketMessage)
		var parameter = {
			user_id: userId,
			channel: roomId,
			file_content: canvasUrl
		}
		console.log(canvasUrl)
		io.to(roomId).emit('receive canvasUrl', canvasUrl,socketMessage);// return;
		
//		configObj.clienRqueset('post', uri, parameter)
//			.then(function(data) {
//				console.log('base64存储成功了呢',data);
//				
//			}).catch(function(err) {
//				console.log('base64存储错误',err);
//			});
	});
	
	
	// 法官点击下一步进入主流程 当事人端显示参与互动按钮
	socket.on('send showJion',function(data){
//		console.log(data)
//		console.log(data.mediatorName+"法官进入调解白板界面,房间号："+data.roomId);
		var {roomId} = data;
		io.to(roomId).emit('receive showJion', data);
	})
		
	//法官上传材料通知房间里面所有的成员
	
	socket.on('send upData', function(socketMessage) {
		console.log(socketMessage)
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '：上传新材料更新数据了';
		console.log(message +':'+ roomId);
		socketMessage.message = message;
		io.to(roomId).emit('receive upData',socketMessage);
	});
		
	// 法官数据数据移动同步白板路径
	socket.on('send canvas', function(socketMessage, placeObj) {
		console.log(socketMessage)
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '：在分享路径';
		console.log(message +':'+ roomId)
		placeObj.message = message;
		io.to(roomId).emit('receive canvas', placeObj,socketMessage);
	});
	
/*	//当事人端同步canvas到法官白板
	socket.on('send UserCanvas', function(roomId, placeObj) {
		var message = roomInfo.userName + '：在分享路径';
		console.log("当事人:"+message +':'+ roomId)
		placeObj.message = message;
		io.to(roomId).emit('receive UserCanvas', placeObj);
	});*/

	// 鼠标松开存储白板历史纪录
	socket.on('send up', function(socketMessage) {
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '：鼠标松开了';
		console.log(message);
		io.to(roomId).emit('receive up', message);
	})

	// 撤销分享
	socket.on('send cancel', function(socketMessage) {
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '：撤销啦';
		socketMessage.message = message;
		console.log(message);
		io.to(roomId).emit('receive cancel',socketMessage);
	})
	
	//当事人撤销了
	socket.on('send UserCancel', function(roomId) {
		var message = roomInfo.userName + '：撤销啦';
		console.log(message);
		io.to(roomId).emit('receive UserCancel',message);
	})
	// 清屏
	socket.on('send clearBoard', function(socketMessage) {
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '：清屏啦';
		socketMessage.message = message;
		console.log(message);
		io.to(roomId).emit('receive clearBoard',socketMessage);
	})
	
	// 切换颜色
	socket.on('send colorAction', function(socketMessage,value) {
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '设置画笔颜色：'+value;
		console.log(message);
		var data = {
			message,
			value
		}
		io.to(roomId).emit('receive colorAction',data);
	})
	
	//橡皮擦
	socket.on('send rubberAction', function(socketMessage,value) {
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '设置橡皮擦大小：'+value;
		console.log(message);
		var data = {
			message,
			value
		}
		io.to(roomId).emit('receive rubberAction',data);
	})
	
	//切换画笔大小
	socket.on('send fontAction', function(socketMessage,value) {
		var {roomId} = socketMessage;
		var message = roomInfo.userName + '设置画笔大小：'+value;
		console.log(message);
		var data = {
			message,
			value
		}
		io.to(roomId).emit('receive fontAction',data);
	})
	
	//当事人申请加入互动
	socket.on('jion session', function(socketMessage) {
		var message = roomInfo.userName + '申请加入互动,是否同意?';
		console.log(message);
		var roomId = socketMessage.roomId;
		socketMessage.message = message;
		console.log(socketMessage);
		io.to(roomId).emit('receive sessions',socketMessage);
	})
	//当事人申请退出
	/*out session*/
	socket.on('out session', function(socketMessage) {
		var message = roomInfo.userName + '已退出互动';
		console.log(message);
		var roomId = socketMessage.roomId;
		socketMessage.message = message;
		console.log(socketMessage);
		io.to(roomId).emit('receive outSessions',socketMessage);
	})
	// 法官同意
	socket.on('agree session', function(socketMessage) {
		var roomId = socketMessage.roomId;
		var message = roomInfo.userName + '法官同意您加入互动';
		console.log(message);
		socketMessage.message = message;
		console.log(socketMessage);
		io.to(roomId).emit('receive agree',socketMessage);
	})
	
	// 法官拒绝
	
	socket.on('refuse session', function(socketMessage) {
		var roomId = socketMessage.roomId;
		var message = roomInfo.userName + '法官拒绝您加入互动';
		console.log(message);
		socketMessage.message = message;
		console.log(socketMessage);
		io.to(roomId).emit('receive refuse',socketMessage);
	})
	
	//关闭连接--------------------
	socket.on('disconnect', function() {
		var message = roomInfo.userName + '下线啦'
		console.log(message);
		if(roomInfo.roomId == undefined) {
			return;
		}
		//***(message);
		var roomId = roomInfo.roomId;
		var uri = reqUrl + 　'/del_socket_id.php';
		var parameter = {
			channel: roomInfo.roomId,
			user_id: roomInfo.userId,
			type: roomInfo.type
		};
		var userList = null;

		//下线清除状态 --------------------
		//***(parameter)
		configObj.clienRqueset('post', uri, parameter)
			.then(function(data) {
				var uesrList;
				var status = 200;
				var state = 'success';
				var resData = {
					userList: uesrList,
					message: message,
					status: status,
					state: 'out'
				}
				//***('下线服务返回数据:', data)
				if(!data.data) {
					var state = 'error';
					resData.userList = false;
					resData.status = 404;
					resData.message = message + '下线错误！404';
					//***(resData.message)
					if(data.info) {
						resData.message = data.info;
					}
					resData.errors = data;
					io.to(roomId).emit("receive message", resData, state);
					//					io.sockets.sockets[roomInfo.socket_id].emit("receive message", resData, state);
				} else {
					//***(+'下线成功，即将通知客户端下线啦！')
					resData.userList = data.data.user_list;
					io.to(roomId).emit("receive message", resData, state);
				}

			}).catch(function(err) {
				//***('下线错误了', err)
				var resData = {
					userList: false,
					status: 404,
					message: "下线错误！404"
				}
				io.sockets.sockets[roomInfo.socket_id].emit("receive message", resData, 'error');
			});

	});

	//发送调解状态
	socket.on('mediate state', function(roomData) {
		var roomId = roomData.roomId;
		var mediateState = roomData.mediateState;
		var caseId = roomData.caseId;
		//***("案件Id为:" + caseId + ',房间号：' + roomId + '，状态为：' + mediateState);

		var parameter = {
			case_id: caseId,
			channel_id: roomId
		}
		var stateData = {
			state: mediateState,
			data: null
		}
		var uri = reqUrl + '/mediator/get_agreement_content.php';
		var parameter = {
			case_id: caseId,
			channel_id: roomId
		}
		//***(uri)
		//***(parameter)
		if(mediateState == 1) {

			configObj.clienRqueset('post', uri, parameter)
				.then(function(data) {
					//***("同意调解了,正在打印调解协议书")
					//			 	//***(data)
					stateData.data = data;
					io.to(roomId).emit("receive mediateState", stateData);
				}).catch(function(err) {
					//***('下线错误了')
					//***(err)
				});

		} else {
			io.to(roomId).emit("receive mediateState", stateData);
		}

	});
	socket.on('sendImage', function(imsrc) {
		//***('接受到图片路径: ' + imsrc);
		io.emit('receive image', imsrc);
	});

	socket.on('setID', function(name) {
		//***('房间名 ' + name);
	});

	socket.on('send signUrl', function(roomId, signUrl) {
		//***('正在签字 :' + roomId);
		io.to(roomId).emit("receive signUrl", signUrl);
	});

	socket.on('send signOk', function(roomData) {
		console.log('提交签字~');
		var timedate = new Date()
		console.log('接受到时间--:'+moment(timedate).format('YYYY-MM-DD HH:mm:ss'))
		var userName = roomData.userName;
		var roomId = roomData.roomId;
		var userId = roomData.userId;
		var dataURL = roomData.dataURL;
		var role = roomData.role;
		var caseId = roomData.caseId;
		var message = userName + "提交签字了";
		var uri = otherReqUrl + '/submit_signature.php';
		var fsr = roomData.fsr;
		//***(uri)
		var parameter = {
			channel_id: roomId,
			user_id: userId,
			image: dataURL,
			role: role,
			case_id: caseId
		} 
		//***('caseId', parameter.case_id)
		configObj.clienRqueset('post', uri, parameter)
			.then(function(data) {
				var timedate = new Date()
				console.log('提交签字返回数据:'+moment(timedate).format('YYYY-MM-DD HH:mm:ss'))
				console.log(userName + '提交签字返回数据了,' + roomId);
				console.log(uri)
				//***(data)
				data.fsr = fsr;
				console.log(data);
				io.to(roomId).emit("receive signOk", data);
			}).catch(function(err) {
				console.log('修改签名状态失败:'+uri,err)
				
				//***(err)
			});
	})
	socket.on('send pid', function(data) {
		//***('正在分享评估报告--- pid');
		//***(data);
		var roomId = data.roomId;
		var pid = data.pid;
		if(!roomId || !pid) {
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
		if(!roomId) {
			//***('参数传输错误,无法分享');
			//***(data)
		} else {
			io.to(roomId).emit("receive setState");
		}
	})
	
})

// 接受登陆人员数据(房间信息，在线状态),存储浏览器ID

//server.listen(httpPort); //用server连接 
configObj.openServer()
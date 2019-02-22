//敏感数据路径图
$(function() {
    var myAction = {},
        rootsMap = {},
        taskInfo, knowledgid = "";
    var socket;
    var simulate = false;  //设置为true即走模拟数据

    var pID = [];

    $.extend(myAction, {
        initData: function() {
            var ps = myAction.parseQueryString(location.href);
            taskInfo = ps.taskid;
            knowledgeid = ps.knowledge_id;
            if (taskInfo && knowledgeid && knowledgeid !== 'undefined') {
                socket = io("ws://"+"/vackbot");
                if (location.href.indexOf('localhost') >= 0) {
                    socket = io("ws://10.10.10.53/vackbot");
                }   
                myAction.initSocket();             
            }
        },
        initSocket: function() {           
            if (socket.connected) {
                socket.on("push_path", function(data) {
                    if (!data || !data.data || data.data.length == 0) {
                        return;
                    }
                    if (!simulate) {
                        myAction.buildData(data);
                    }
                });
                if (taskInfo && knowledgeid && knowledgeid !== 'undefined') {
                    socket.emit("get_path", { data: "root", task_id: taskInfo, knowledge_id: knowledgeid });
                }
            } else {
                setTimeout(myAction.initSocket, 500);
            }            
        },
        simulateData: function () {
            var data = {
                "message": "success",
                "code": 200,
                "data": [{
                    "origin": "a29d1bf50df5595a74a51f9734c37c86",
                    "showinfo": "http://target.theworkpc.com:1088/vackbot.php",
                    "type": "vulnerability",
                    "knowledge": "3429ea58b391a1578e18666c393bbcbb"
                }, {
                    "origin": "d6b94dcaba47c9ef0eaa973c2eb70224",
                    "showinfo": "http://target.theworkpc.com:1088/vackbot.php",
                    "type": "webshell",
                    "knowledge": "a29d1bf50df5595a74a51f9734c37c86"
                }, {
                    "origin": "6e80b31b4027ecaf95b56c16d8146877",
                    "showinfo": "target.theworkpc.com",
                    "type": "vulnerability",
                    "knowledge": "d6b94dcaba47c9ef0eaa973c2eb70224"
                }, {
                    "origin": "10428fcb52ea596fc82087a2a263869f",
                    "showinfo": "http://target.theworkpc.com:1088",
                    "type": "domain",
                    "knowledge": "6e80b31b4027ecaf95b56c16d8146877"
                }, {
                    "origin": "2c043678-76fc-11e8-a400-005056b63d2b",
                    "showinfo": "target.theworkpc.com:1088",
                    "type": "domain",
                    "knowledge": "10428fcb52ea596fc82087a2a263869f"
                }, {
                    "origin": null,
                    "showinfo": "None",
                    "type": "2c043678-76fc-11e8-a400-005056b63d2b",
                    "knowledge": "2c043678-76fc-11e8-a400-005056b63d2b"
                }]
            };                
            myAction.buildData(data);
        },
        autoAddNode: function() {
            var newNodeMap = gMyAction.newNodeMap;
            for (m in newNodeMap) {
                if (newNodeMap.hasOwnProperty(m) && newNodeMap[m]) {
                    var i = Math.ceil(Math.random() * 10);
                    if (i > 5 && m != "548asdf8754224sd56468sad4f68sad") {
                        newNodeMap[m] = 0;
                        socket.emit("getNodes", { data: m });
                        break;
                    }
                }
            }
            setTimeout(myAction.autoAddNode, 800);
        },
        newImg: function(id, start) {
            if (!gMyAction.initialized) {
                gMyAction.makeNetwork();
            }
            var startID = id;
            gMyAction.startpages = [startID];
            tracenodes = [];
            traceedges = [];
            gMyAction.newNodeMap[id] = 1;
            gMyAction.nodes = new vis.DataSet([{
                    id: startID,
                    value: 2,
                    group: "root",
                    level: 0,
                    x: 0,
                    y: 0,
                    parent: startID,
                    label: start,
                    title: myAction.initRootNodeTitle({ root: start })
                }
            ]);
            gMyAction.edges = new vis.DataSet();
            data = { nodes: gMyAction.nodes, edges: gMyAction.edges };
            setTimeout(function() {
                gMyAction.network.moveTo({ scale: 0.5 })
            }, 100);
            gMyAction.network.setData(data);
        },
        initRootNodeTitle: function(data) {
            var html = '';
            html = '<div><div class="m-edge-tooltip-title">' + data.root + '</div></div>';
            return html;
        },
        parseQueryString: function(url) {
            var params = {};
            var arr = url.split("?");
            if (arr.length <= 1) {
                return params;
            }
            arr = arr[1].split("&");
            for (var i = 0, l = arr.length; i < l; i++) {
                var a = arr[i].split("=");
                params[a[0]] = decodeURIComponent(a[1]);
            }
            return params;
        },
        getInfoByPid: function(pid, data) {
            var ret = [],
                i = 0,
                len = data.length;
            for (i; i < len; i++) {
                var model = data[i];
                if (pid == "root") {
                    data[i].data = data[i].showinfo;
                    data[i].id = data[i].knowledge;
                }
                if (pid == "root" && !model.origin) {
                    ret.push(data[i]);
                }
                if (pid == model.origin) {
                    ret.push(data[i]);
                }
            }
            return ret;
        },
        buildData: function(data) {
            var root = [];
            if (data.code != 200) {
                console.log("错误");
                return;
            }
            data = data.data;
            modelsPush = data;
            root = myAction.getInfoByPid("root", data);
            var i = 0,
                len = root.length;
            for (i; i < len; i++) {
                myAction.newImg(root[i].knowledge, "vackbot");
                pID.push({ id: root[i].knowledge, data: myAction.getInfoByPid(root[i].knowledge, modelsPush) });
            }
            setTimeout(function() {
                myAction.autoAddNext();
            }, 300);
        },
        autoAddNext: function() {
            var i = 0,
                ret = [],
                len = pID.length;
            for (i; i < len; i++) {
                var model = pID[i];
                gMyAction.drawSensitiveNodes(model.id, model.data);
            }
            i = 0;
            for (i; i < len; i++) {
                var models = pID[i].data,
                    j = 0,
                    lenj = models.length;
                for (j; j < lenj; j++) {
                    ret.push({ id: models[j].id, data: myAction.getInfoByPid(models[j].id, modelsPush) });
                }
            }
            pID = ret;
            if (pID.length == 0) {
                return;
            }
            setTimeout(function() {
                myAction.autoAddNext();
            }, 600)
        }
    });

    var init = function() {
        myAction.initData();
        if (simulate) {
            myAction.simulateData();
        }
    }();
});
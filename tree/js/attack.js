//攻击路径图 
$(function() {
    var myAction = {}, socket, rootsMap = {}, myTaskid, autoAddNodeInterval;
    var simulate = true;  //设置为true即走模拟数据
      
    $.extend(myAction, {
        initSocket: function () {
            var ps = myAction.parseQueryString(window.location.href);
            myTaskid = ps.taskid;
            if (myTaskid || window.location.href.indexOf('big') >=0 || window.location.href.indexOf('vackbot') >= 0) {
                if (window.location.href.indexOf('localhost') >= 0) {
                    socket = io("ws://10.10.10.53/vackbot");
                } else {
                    socket = io("ws://"+"/vackbot");
                }   
            }
        },
        setSocketPush: function () {            
            if (socket.connected) {
                socket.on("nodePush", function(data) {
                    if (!simulate) {
                        myAction.nodePushFn(data);
                    }
                });
            } else {
                setTimeout(myAction.setSocketPush, 500);
            }                     
        },
        attack: function (taskid) {
            if (socket.connected) {
                if (taskid) {
                    var opData = { data: "root", taskid: taskid };
                    socket.emit("getRoot", opData);
                    socket.emit("getUpdateNodes", opData);   
                }                 
            } else {
                setTimeout(function () {
                    myAction.attack(taskid);
                }, 500);
            }
        },        
        nodePushFn: function (data) {
            if (!data || !data.data || data.data.length == 0) {
                return;
            }
            var j = 0,
                len = data.data.length,
                rootData = [];
            for (j = 0; j < len; j++) {
                if (data.data[j].origin_knowledge == "NULL") {
                    rootData.push(data.data[j]);
                    rootsMap[data.data[j].id] = 1
                }
            }
            if (rootData.length > 0) {
                gMyAction.LegendeStop = false;
                myAction.buildRootNode(rootData[0].id);
                myAction.autoAddNode();
            }
            var ret = [],
                d = data.data;
            for (var i = 0; i < d.length; i++) {
                var model = d[i];
                if (rootsMap[model.id]) {
                    continue;
                }
                if (gMyAction.newNodeMap[model.id]) {
                    continue;
                }
                ret.push({ id: model.id, data: model.showinfo, type: model.type });
            }
            gMyAction.drawAttackNodes(data.data[0].origin_knowledge, ret);
        },
        simulateData: function () {
            var data = {
                "data": [{
                    "showinfo": "未知攻击",
                    "origin_knowledge": "NULL",
                    "is_root": true,
                    "associat_knowledge": [],
                    "type": "ded3e010-7985-11e8-91dd-000c298b6660",
                    "id": "ded3e010-7985-11e8-91dd-000c298b6660"
                }]
            };   
            var data2 = {
                "message": "获取成功",
                "code": 200,
                "data": [{
                    "associat_knowledge": [],
                    "showinfo": "DOMAIN:10.10.10.164:80",
                    "type": "domain",
                    "id": "3eee3e83c7b331f67365784900d7ae49",
                    "origin_knowledge": "ded3e010-7985-11e8-91dd-000c298b6660"
                }, {
                    "associat_knowledge": [],
                    "showinfo": "DOMAIN:10.10.10.168:8084",
                    "type": "ip",
                    "id": "8b092e8c3a31acf128f9751d565f6b2d",
                    "origin_knowledge": "ded3e010-7985-11e8-91dd-000c298b6660"
                }, {
                    "associat_knowledge": [],
                    "showinfo": "DOMAIN:10.10.10.166:80",
                    "type": "port",
                    "id": "47e77a5c6367c8ed3feb99c59311e7f9",
                    "origin_knowledge": "ded3e010-7985-11e8-91dd-000c298b6660"
                }, {
                    "associat_knowledge": [],
                    "showinfo": "DOMAIN:10.10.10.104:80",
                    "type": "domain",
                    "id": "631262311a79a67ad03e9880ce6618bd",
                    "origin_knowledge": "ded3e010-7985-11e8-91dd-000c298b6660"
                }]
            };

            var data3 = {
                "message": "获取成功",
                "code": 200,
                "data": [{
                    "associat_knowledge": [],
                    "showinfo": "1",
                    "type": "ip",
                    "id": "1",
                    "origin_knowledge": "3eee3e83c7b331f67365784900d7ae49"
                }, {
                    "associat_knowledge": [],
                    "showinfo": "2",
                    "type": "port",
                    "id": "2",
                    "origin_knowledge": "3eee3e83c7b331f67365784900d7ae49"
                }, {
                    "associat_knowledge": [],
                    "showinfo": "3",
                    "type": "url",
                    "id": "3",
                    "origin_knowledge": "3eee3e83c7b331f67365784900d7ae49"
                }, {
                    "associat_knowledge": [],
                    "showinfo": "4",
                    "type": "url",
                    "id": "4",
                    "origin_knowledge": "3eee3e83c7b331f67365784900d7ae49"
                }]
            };            
            myAction.nodePushFn(data);  
              
            setTimeout(function () {
                myAction.nodePushFn(data2);
            }, 1000);

            setTimeout(function () {
                myAction.nodePushFn(data3);
            }, 1500);            
        },
        buildRootNode: function (id) {
            myAction.newImg(id, "VACKBOT");
            rootsMap[id] = 1;
        },
        autoAddNode: function () {
            var temp = gMyAction.newNodeMap;
            if (gMyAction.gEmitFlg) {
                for (var m in temp) {
                    if (temp.hasOwnProperty(m) && temp[m]) {
                        var i = Math.ceil(Math.random() * 10);
                        if (i > 5 && m != "548asdf8754224sd56468sad4f68sad") {
                            temp[m] = 0;
                            socket.emit("getNodes", { data: m });
                            break;
                        }
                    }
                }
            }
            clearInterval(autoAddNodeInterval);
            autoAddNodeInterval = setInterval(function () {
                myAction.autoAddNode();
            }, 800); 
        },
        newImg: function (id, start) {
            if (!gMyAction.initialized) {
                gMyAction.makeNetwork();
            }
            var startID = id;
            gMyAction.startpages = [startID];
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
                    title: myAction.initRootNodeTitle({root: start})
                }
            ]);
            gMyAction.edges = new vis.DataSet();       
            var data = { nodes: gMyAction.nodes, edges: gMyAction.edges };
            gMyAction.network.setData(data);
            setTimeout(function() {
                gMyAction.network.moveTo({ scale: 0.5 })
            }, 100);
        },
        initRootNodeTitle: function (data) {
            var html = '';
            html = '<div><div class="m-edge-tooltip-title">' + data.root + '</div></div>';
            return html;
        },
        parseQueryString: function (url) {
           var params = {};
           var arr = url.split("?");
           if (arr.length <= 1) {
              return params;
           }
           arr = arr[1].split("&");
           for(var i = 0, l = arr.length; i < l; i++) {
              var a = arr[i].split("=");
              params[a[0]] = decodeURIComponent(a[1]);
           }
           return params;
        }                                                  
    });

    //大屏使用的全局变量
    $.extend(window.gMyAction, {
        attack: function(taskid) {
            if (gMyAction.nodes) {
                gMyAction.nodes.clear();
            }
            if (gMyAction.edges) {
                gMyAction.edges.clear();
            } 
            gMyAction.newNodeMap = {};
            clearInterval(autoAddNodeInterval);
            gMyAction.gBuffer = [];
            gMyAction.clearLegend(); 
            myAction.attack(taskid);
        }
    });

    var init = function () {
        myAction.initSocket();
        myAction.setSocketPush();
        if (myTaskid) {
            myAction.attack(myTaskid);
        }
        if (simulate) {
            myAction.simulateData();
        }        
    }();
});
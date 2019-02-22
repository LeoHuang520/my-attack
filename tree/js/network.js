//network
$(function () {
    var selectedNode = null;
    var traceedges = [];
    var tracenodes = [];   
    var autoNetworkInterval, autoNetworkFlg = true,
        autoNetworkCount = 10, //每次更新个数
        autoNetworkTime = 2000,  //更新时间间隔
        limitNodesCount = 2000;  //限制节点总数量 
    var container = document.getElementById('container');
    var autoNetworkNodeCount = 0;
    var myAction = {};
    var groups, hoverNodeFlg = false, pageShow = true;

    var dom = {
        container: $('#container')
    }

    //生成路径图
    $.extend(myAction, {
        escapeHtml: function(html) {
            return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },
        dataFilter: function(data) {
            var parent = data[0].parent;
            var filterData = [];
            for (var i = 0; i < data.length; i++) {
                if (parent === data[i].parent) {
                    filterData.push(data[i]);
                } else {
                    myAction.expandNodeCallback(parent, filterData);
                    filterData = [];
                    filterData.push(data[i]);
                    parent = data[i].parent;
                }
            }
            myAction.expandNodeCallback(parent, filterData);
        },
        autoNetworkFn: function() {
            if (!gMyAction.filtering && pageShow) {
                var temp;
                if (gMyAction.gBuffer.length > autoNetworkCount) {
                    temp = gMyAction.gBuffer.splice(0, autoNetworkCount);
                    myAction.dataFilter(temp);
                } else if (gMyAction.gBuffer.length >= 1) {
                    temp = gMyAction.gBuffer.splice(0, gMyAction.gBuffer.length);
                    myAction.dataFilter(temp);
                } else {
                    autoNetworkFlg = true;
                    clearInterval(autoNetworkInterval);
                    return;
                }
                if (gMyAction.gBuffer.length > 100) {
                    gMyAction.gEmitFlg = false;
                } else {
                    gMyAction.gEmitFlg = true;
                }
            }
            clearInterval(autoNetworkInterval);
            autoNetworkInterval = setInterval(function() {
                myAction.autoNetworkFn();
            }, autoNetworkTime);
        },
        setBuffer: function(parent, list) {
            for (var i = 0; i < list.length; i++) {
                list[i].parent = parent;
                gMyAction.gBuffer.push(list[i]);
            }

            if (gMyAction.gBuffer.length > 100) {
                gMyAction.gEmitFlg = false;
            } else {
                gMyAction.gEmitFlg = true;
            }

            if (autoNetworkFlg) {
                autoNetworkFlg = false;
                myAction.autoNetworkFn();
            }
        },
        setSpeed: function(data) {
            autoNetworkNodeCount += data.length;
            if (autoNetworkNodeCount > 7000) {
                autoNetworkCount = 1;
                autoNetworkTime = 10000;
            } else if (autoNetworkNodeCount > 6000) {
                autoNetworkCount = 5;
                autoNetworkTime = 5000;
            } else if (autoNetworkNodeCount > 5000) {
                autoNetworkCount = 10;
                autoNetworkTime = 4000;
            } else if (autoNetworkNodeCount > 4000) {
                autoNetworkCount = 20;
                autoNetworkTime = 3000;
            } else if (autoNetworkNodeCount > 3000) {
                autoNetworkCount = 30;
                autoNetworkTime = 3000;
            } else if (autoNetworkNodeCount > 2000) {
                autoNetworkCount = 50;
                autoNetworkTime = 2000;
            }
            //console.log(autoNetworkCount + ':' + autoNetworkTime);
        },
        initNodeTitle: function(data) {
            var html = '';

            html = '<div class="m-tooltip" id="m-tooltip">';
            for (var i in data) {
                html += '<div class="m-tooltip-text"><span class="m-tooltip-text-content">' + data[i] + '</span></div>'; //<span class="m-tooltip-text-name">' + i + ':</span>
            }
            html += '</div>';
            return html;
        },
        expandNodeCallback: function(page, data) {
            var node = gMyAction.nodes.get(page);
            var level = 1;
            var nodeSpawn = {};
            //测试数据，限制节点数
            if (gMyAction.nodes.length > limitNodesCount) {
                return;
            }
            
            if (!node) {
                return;
            } else {
                level = node.level + 1;
                nodeSpawn = myAction.getSpawnPosition(page);
            }

            // var count = 0;
            // for (var i = 0; i < data.length; i++) {
            //     if (data[i].type === 'vulnerability') {
            //         count++;
            //     }
            // }
            // console.log('vis:' + count);
            // if (count) {
            //     debugger;
            // }
            gMyAction.updateLegend(data);
            myAction.setSpeed(data);

            var subpages = data;

            var subnodes = [];
            var newedges = [];

            var nodePos = {};
            nodePos.x = nodeSpawn[0] ? nodeSpawn[0] : 0;
            nodePos.y = nodeSpawn[1] ? nodeSpawn[1] : 0;

            for (var i = 0; i < subpages.length; i++) {
                var subpage = subpages[i];
                var subpageID = subpage.id;
                gMyAction.newNodeMap[subpageID] = 1;
                if (gMyAction.nodes.getIds().indexOf(subpageID) == -1) {
                    var label = myAction.escapeHtml(subpage.data); //处理XSS攻击
                    // label = `    This put an end to decade-long dominance of Lionel Messi and Cristiano Ronaldo on this individual honor since 2008.
                    //         "I'm still not realising how good a year I had collectively, individually, and I'm very proud for everything I achieved
                    //          this year and it will be remembered forever," Modric said.
                    //          This put an end to decade-long dominance of Lionel Messi and Cristiano Ronaldo on this individual honor since 2008.
                    //         "I'm still not realising how good a year I had collectively, individually, and I'm very proud for everything I achieved
                    //          this year and it will be remembered forever," Modric said.
                    //          This put an end to decade-long dominance of Lionel Messi and Cristiano Ronaldo on this individual honor since 2008.
                    //         "I'm still not realising how good a year I had collectively, individually, and I'm very proud for everything I achieved
                    //          this year and it will be remembered forever," Modric said.`;                    
                    label = label.replace(new RegExp(/\n/, "gm"), '');
                    label = label.replace(/^\s+|\s+$/g,"");
                    var title = label;
                    if (label.length > 100) {
                        label = label.slice(0, 100) + '...';
                    }
                    //每10个字符增加一个换行符
                    label = label.replace(/[^\x00-\xff]/g,"$&\x01").replace(/.{20}\x01?/g,"$&\n").replace(/\x01/g,"");

                    var type = 'default';
                    if (groups[subpage.type]) {
                        type = subpage.type;
                    } else {
                        type = 'default';
                    }
                    subnodes.push({
                        id: subpageID,
                        group: type,
                        value: 1,
                        level: level,
                        parent: page,
                        x: nodePos.x,
                        y: nodePos.y,
                        label: label,
                        leaf: true,
                        title: myAction.initNodeTitle({
                            label: title
                        })
                    });
                }

                if (!myAction.getEdgeConnecting(page, subpageID) && !myAction.getEdgeConnectingB(subpageID)) { //Don't create duplicate edges in same direction
                    newedges.push({
                        from: page,
                        to: subpageID,
                        level: level,
                        //length: 260,
                        //"hidden":true,
                        color: {
                            color: "#5BC0DE" //edge颜色：#5BC0DE
                        }
                    });
                }
            }

            gMyAction.nodes.add(subnodes);
            gMyAction.edges.add(newedges);
            if (subnodes.length > 0) {
                gMyAction.filterUpdate(subnodes[0].id);
            }
        }
    });

    //工具函数
    $.extend(myAction, {
        sign: function(x) {
            if (Math.sign) {
                return Math.sign(x);
            } else if (x === 0) {
                return 0;
            } else {
                return x > 0 ? 1 : -1;
            }
        },
        getCenter: function() {
            var nodePositions = gMyAction.network.getPositions();
            var keys = Object.keys(nodePositions);
            // Find the sum of all x and y values
            var xsum = 0;
            var ysum = 0;
            for (var i = 0; i < keys.length; i++) {
                var pos = nodePositions[keys[i]];
                xsum += pos.x;
                ysum += pos.y;
            }
            return [xsum / keys.length, ysum / keys.length]; // Average is sum divided by length
        },
        getSpawnPosition: function(parentID) {
            // Get position of the node with specified id.
            var pos = gMyAction.network.getPositions(parentID)[parentID];
            var x = pos.x,
                y = pos.y;
            var cog = myAction.getCenter();
            // Distances from center of gravity to parent node
            var dx = cog[0] - x,
                dy = cog[1] - y;

            var relSpawnX, relSpawnY;

            if (dx === 0) { // Node is directly above center of gravity or on it, so slope will fail.
                relSpawnX = 0;
                relSpawnY = -myAction.sign(dy) * 100;
            } else {
                // Compute slope
                var slope = dy / dx;
                // Compute the new node position.
                var dis = 200; 
                relSpawnX = dis / Math.sqrt(Math.pow(slope, 2) + 1);
                relSpawnY = relSpawnX * slope;
            }
            return [Math.round(relSpawnX + x), Math.round(relSpawnY + y)];
        },
        getEdgeConnecting: function(a, b) {
            var edge = gMyAction.edges.get({
                filter: function(edge) {
                    return edge.from === a && edge.to === b;
                }
            })[0];
            if (edge instanceof Object) {
                return edge.id;
            }
        },
        getEdgeConnectingB: function(b) {
            var edge = gMyAction.edges.get({
                filter: function(edge) {
                    return edge.to === b;
                }
            })[0];
            if (edge instanceof Object) {
                return edge.id;
            }
        },
        setLable: function(ns, color, backgroundColor) {
            for (var i = 0; i < ns.length; i++) {
                if (i === ns.length - 1) {
                    ns[i].font = {
                        color: 'rgba(120,32,14,0)',
                        background: 'rgba(0,0,0,0)'
                    };
                } else {
                    ns[i].font = {
                        color: color,
                        background: backgroundColor
                    };
                }
                delete ns[i].x;
                delete ns[i].y;
            }
            gMyAction.nodes.update(ns);
        },
        getTraceBackNodes: function(node) {
            var finished = false;
            var path = [];
            while (!finished) { //Add parents of nodes until we reach the start
                path.push(node);
                if (gMyAction.startpages.indexOf(node) !== -1) { //Check if we've reached the end
                    finished = true;
                }
                node = gMyAction.nodes.get(node).parent; //Keep exploring with the node above.
            }
            return path;
        },
        getTraceBackEdges: function(tbnodes) {
            tbnodes.reverse();
            var path = [];
            for (var i = 0; i < tbnodes.length - 1; i++) { //Don't iterate through the last node
                path.push(myAction.getEdgeConnecting(tbnodes[i], tbnodes[i + 1]));
            }
            return path;
        }
    });

    //main.js
    $.extend(myAction, {
        initData: function() {
            groups = {
                ip: {
                    shape: 'image',
                    image: 'img/ip.png' //IP
                },
                port: {
                    shape: 'image',
                    image: 'img/port.png' //端口
                },
                url: {
                    shape: 'image',
                    image: 'img/url.png' //URL
                },
                domain: {
                    shape: 'image',
                    image: 'img/yuming.png' //域名
                },
                root: {
                    shape: 'image',
                    image: 'img/vackbot.png'
                },
                vulnerability: {
                    shape: 'image',
                    image: 'img/vulnerability.png' //漏洞
                },
                host_environment: {
                    shape: 'image',
                    image: 'img/xitong.png' //系统
                },
                network_segment: {
                    shape: 'image',
                    image: 'img/wangduan.png' //端口
                },
                credentials: {
                    shape: 'image',
                    image: 'img/credentials.png' //凭证
                },
                ssl_certificate: {
                    shape: 'image',
                    image: 'img/ssl.png' //ssl证书
                },
                custom_data: {
                    shape: 'image',
                    image: 'img/custom_data.png' //自定义数据
                },
                phone_number: {
                    shape: 'image',
                    image: 'img/dianhua.png' //电话号码
                },
                cookie: {
                    shape: 'image',
                    image: 'img/cookie.png' //cookie
                },
                password: {
                    shape: 'image',
                    image: 'img/mima.png' //密码
                },
                guanlihoutai: {
                    shape: 'image',
                    image: 'img/guanlihoutai.png' //管理员后台
                },
                directory: {
                    shape: 'image',
                    image: 'img/mulu.png' //目录
                },
                fingerprint: {
                    shape: 'image',
                    image: 'img/webzhiwen.png' //web指纹
                },
                proxy: {
                    shape: 'image',
                    image: 'img/daili.png' //代理服务
                },
                email: {
                    shape: 'image',
                    image: 'img/email.png' //邮箱地址
                },
                web_shell: {
                    shape: 'image',
                    image: 'img/web_shell.png' //shell
                },
                web_console: {
                    shape: 'image',
                    image: 'img/web_console.png' //终端
                },
                backend: {
                    shape: 'image',
                    image: 'img/guanlihoutai.png' //管理员后台
                },
                account: {
                    shape: 'image',
                    image: 'img/zhanghumima.png' //账户密码
                },
                asymmetric_key: {
                    shape: 'image',
                    image: 'img/miyao.png' //密钥
                },
                sensitive_data: {
                    shape: 'image',
                    image: 'img/mingand.png' //敏感数据
                },
                sensitive_file: {
                    shape: 'image',
                    image: 'img/minganf.png' //敏感文件
                },
                default: {
                    shape: 'image',
                    image: 'img/default3.png' //默认图标            
                },
                empty: {
                    shape: 'image',
                    image: 'img/empty.png' //透明图标            
                }
            };

            var options = {
                nodes: {
                    shape: 'icon',
                    font: { size: 14, face: 'Helvetica Neue, Helvetica, Arial', color: "rgba(120,32,14,0)", vadjust: 5 , align: 'left'}, //"#131313"
                    shadow: {
                        color:'rgba(0,0,0,0.2)'
                    },
                    chosen: {
                        label: function(values, id, selected, hovering) {
                            //values.color = '#000000';
                        }
                    }
                },
                groups: groups,
                interaction: {
                    hover: true,
                    //hoverConnectedEdges: false,
                    selectConnectedEdges: true,
                    hoverConnectedEdges: true,
                },
                "edges": {
                    "smooth": {
                        "forceDirection": "none",
                        "roundness": 0.8
                    },
                    font: { size: 14, face: 'Helvetica Neue, Helvetica, Arial', color: "#dddddd" },
                    shadow: false,
                    chosen: {
                        edge: function(values, id, selected, hovering) {
                            //values.color = 'red';
                        }
                    },
                    // color: {
                    //     color:'blue',
                    //     highlight:'#666666',
                    //     hover: '#999999'
                    // }
                },
                "physics": {
                    "forceAtlas2Based": {
                        "springLength": 120,
                        "gravitationalConstant": -20
                    },
                    "minVelocity": 0.75,
                    "solver": "forceAtlas2Based"
                }
            };

            gMyAction.nodes = new vis.DataSet([]);
            gMyAction.edges = new vis.DataSet([]);
            var data = { nodes: gMyAction.nodes, edges: gMyAction.edges };
            var result = {
                data: data,
                options: options
            }
            return result;
        },
        makeNetwork: function() {
            var result = myAction.initData();
            gMyAction.network = new vis.Network(container, result.data, result.options);
            gMyAction.context = gMyAction.network.canvas.getContext();
            myAction.bindNetwork();
            gMyAction.initialized = true;
        },
        resetProperties: function() {
            selectedNode = null;
            //Reset node color
            var modnodes = tracenodes.map(function(i) { return gMyAction.nodes.get(i); });
            myAction.setLable(modnodes, 'rgba(120,32,14,0)', 'rgba(0,0,0,0)');
            //Reset edge width and color
            var modedges = traceedges.map(function(i) {
                var e = gMyAction.edges.get(i);
                return e;
            });
            var color = '#5BC0DE';
            clearInterval(gMyAction.flylineInterval);
            gMyAction.edgesWidth(modedges, 1, color);
        },
        traceBackFn: function(node) {
            if (node != selectedNode) {
                selectedNode = node;

                tracenodes = myAction.getTraceBackNodes(node);
                traceedges = myAction.getTraceBackEdges(tracenodes);
                myAction.resetProperties();
                //Color nodes yellow
                var modnodes = tracenodes.map(function(i) { return gMyAction.nodes.get(i); });
                myAction.setLable(modnodes, '#dddddd', 'rgba(0,0,0,0.7)');

                var modedges = traceedges.map(function(i) {
                    var e = gMyAction.edges.get(i);
                    e.color = { inherit: "to" };
                    return e;
                });

                if (tracenodes.length <= 1) {
                    return;
                }
                gMyAction.initFlyData(tracenodes);
                //渐变色
                gMyAction.flyline(modedges, tracenodes);
            }
        },
        getNeutralId: function(id) {
            id = id.toLowerCase();
            id = id.replace(/%20/g, "");
            id = id.replace(/[^A-Za-z\d%]/g, "");
            if (id[id.length - 1] == "s") {
                id = id.slice(0, -1);
            }
            return id;
        },
        resetNetwork: function(start) {
            if (!gMyAction.initialized) {
                myAction.makeNetwork();
            }
            var startID = myAction.getNeutralId(start);
            gMyAction.startpages = [startID];
            tracenodes = [];
            traceedges = [];

            gMyAction.nodes = new vis.DataSet([{
                id: startID,
                label: start,
                value: 2,
                level: 0,
                x: 0,
                y: 0,
                parent: startID
            }]);
            gMyAction.edges = new vis.DataSet();

            var data = { nodes: gMyAction.nodes, edges: gMyAction.edges };
            gMyAction.network.setData(data);
        }
    });

    //制作圆角矩形的lable背景
    $.extend(myAction, {
        fillRoundRect: function (cxt, x, y, width, height, radius, /*optional*/ fillColor) {
            //圆的直径必然要小于矩形的宽高          
            if (2 * radius > width || 2 * radius > height) { return false; }

            cxt.save();
            cxt.translate(x, y);
            //绘制圆角矩形的各个边  
            myAction.drawRoundRectPath(cxt, width, height, radius);
            cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
            cxt.fill();
            cxt.restore();
        },        
        drawRoundRectPath: function (cxt, width, height, radius) {
            cxt.beginPath(0);
            //从右下角顺时针绘制，弧度从0到1/2PI  
            cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

            //矩形下边线  
            cxt.lineTo(radius, height);

            //左下角圆弧，弧度从1/2PI到PI  
            cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

            //矩形左边线  
            cxt.lineTo(0, radius);

            //左上角圆弧，弧度从PI到3/2PI  
            cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);

            //上边线  
            cxt.lineTo(width - radius, 0);

            //右上角圆弧  
            cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);

            //右边线  
            cxt.lineTo(width, height - radius);
            cxt.closePath();
        }
    });

    //vis事件相关
    $.extend(myAction, {
        bindNetwork: function() {
            gMyAction.network.on("hoverNode", function(params) {
                if (!hoverNodeFlg) {
                    var node = gMyAction.nodes.get(params.node);
                    if (node.group === 'empty') {
                        return;
                    }
                    myAction.traceBackFn(params.node);
                    hoverNodeFlg = true;
                }
                setTimeout(function() {
                    hoverNodeFlg = false;
                }, 500);
                var tooltip = $('.vis-tooltip');
                if (!tooltip.hasClass('mCustomScrollbar')) {
                    tooltip.mCustomScrollbar({
                        theme: "minimal-dark",  //minimal-dark dark
                        advanced: {
                            updateOnContentResize: true
                        }                
                    });   
                }                
            });
            gMyAction.network.on("dragging", function(params) {
                var tempNodes = params.nodes;
                if (tempNodes.length > 0) {
                    var node = gMyAction.nodes.get(tempNodes[0]);
                    if (node.group === 'empty') {
                        return;
                    }
                    myAction.resetProperties();
                    myAction.traceBackFn(tempNodes[0]);
                }
            });
            gMyAction.network.on("selectNode", function(params) {
                var node = gMyAction.nodes.get(params.nodes[0]);
                if (node.group === 'empty') {
                    return;
                }
                var tempNodes = params.nodes;
                if (tempNodes.length > 0) {
                    var options = {
                        scale: 1,
                        offset: { x: 0, y: 0 },
                        animation: {
                            duration: 200,
                            easingFunction: "easeInOutQuad"
                        }
                    };
                    gMyAction.network.focus(tempNodes[0], options);
                    $('.vis-tooltip').css({ 'visibility': 'hidden' });
                    gMyAction.network.body.emitter.emit("blurNode", {});
                }
            });
            gMyAction.network.on("blurNode", function() {
                myAction.resetProperties();
            });
        },
        initEvent: function () {
            $(document).on('visibilitychange', function(e) {
                if (e.target.visibilityState === "visible") {
                    pageShow = true;
                } else if (e.target.visibilityState === "hidden") {
                    pageShow = false;
                }
            });  
            dom.container.on('mouseenter mousemove', '.vis-tooltip', function (e) {
                var that = $(this);
                gMyAction.tooltipEnter = true;             
            });
            dom.container.on('mouseout', '.vis-tooltip', function () {
                gMyAction.tooltipEnter = false;
            });           
        }
    });

    //全局变量
    $.extend(gMyAction, {
        nodes: null,
        edges: null,
        newNodeMap: {},
        gEmitFlg: true,
        filtering: false,
        context: null,
        flylineInterval: null,
        initialized: false,
        startpages: [],
        network: null,
        gBuffer: [],
        LegendeStop: false,
        tooltipHideBefore: false,
        tooltipEnter: false,
        edgesWidth: function(es, width, color) {
            for (var i = 0; i < es.length; i++) {
                es[i].width = width;
                es[i].color = { color: color };
            }
            gMyAction.edges.update(es);
        },
        drawSensitiveNodes: function(id, data) {
            myAction.expandNodeCallback(id, data);
        },
        drawAttackNodes: function(parent, list) {
            myAction.setBuffer(parent, list);
        },
        getTraceBackNodes: function(node) {
            return myAction.getTraceBackNodes(node)
        },
        getTraceBackEdges: function(tracenodes) {
            return myAction.getTraceBackEdges(tracenodes);
        },
        makeNetwork: function() {
            myAction.makeNetwork();
        },
        fillRoundRect: function (cxt, x, y, width, height, radius, fillColor) {
            myAction.fillRoundRect(cxt, x, y, width, height, radius, fillColor);
        }
    });    

    var init = function () {
        myAction.initEvent();
    }();
})
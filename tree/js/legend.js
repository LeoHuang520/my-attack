//图例
$(function() {
	var myAction = {}, formatData = {}, gFilterType = {}, filterInterval;
	var dom = {
		legend: $('#m-legend'),
		arrow: $('#m-legend-arrow'),
		contentList: $('#m-content-list'),
		contentListInner: $('#m-content-list-inner'),
		testBtn: $('#m-test')
	};

    var nameHook = {
        url: 'URL地址',
        ip: 'IP',
        port: '端口',
        domain: '域名',
        directory: '目录',
        network_segment: '网段',
        host_environment: '主机',
        fingerprint: '指纹',
        proxy: '代理地址',
        email: '邮箱地址',
        web_shell: '后门',
        webshell: '后门',
        web_console: '控制终端',
        backend: '管理后台地址',
        account: '账户',
        password: '密码',
        asymmetric_key: '密钥',
        credentials: '凭证',
        cookie: 'Cookie数据',
        phone_number: '手机号码',
        vulnerability: '漏洞数据',
        custom_data: '自定义数据',
        ssl_certificate: 'SLL证书',
        sensitive_file: '敏感文件',
        sensitive_data: '敏感数据',
        file_upload_entry: '文件上传',
        back_end_login_entry: '后台入口'
    };

	//过滤相关
	$.extend(myAction, {
		setLeafNodes: function (parentIdObj) {
			var needSetIds = [];
		    for (var parentId in parentIdObj) {
			    var chlidNodes = gMyAction.nodes.get({
			        filter: function(item) {
			        	var selected = false;
			        	if (item.parent === parentId) {
			        		selected = true;
			        	}
			            return selected;
			        }
			    });	
			    var isLeafNode = false;
			    var emptyCount = 0;
			    for (var i = 0; i < chlidNodes.length; i++) {
			    	if (chlidNodes[i].group == 'empty') {
			    		emptyCount++;
			    	}
			    }		    	
			    if (emptyCount === chlidNodes.length) {
			    	needSetIds.push(parentId);
			    }
		    }
		    var needSetNodes = gMyAction.nodes.get(needSetIds);
		    for (var i = 0; i < needSetNodes.length; i++) {
		    	needSetNodes[i].leaf = true;
		    	delete needSetNodes[i].x;
		    	delete needSetNodes[i].y;	  		    	
		    }
		    gMyAction.nodes.update(needSetNodes);
		},
		hideEdges: function () {
		    var hadHideNodes = gMyAction.nodes.get({
		        filter: function(item) {
		        	var selected = false;
		        	if (item.group === 'empty') {
		        		selected = true;
		        	}
		            return selected;
		        }
		    });  			
			var needHideIds = [];
			for (var i = 0; i < hadHideNodes.length; i++) {
				needHideIds.push(hadHideNodes[i].id);
			}
 			var needHideEdges = gMyAction.edges.get({
 				filter: function (item) {
		        	var selected = false;
		        	if ((needHideIds.indexOf(item.to) >= 0 || needHideIds.indexOf(item.from) >= 0) 
		        		&& item.color.color !== 'rgba(0,0,0,0)') {
		        		selected = true;
		        	}
		            return selected; 					
 				}
 			});
 			for (var i = 0; i < needHideEdges.length; i++) {
 				needHideEdges[i].color = {color: 'rgba(0,0,0,0)'};
 			}
 			gMyAction.edges.update(needHideEdges);
			clearInterval(filterInterval);
			filterInterval = setInterval(function () {
				gMyAction.filtering = false;							
			}, 5000); 			
		},		
		hideVisNodes: function () {
			gMyAction.filtering = true;
        	var filterObj = gFilterType;
        	var hideNodesCount = 0;
        	for (var filterType in filterObj) {
        		if (filterObj[filterType] === false) {
				    var needHideNodes = gMyAction.nodes.get({
				        filter: function(item) {
				        	var selected = false;
				        	if (item.group === filterType && item.leaf === true) {
				        		selected = true;
				        	}
				            return selected;
				        }
				    });
				    var parentIdObj = {};
				    for (var i = 0; i < needHideNodes.length; i++) {
				    	needHideNodes[i].historyGroup = needHideNodes[i].group;
				    	needHideNodes[i].group = 'empty';
				    	needHideNodes[i].leaf = true;
				    	var parentId = gMyAction.nodes.get(needHideNodes[i].id).parent;
				    	if (!parentIdObj[parentId]) {
				    		parentIdObj[parentId] = parentId;
				    	}
				    	delete needHideNodes[i].x;
				    	delete needHideNodes[i].y;
				    }				    
				    gMyAction.nodes.update(needHideNodes); 
				    myAction.setLeafNodes(parentIdObj);  	
				    hideNodesCount = hideNodesCount + needHideNodes.length;		
        		}
        	}
        	if (hideNodesCount != 0) {
        		myAction.hideVisNodes();
        	}
		},
		showVisNodes: function () {
			gMyAction.filtering = true;
        	var filterObj = gFilterType;
        	var showNodesCount = 0;
        	for (var filterType in filterObj) {
        		if (filterObj[filterType] === true) {			
				    var needShowNodes = gMyAction.nodes.get({
				        filter: function(item) {
				        	var selected = false;
				        	if (item.historyGroup === filterType && item.group === 'empty') {
				        		selected = true;
				        	}
				            return selected;
				        }
				    });		
				    var parentIdObj = {};
				    var needShowIds = [];
			        for (var i = 0; i < needShowNodes.length; i++) {
			            var historyGroup = needShowNodes[i].historyGroup;
			            if (historyGroup) {
			                needShowNodes[i].group = historyGroup;
			            }
			            var parentId = needShowNodes[i].parent;
				    	if (!parentIdObj[parentId]) {
				    		parentIdObj[parentId] = parentId;
				    	}	  
				    	needShowIds.push(needShowNodes[i].id);     
				    	delete needShowNodes[i].x;
				    	delete needShowNodes[i].y;				    	     
			        } 	    

			        showNodesCount = showNodesCount + needShowNodes.length;		

			        gMyAction.nodes.update(needShowNodes);	//显示节点   	    

		 			var needShowEdges = gMyAction.edges.get({
		 				filter: function (item) {
				        	var selected = false;
				        	if ((needShowIds.indexOf(item.to) >= 0 || needShowIds.indexOf(item.from) >= 0) && item.color.color === 'rgba(0,0,0,0)') {
				        		selected = true;
				        	}
				            return selected; 					
		 				}
		 			});
		 			for (var i = 0; i < needShowEdges.length; i++) {
		 				needShowEdges[i].color = {color: '#5BC0DE'};
		 			}
		 			gMyAction.edges.update(needShowEdges);	//显示edges   


		 			for (var tempParentId in parentIdObj) {
		 				myAction.showVisNodesUpdateTrace(tempParentId);
		 			}
		 		}
		 	}  
        	if (showNodesCount != 0) {
        		myAction.showVisNodes();
        	} else {
        		myAction.hideEdges();
				clearInterval(filterInterval);
				filterInterval = setInterval(function () {
					gMyAction.filtering = false;							
				}, 5000); 	
			}			    	
		},
		showVisNodesUpdateTrace: function (id) {
	        var traceIds = gMyAction.getTraceBackNodes(id);
	        var traceEdgeIds = gMyAction.getTraceBackEdges(traceIds);  
	        var traceNodes = gMyAction.nodes.get(traceIds);  
	        var traceEdges = traceEdgeIds.map(function(i) {
	                var e = gMyAction.edges.get(i);
	                e.color = {color: '#5BC0DE'};
	                return e;
	            });        
	        var needUpdate = false;
	       	
	        for (var i = 0; i < traceNodes.length; i++) {
	            var historyGroup = traceNodes[i].historyGroup;
	            if (historyGroup) {
	                traceNodes[i].group = historyGroup;
	                needUpdate = true;
	            }
	            if (traceNodes[i].leaf === true) {
	            	traceNodes[i].leaf = false;
	            	needUpdate = true;
	            } 
		    	delete traceNodes[i].x;
		    	delete traceNodes[i].y;	  	            		        	
	        }    
	        if (needUpdate) {
	            gMyAction.nodes.update(traceNodes);
	            gMyAction.edges.update(traceEdges);
	        }
		},
		filterUpdate: function (id) {
	        var traceIds = gMyAction.getTraceBackNodes(id);
	        var traceEdgeIds = gMyAction.getTraceBackEdges(traceIds);  
	        var traceNodes = gMyAction.nodes.get(traceIds);  
	        var traceEdges = traceEdgeIds.map(function(i) {
	                var e = gMyAction.edges.get(i);
	                e.color = {color: '#5BC0DE'};
	                return e;
	            });        
	        var needUpdate = false;
	       	
	        for (var i = 0; i < traceNodes.length - 1; i++) {
	            var historyGroup = traceNodes[i].historyGroup;
	            if (historyGroup) {
	                traceNodes[i].group = historyGroup;
	                needUpdate = true;
	            }
	            if (traceNodes[i].leaf === true) {
	            	traceNodes[i].leaf = false;
	            	needUpdate = true;
	            }   
		    	delete traceNodes[i].x;
		    	delete traceNodes[i].y;	                    	
	        }    
	        if (needUpdate) {
	            gMyAction.nodes.update(traceNodes);
	            gMyAction.edges.update(traceEdges);
	        }

		    myAction.hideVisNodes();
		    myAction.hideEdges();
		}				
	});

	//图例相关
	$.extend(myAction, {
		updateLegend: function (data) {
			var myData = data;
			if (gMyAction.LegendeStop) {
				return;
			}
			for (var i = 0; i < myData.length; i++) {
				if (myData[i].is_root) {
					return;
				}
				var type = myData[i].type;
				var count = 1;
				if (formatData[type]) {
					if (formatData[type].count) {
						count = formatData[type].count + 1;
					}
				}
				var name = type;
				if (nameHook[type]) {
					name = nameHook[type];
				}				
				formatData[type] =  {
					type: type,
					name: name,
					count: count
				}
			}
			var tempData = [];
		    for (var i in formatData) {
		    	var tempType = formatData[i].type;
				var tempFilter = true;
				if (gFilterType[tempType] === true) {
					tempFilter = true;
				} else if (gFilterType[tempType] === false) {
					tempFilter = false;
				}
				formatData[i].filter = tempFilter;
		        tempData.push(formatData[i]);
		    }			
	        var datas = {data: tempData};
	        var htmls = template('m-content-item-list', datas);	
	        dom.contentListInner.html(htmls);	
	        //dom.contentList.mCustomScrollbar("update");
	        //$(".js-content-item:first").css({'border-top': '1px solid rgba(0,0,0,0.1)'});	
	        //$(".js-content-item:last").css({'border-bottom': 'none'});		
	        //dom.contentList.mCustomScrollbar("destroy");            	
		},
		clearLegend: function () {
			gMyAction.LegendeStop = true;
			dom.contentListInner.html('');	
			formatData = {};
		}		
	});

	//dom事件
	$.extend(myAction, {
		arrowFn: function (e, that) {
			if (that.hasClass('active')) {
				that.removeClass('active');
				dom.contentList.hide();
			} else {
				that.addClass('active');
				dom.contentList.show();
			}			
			e.stopPropagation();
			e.preventDefault();
		},
		initScroller: function () {	
			dom.contentList.mCustomScrollbar({
				theme:"minimal-dark",  //minimal-dark dark
				advanced: {
					updateOnContentResize: true
				}
			});				
		},
		filterFn: function (that) {
			var type = that.data('type');
			var filter = that.find('.js-filter');
			if (filter.hasClass('active')) {
				filter.removeClass('active');
				gFilterType[type] = false;
				myAction.hideVisNodes();
				myAction.hideEdges();
			} else {
				filter.addClass('active');
				gFilterType[type] = true;
				myAction.showVisNodes();
			}
		}		
	});



	$.extend(myAction, {
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
        },		
		initLegend: function () {
			var ps = myAction.parseQueryString(window.location.href);
			if (ps.show === '0') {
				dom.legend.hide();
			} else {
				dom.legend.show();
			}
		},
		initEvent: function () {
			dom.arrow.on('click', function (e) {
				var that = $(this);
				myAction.arrowFn(e, that);
			});
			dom.contentList.on('click', '.js-content-item', function (e) {
				var that = $(this);
				myAction.filterFn(that);
			});
			dom.contentList.on('click', '.js-filter', function () {
				var that = $(this);
				//myAction.filterFn(that);
			});
			dom.testBtn.on('click', function () {
				myAction.hideVisNodes();
				myAction.hideEdges();			
			});
		}	
	});

    //全局变量
    $.extend(gMyAction, {
    	updateLegend: function (data) {
    		myAction.updateLegend(data);
    	},
    	clearLegend: function () {
    		myAction.clearLegend();
    	},
    	filterUpdate: function (id) {
    		myAction.filterUpdate(id);
    	}   	
    });	

	var init = function () {
		myAction.initLegend();
		myAction.initEvent();
		myAction.initScroller();
	}();
});
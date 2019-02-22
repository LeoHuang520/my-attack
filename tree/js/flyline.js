//飞线
$(function () {
    var canvasWidth, canvasHeight;
    var pointArr = [], pointArrIndex = 0;;
    var grdStartPointX, grdEndPointX, nextEndPointX;
    var grdStartPointY, grdEndPointY, nextEndPointY;
    var directionFlg = 'right', directionOldFlg = 'right', changeDirectionFlg = false;
    var flylineLength = 100, addWidth;
    var edgeColor = "#00ffcc";  //#2F4654,#009999,#00ffcc
    var myAction = {};

    $.extend(myAction, {
        setColor: function (grd) {
            grd.addColorStop(0,edgeColor);
            grd.addColorStop(0.5,"#0099ff");  //#ffff00,#0033ff
            grd.addColorStop(1,edgeColor);         
        },
        initGradientRight: function (modedges, tracenodes) {
            if (grdStartPointX > nextEndPointX) {
                if (pointArrIndex < pointArr.length - 2) {
                    pointArrIndex++;
                    grdStartPointX = pointArr[pointArrIndex].x;
                    nextEndPointX = pointArr[pointArrIndex + 1].x;
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);
                } else {
                    pointArrIndex = 0;
                    grdStartPointX = pointArr[pointArrIndex].x;
                    nextEndPointX = pointArr[pointArrIndex + 1].x;  
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);              
                }
            };

            grdEndPointX = grdStartPointX + addWidth;

            //console.log(grdStartPointX + ':' + grdEndPointX);
            var grd = gMyAction.context.createLinearGradient(grdStartPointX, 0, grdEndPointX, 0);
            myAction.setColor(grd);

            grdStartPointX = grdStartPointX + (addWidth / 2);        
            return grd;      
        },
        initGradientLeft: function (modedges, tracenodes) {
            if (grdStartPointX < nextEndPointX) {
                if (pointArrIndex < pointArr.length - 2) {
                    pointArrIndex++;
                    grdStartPointX = pointArr[pointArrIndex].x;
                    nextEndPointX = pointArr[pointArrIndex + 1].x;
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);
                } else {
                    pointArrIndex = 0;
                    grdStartPointX = pointArr[pointArrIndex].x;
                    nextEndPointX = pointArr[pointArrIndex + 1].x;  
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);              
                }
            };      

            grdEndPointX = grdStartPointX - addWidth;

            //console.log(grdStartPointX + ':' + grdEndPointX);
            var grd = gMyAction.context.createLinearGradient(grdStartPointX, 0, grdEndPointX, 0);
            myAction.setColor(grd);

            grdStartPointX = grdStartPointX - (addWidth / 2);  
            return grd;      
        },    
        initGradientDown: function (modedges, tracenodes) {
            if (grdStartPointY > nextEndPointY) {
                if (pointArrIndex < pointArr.length - 2) {
                    pointArrIndex++;
                    grdStartPointY = pointArr[pointArrIndex].y;
                    nextEndPointY = pointArr[pointArrIndex + 1].y;
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);
                } else {
                    pointArrIndex = 0;
                    grdStartPointY = pointArr[pointArrIndex].y;
                    nextEndPointY = pointArr[pointArrIndex + 1].y;  
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);              
                }
            };     

            grdEndPointY = grdStartPointY + addWidth;

            //console.log(grdStartPointY + ':' + grdEndPointY);
            var grd = gMyAction.context.createLinearGradient(0, grdStartPointY, 0, grdEndPointY);
            myAction.setColor(grd);

            grdStartPointY = grdStartPointY + (addWidth / 2);        
            return grd;  
        },  
        initGradientUp: function (modedges, tracenodes) {
            if (grdStartPointY < nextEndPointY) {
                if (pointArrIndex < pointArr.length - 2) {
                    pointArrIndex++;
                    grdStartPointY = pointArr[pointArrIndex].y;
                    nextEndPointY = pointArr[pointArrIndex + 1].y;
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);
                } else {
                    pointArrIndex = 0;
                    grdStartPointY = pointArr[pointArrIndex].y;
                    nextEndPointY = pointArr[pointArrIndex + 1].y;  
                    myAction.getAddWidth(pointArr[pointArrIndex], pointArr[pointArrIndex + 1]);              
                }
            };      

            grdEndPointY = grdStartPointY - addWidth;

            //console.log(grdStartPointY + ':' + grdEndPointY);
            var grd = gMyAction.context.createLinearGradient(0, grdStartPointY, 0, grdEndPointY);
            myAction.setColor(grd);

            grdStartPointY = grdStartPointY - (addWidth / 2);  
            return grd;      
        },       
        initFlyData: function (tracenodes) {
            var canvas = $('#container canvas');
            canvasWidth = canvas.attr('width');
            canvasHeight = canvas.attr('height');   
            pointArr = [];

            for (var i = 0; i < tracenodes.length; i++) {
                var node = gMyAction.network.getPositions(tracenodes[i]);
                var temp = tracenodes[i];
                pointArr.push({
                    x: node[temp].x, 
                    y: node[temp].y           
                });
            }
            grdStartPointX = pointArr[0].x;
            nextEndPointX = pointArr[1].x; 
            grdStartPointY = pointArr[0].y;
            nextEndPointY = pointArr[1].y;         
            pointArrIndex = 0;
            myAction.getDirection(pointArr[0], pointArr[1]);
            directionOldFlg = directionFlg;
            myAction.getAddWidth(pointArr[0], pointArr[1]);
        },
        getDirection: function (pointA, pointB) {
            var width, height;
            if (pointA.x > pointB.x) {
                width = pointA.x - pointB.x;
            } else if (pointA.x < pointB.x) {
                width = pointB.x - pointA.x;
            } else {
            }
            if (pointA.y > pointB.y) {
                height = pointA.y - pointB.y;
            } else if (pointA.y < pointB.y) {
                height = pointB.y - pointA.y;
            } else {
            }    

            var tan = height / width;        
            if (pointA.x > pointB.x) {
                directionFlg = 'left';
            } else if (pointA.x < pointB.x) {
                directionFlg = 'right';
            }
            if (pointA.y > pointB.y) {
                if (tan > 1) {
                    directionFlg = 'up';
                }
            } else if (pointA.y < pointB.y) {
                if (tan > 1) {
                    directionFlg = 'down';
                }
            }       
        },
        //已知正切值和斜边，求直角边, x^2 + (tan*x)^2 = y^2
        //x^2 = y^2 / (1 + tan * tan)
        getAddWidth: function (pointA, pointB) {
            var width, height;
            myAction.getDirection(pointA, pointB);
            if (directionOldFlg !== directionFlg) {
                changeDirectionFlg = true;
            } else {
                changeDirectionFlg = false;
            }
            directionOldFlg = directionFlg;
            grdStartPointX = pointArr[pointArrIndex].x;
            nextEndPointX = pointArr[pointArrIndex + 1].x; 
            grdStartPointY = pointArr[pointArrIndex].y;
            nextEndPointY = pointArr[pointArrIndex + 1].y;          
            if (pointA.x > pointB.x) {
                width = pointA.x - pointB.x;
            } else if (pointA.x < pointB.x) {
                width = pointB.x - pointA.x;
            } else {
                addWidth = flylineLength;
                return;
            }
            if (pointA.y > pointB.y) {
                height = pointA.y - pointB.y;
            } else if (pointA.y < pointB.y) {
                height = pointB.y - pointA.y;
            } else {
                addWidth = flylineLength;
                return;
            }             
            var tan;
            if (directionFlg === 'right' || directionFlg === 'left') {
                tan = height / width;
            } else {
                tan = width / height;
            }
            addWidth = parseInt(Math.sqrt((flylineLength * flylineLength) / (1 + tan * tan)));
            addWidth = addWidth / 2;
            if (addWidth < 2) {
                addWidth = 2;
            }
        },  
        setEdges: function (modedges, grd) {
            var currentEdge = [modedges[pointArrIndex]];
            var modedgesCopy = $.extend([], modedges);
            modedgesCopy.splice(pointArrIndex, 1);
            gMyAction.edgesWidth(modedgesCopy, 5, edgeColor);
            gMyAction.edgesWidth(currentEdge, 5, grd);
        },
        flyline: function  (modedges, tracenodes) {
            var grd;
            if (directionFlg === 'right') {
                grd = myAction.initGradientRight(modedges, tracenodes);
            } else if (directionFlg === 'left') {
                grd = myAction.initGradientLeft(modedges, tracenodes);   
            } else if (directionFlg === 'down') {
                grd = myAction.initGradientDown(modedges, tracenodes);   
            } else if (directionFlg === 'up') {
                grd = myAction.initGradientUp(modedges, tracenodes);   
            }
            if (changeDirectionFlg) {
                changeDirectionFlg = false;
            } else {
                myAction.setEdges(modedges, grd);
            }
            clearInterval(gMyAction.flylineInterval);
            gMyAction.flylineInterval = setInterval(function () {
                myAction.flyline(modedges, tracenodes);
            }, 50);
        }    
    });

    //全局变量
    $.extend(gMyAction, {
        initFlyData: function (tracenodes) {
            myAction.initFlyData(tracenodes);
        },
        flyline: function (modedges, tracenodes) {
            myAction.flyline(modedges, tracenodes);
        }
    });
})
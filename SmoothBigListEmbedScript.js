var px;
var py;
var cx;
var cy;
var rowHeight;
var maxRows;
var selectedIndex = -1;
var theList;
var theWindow; 
var dataProvider;
var visibleRows;
var topHiddenRows;
var bottomHiddenRows;
var availRows;
var hiddenRows;
var inited;
var swipeVilosity;
var timeouts;
var tweening;
var startArrayElement = -1;
var maxCount;
var fingerDown;
var itemRendererDom;
var beforeTweenHandler;
var afterTweenHandler;
var setDataHandler;

function recordCords(x,y)
{
	px = x;
	py = y;
}

function computeChange(x,y)
{
	cx = px-x;
	cy = py-y;
}

function initDimensions()
{
	if(theList.children)
	{
		if(!inited)
		{
			rowHeight = theList.children[0].offsetHeight;
			maxRows = (theList.offsetHeight-theWindow.offsetHeight)/rowHeight;
			visibleRows = (theWindow.offsetHeight/rowHeight);
			availRows = theList.children.length;
			hiddenRows = availRows - visibleRows;
			var mod = hiddenRows % 2;
			topHiddenRows = Math.floor(hiddenRows/2);
			bottomHiddenRows = topHiddenRows + mod;
			maxCount = Math.max(0,dataProvider.length-visibleRows);
			
			for(var x=0; x<theList.children.length; x++)
			{
				theList.children[x].originalOrder = x;
			}
			
			inited = true;
			
		}
	}
}

function onMouseDownHandler(e)
{
	if(!dataProvider || !dataProvider.length) return;				
	recordCords(e.pageX,e.pageY);
	computeChange(e.pageX, e.pageY);
	
	if(!this.onmousemove)
	{
		this.onmousemove = onMouseMoveHandler;
	}
	
	if(!this.ontouchmove)
	{
		this.ontouchmove = onTouchMoveHandler;
	}
	
	cancelTween();
}

function onMouseUpHandler(e)
{
	if(!dataProvider || !dataProvider.length) return;
		stopScroll(e);
	
}

function onMouseOutHandler(e)
{
	if(!dataProvider || !dataProvider.length) return;
	if((e.target==window) || (e.target==theWindow)|| (e.target==theList)) // only fire when the user mouses out of the div
	{
		stopScroll(e);
	}
	
}

function stopScroll(e)
{
	if(this.onmousemove)
	{
		this.onmousemove = null;
	}
	
	if(this.ontouchmove)
	{
		this.ontouchmove = null;
	}
	
	tweenToSwipe(e);
	computeChange(e.pageX, e.pageY);
	recordCords(e.pageX, e.pageY); 
}

/*function iphoneLog()
{
	var theHTML = "";
	
	for(var i=0; i<arguments.length; i++)
	{
		if(i)
			theHTML += ", ";
		theHTML += arguments[i];
	}
	
	document.getElementById("debug").innerHTML = theHTML;
}
*/
function tweenToSwipe(e)
{
	swipeVilosity = Math.min(.5,Math.abs(cy/(theWindow.offsetHeight))); //lower decimal value to alter tolerence
	
	if((selectedIndex<=0)||(selectedIndex>=maxCount))
	{
		return;
	}
	
	//if(swipeVilosity>0.018)
	{
		var futureIndex = (visibleRows*8)*swipeVilosity;
		
		if(cy<0)
		{
			futureIndex = Math.max(0,selectedIndex - futureIndex);
		}
		else
		{
			
			futureIndex = Math.min(selectedIndex + futureIndex,maxCount);
		}
		
		var rowsToTravel = Math.abs(futureIndex-selectedIndex);
		if(rowsToTravel>2)
		{
			if(rowsToTravel>(hiddenRows-2))
			{
				setItemRendererVisibility(false);
			}
			
			tweenToIndex(futureIndex);
		}
	}
	
	
}

function tweenToIndex(value)
{
	tweenTo(7000*swipeVilosity, setSelectedIndex, selectedIndex, value);
}

function tweenTo(time, setterFunction, startValue, endValue)
{
	removeTimeouts();
	timeouts = new Array();
	var timePerStep = 30;
	var steps = time/timePerStep;
	
	tweening = true;
	var curTime;
	
	for(var i=1;i<=steps;i++)
	{
		curTime = timePerStep*i;
		timeouts.push(window.setTimeout(doTween, curTime, curTime, startValue, endValue, time, setterFunction));
	}
	
	timeouts.push(window.setTimeout(doTween, time, time, startValue, endValue, time, setterFunction));
}

function cancelTween()
{
	tweening = false;
	removeTimeouts();
	syncIndex();
	
}

function removeTimeouts()
{
	if(timeouts)
	{
		while(timeouts.length>0)
		{
			window.clearTimeout(timeouts.pop());
		}
	}
	
	timeouts = null;
}

//t= current time, b=start value, c=change in value, d=duration
//more easing available at http://gizma.com/easing
//TODO move tweening to its own class
/*function easeOutQuart(t, b, c, d) 
{
	t /= d;
	t--;
	return c*(t*t*t + 1) + b;
}

function easeOutSine(t, b, c, d) {
	return c * Math.sin(t/d * (Math.PI/2)) + b;
}

function easeOutQuad(t, b, c, d) {
	t /= d;
	return -c * t*(t-2) + b;
}*/

function easeOutCubic(t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t + 1) + b;
}

/*var lu=new Array();
	lu[10] = 1.0000;
	lu[9] = 0.7438;
    lu[8] = 0.5544;
    lu[7] = 0.4046;
    lu[6] = 0.2852;
    lu[5] = 0.1909;
    lu[4] = 0.1182;
    lu[3] = 0.0645;
    lu[2] = 0.0278;
    lu[1] = 0.0068;
    lu[0] = 0.0000;

lu[0] = 0;
lu[1] = 0.2709999999999999;
lu[2] = 0.4879999999999999;
lu[3] = 0.657;
lu[4] = 0.784;
lu[5] = 0.875;
lu[6] = 0.9359999999999999;
lu[7] = 0.973;
lu[8] = 0.992;
lu[9] = 0.999;
lu[10] = 1;

for(var i=0; i<=10; i++)
{
	////////////////console.log("lu[" + i + "] = " + easeOutCubic(i,0,1,10) +";");
}
    
		   10  i: 1.0000  o: 1.0000
09  i: 0.9000  o: 0.8394
08  i: 0.8000  o: 0.6916
07  i: 0.7000  o: 0.5548
06  i: 0.6000  o: 0.4291
05  i: 0.5000  o: 0.3153
04  i: 0.4000  o: 0.2149
03  i: 0.3000  o: 0.1296
02  i: 0.2000  o: 0.0623
01  i: 0.1000  o: 0.0170

		    00  i: 0.0000  o: 0.0000*/
 /*   var step;
var amount;
for(var i=0; i<11;i++)
{
	switch(i)
	{
	case 0:
		amount
	
	}
	
	lu[i] = (amount * i/step);
	//////////////console.log(lu[i],i);
}*/


function cubicBezier(t, b, c, d)
{
	var pos = (t/d*10);
	var mod = (pos % 1);
	var factor;
	
	if(mod)
	{
		var idx = Math.floor(pos);
		var begin = lu[idx];
		var end = lu[idx+1];
		var delta = end-begin;
		factor = begin + (delta * mod);
	}
	else
	{
		factor = lu[pos];
	}
	
	return b + factor*c;
	
}


function doTween(currentTime, startValue, endValue, totalTime, setterFunction)
{
	if(tweening)
	{
		var val = easeOutCubic(currentTime, startValue, endValue-startValue, totalTime);
		setterFunction(val, false);
	}
	
	if(currentTime==totalTime)
	{
		tweening = false;
		syncIndex();
		cancelTween();
		
	}
}

function syncIndex()
{
	setSelectedIndex(selectedIndex, true);
	setItemRendererVisibility(true);
}


function setSelectedIndex(value, force)
{
	var oldSelectedIndex = selectedIndex;
	var val = value;
	
	if(val<0)
	{
		val = 0;
	}
	else if(val>maxCount)
	{
		val = maxCount;
	}
	
	if((selectedIndex!=val) || force)
	{
		selectedIndex = val;
		oldSelectedIndex = val;
		var topOffset = 0;

		var rowsOnTop = 0;
		var minBottomRows = Math.min(bottomHiddenRows,maxCount-selectedIndex);
		
		var minTopRows = Math.min(selectedIndex,topHiddenRows);
		topOffset = theList.children[0].originalOrder;
		var rowsOnTop = (selectedIndex-topOffset%availRows) % availRows;
	
		
		var rowsOnBottom = availRows - visibleRows - rowsOnTop ;
		var toMove;
		
		if(selectedIndex>oldSelectedIndex)
		{
			minTopRows--;
		}
		else
		{
			minBottomRows--;
		}
		
	
		while(rowsOnBottom<minBottomRows)
		{
			toMove = theList.children[0];
			theList.removeChild(toMove);
			theList.appendChild(toMove)
			rowsOnBottom++;
			rowsOnTop--;
		}
		
		while(rowsOnTop<minTopRows)
		{
			toMove = theList.children[theList.children.length-1];
			theList.removeChild(toMove);
			theList.insertBefore(toMove,theList.children[0]);
			rowsOnTop++;
			rowsOnBottom--;
		}

		rowsOnTop = availRows-visibleRows-rowsOnBottom; 
		topOffset = Math.max(0,Math.floor(selectedIndex-rowsOnTop));
		
		var start = Math.ceil(selectedIndex)-Math.ceil(rowsOnTop);
			
		if((start!=startArrayElement) || force)//only mess with the data when you have to
		{
			
				var end = start+availRows;
				var visibleData = dataProvider.slice(start, end);
				
				var domElement;
				var dataItem;
				
				for(var i=0; i<visibleData.length; i++)
				{
					if((theList.children[i].data!=visibleData[i]) || force)
					{
						dataItem = visibleData[i];
						domElement = theList.children[i];
						domElement.data = dataItem;
						
						setDataHandler(dataItem, domElement, tweening);
					}
				}
				
				startArrayElement = start;
		}
	
		theList.style.top = Math.max(theWindow.offsetHeight-theList.offsetHeight, (selectedIndex-topOffset)*rowHeight * -1);
	}
	
}

function onMouseMoveHandler(e)
{
	if(!dataProvider || !dataProvider.length) return;
	var relativeEventY = e.pageY-theWindow.offsetTop;
	
	if(relativeEventY<1 || relativeEventY>=theWindow.clientHeight)
	{
		stopScroll(e);
	}
	
	computeChange(e.pageX, e.pageY);
	setSelectedIndex(selectedIndex+cy/rowHeight, false);
	recordCords(e.pageX, e.pageY);
}

function extractDataPointerMap(obj,domE)
{
	var theChild;
	var childDescriptor;
	for(var i=0; i<domE.children.length; i++)
	{
		theChild = domE.children[i];
		if(theChild.getAttribute("data-accessorName"))
		{
			childDescriptor = new Object();
			childDescriptor.relativeIndex = i;
			
			if(theChild.children)
			{
				extractDataPointerMap(childDescriptor, theChild, false);
			}
			
			obj[theChild.getAttribute("data-accessorName")] = childDescriptor;
		}
	}
	
	
	return obj;
}

function applyDataMap(childMap, domE)
{
	for(var prop in childMap)
	{
		if(prop != "relativeIndex")
		{
			
			domE[prop] = domE.children[childMap[prop].relativeIndex];
			applyDataMap(childMap[prop], domE.children[childMap[prop].relativeIndex]);
		}
			
	}
}

function initItemRenderers()
{
	var payload = itemRendererDom.innerHTML;
	var childMap = extractDataPointerMap(new Object(), itemRendererDom);
	var theChild;
	
	for(var i=0; i<theList.children.length; i++)
	{
		theChild = theList.children[i];
		theChild.innerHTML = payload;
		
		applyDataMap(childMap, theChild);
	}
}


function onTouchStartHandler(e)
{
	//console.log("touch");
	//e.stopPropagation();
//	e.preventDefault();
	if(e.touches.length==1)
	{
		onMouseDownHandler(e.touches[0]);
		fingerDown = true;
	}
}

function onTouchMoveHandler(e)
{
	//e.stopPropagation();
	//e.preventDefault();
	if(e.touches.length==1)
	{
		onMouseMoveHandler(e.touches[0]);
		if(selectedIndex>0 && selectedIndex<maxCount)
			e.preventDefault();
	}
}

function onTouchEndHandler(e)
{
	//alert("up");
	//e.stopPropagation();
	if(e.touches.length==0 && fingerDown)
	{
		e.preventDefault();
		onMouseUpHandler(e.changedTouches[0]);
		fingerDown = false;
	}
}

function handleReturnFalse(e)
{
	e.preventDefault();
	return false;
}

function setup(data, ir, bth, ath, sdh, container)
{
	itemRendererDom = ir;
	dataProvider = data;
	beforeTweenHandler = bth;
	afterTweenHandler = ath;
	setDataHandler = sdh;


	// window.onmousedown = onMouseDownHandler;
	// window.onmouseup = onMouseUpHandler;
	// window.onmouseout = onMouseOutHandler;
	// theWindow.ontouchstart = onTouchStartHandler;
	// theWindow.ontouchend = onTouchEndHandler;
	// window.onselectstart = handleReturnFalse;
	// window.ondragstart = handleReturnFalse;
	
	var sizer = window.document.createElement("li");
	window.document.body.appendChild(sizer);
	var number = Math.round(window.document.body.offsetHeight/sizer.offsetHeight * 1.8);//43 is the height
	
	var listHTML = '<div name="testList" style="position: absolute; top: 0; left: 0;right: 0; bottom: 0"></div>';
	var scrollHTML = '<div style="height: ' + (dataProvider.length * sizer.offsetHeight) +'px; width: 1px; position: absolute; background: red"></div>';

	container.innerHTML = listHTML + scrollHTML;

	theWindow = container.firstChild;
	theWindow.className = "list";

	window.document.body.removeChild(sizer);

	var theHTML = "<ul style=\"position: relative\">";
	
	for(var i=0; i<=number; i++)
	{
		theHTML += "<li></li>";
	}
	
	theHTML += "</ul>";
	theWindow.innerHTML = theHTML;
	theList = theWindow.children[0];
	initItemRenderers();
	initDimensions();
	setSelectedIndex(0, false);

	recordCords(0,0);


	container.onscroll = function(){
		theWindow.style.marginTop = this.scrollTop + 'px';

		if(!dataProvider || !dataProvider.length) return;

		var relativeEventY = this.scrollTop-this.scrollHeight;
		
		computeChange(this.scrollLeft, this.scrollTop);
		setSelectedIndex(selectedIndex-cy/rowHeight, false);
		recordCords(this.scrollLeft, this.scrollTop);
	}
}



function varDump(obj)
{
	for(var prop in obj)
	{
		if(typeof(obj[prop])!="function")
		{
			console.log(prop + ": " + obj[prop]);
		}
	}
}

function setItemRendererVisibility(visible)
{
	
	for(var i=0; i<theList.children.length; i++)
	{
		if(visible)
		{
			afterTweenHandler(theList.children[i]);
		}
		else
		{
			beforeTweenHandler(theList.children[i]);
		}
		
	}
	
	if(!visible)
	{
		/*if(window.stop !== undefined)
		{
		     window.stop();
		}
		else if(document.execCommand !== undefined)
		{
		     document.execCommand("Stop", false);
		}*/
	}
}


function getScriptLoaded()
{
	return true;
}
	
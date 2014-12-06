SmoothBigList = function(){
	var px=0;
	var py=0;
	var cx=0;
	var cy=0;
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
	var startArrayElement = -1;
	var maxCount;
	var itemRendererDom;
	var setDataHandler;
	var scrollOffset;
	var availHeight;

	function recordCords(x,y){
		px = x;
		py = y;
	}

	function computeChange(x,y){
		cx = px-x;
		cy = py-y;
	}

	function initDimensions(){
		if(theList.children){
			if(!inited){
				rowHeight = theList.children[0].offsetHeight;
				maxRows = (theList.offsetHeight-availHeight)/rowHeight;
				visibleRows = (availHeight/rowHeight);
				availRows = theList.children.length;
				hiddenRows = availRows - visibleRows;
				var mod = hiddenRows % 2;
				topHiddenRows = Math.floor(hiddenRows/2);
				bottomHiddenRows = topHiddenRows + mod;
				maxCount = Math.max(0,dataProvider.length-visibleRows);
				
				for(var x=0; x<theList.children.length; x++){
					theList.children[x].originalOrder = x;
				}
				
				inited = true;
			}
		}
	}

	function setSelectedIndex(value){
		var oldSelectedIndex = selectedIndex;
		var val = value;
		
		if(val<0){
			val = 0;
		}
		else if(val>maxCount){
			val = maxCount;
		}
		
		if(selectedIndex!=val){
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
			
			if(selectedIndex>oldSelectedIndex){
				minTopRows--;
			}
			else if(selectedIndex<oldSelectedIndex){
				minBottomRows--;
			}
			
		
			while(rowsOnBottom<minBottomRows){
				toMove = theList.children[0];
				theList.removeChild(toMove);
				theList.appendChild(toMove)
				rowsOnBottom++;
				rowsOnTop--;
			}
			
			while(rowsOnTop<minTopRows) {
				toMove = theList.children[theList.children.length-1];
				theList.removeChild(toMove);
				theList.insertBefore(toMove,theList.children[0]);
				rowsOnTop++;
				rowsOnBottom--;
			}

			rowsOnTop = availRows-visibleRows-rowsOnBottom; 

			// var start = Math.ceil(selectedIndex-rowsOnTop);

			topOffset = Math.max(0,Math.floor(selectedIndex-rowsOnTop));
	               
	       	var start = Math.ceil(selectedIndex)-Math.ceil(rowsOnTop);
				
			if(start!=startArrayElement){
				var end = start+availRows;
				var visibleData = dataProvider.slice(start, end);
				
				var domElement;
				var dataItem;
				
				for(var i=0; i<visibleData.length; i++) {
					if(theList.children[i].data!=visibleData[i]) {
						dataItem = visibleData[i];
						domElement = theList.children[i];
						domElement.data = dataItem;
						
						setDataHandler(dataItem, domElement);
					}
				}
				
				startArrayElement = start;
			}
		
		
			theList.style.top = Math.max(0, scrollOffset - ((selectedIndex-topOffset)*rowHeight));
		}
		
	}

	function extractDataPointerMap(obj,domE) {
		var theChild;
		var childDescriptor;
		for(var i=0; i<domE.children.length; i++) {
			theChild = domE.children[i];
			if(theChild.getAttribute("data-accessorName")) {
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

	function applyDataMap(childMap, domE) {
		for(var prop in childMap) {
			if(prop != "relativeIndex") {
				
				domE[prop] = domE.children[childMap[prop].relativeIndex];
				applyDataMap(childMap[prop], domE.children[childMap[prop].relativeIndex]);
			}
				
		}
	}

	function initItemRenderers() {
		var payload = itemRendererDom.innerHTML;
		var childMap = extractDataPointerMap(new Object(), itemRendererDom);
		var theChild;
		
		for(var i=0; i<theList.children.length; i++) {
			theChild = theList.children[i];
			theChild.innerHTML = payload;
			
			applyDataMap(childMap, theChild);
		}
	}

	this.setup = function setup(options) {
		availHeight = screen.availHeight;

		itemRendererDom = options.itemRenderer;
		dataProvider = options.dataProvider;
		setDataHandler = options.setDataCallback;
		var container = options.container;
		
		var sizer = window.document.createElement("li");
		window.document.body.appendChild(sizer);
		var sizerHeight = sizer.offsetHeight;

		var number = Math.round(availHeight/sizer.offsetHeight) * 2;
		var scrollHeight = ((dataProvider.length) * sizer.offsetHeight);
		var listHTML = '<div style="position: absolute; height: 100%; width: 100%; margin: 0; padding: 0"></div>';
		var scrollHTML = '<div style="max-height: ' + scrollHeight +'px; height: ' + scrollHeight + 'px; width: 1px; position: absolute; margin: 0; padding: 0"></div>';

		container.innerHTML = listHTML + scrollHTML;
		theWindow = container.firstChild;
		window.document.body.removeChild(sizer);

		var theHTML = "<ul style=\"position: relative\">";
		
		for(var i=0; i<=number; i++) {
			theHTML += "<li></li>";
		}
		
		theHTML += "</ul>";
		theWindow.innerHTML = theHTML;
		theList = theWindow.children[0];
		initItemRenderers();
		initDimensions();
		setSelectedIndex(0, false);

		recordCords(0,0);

		if(scrollHeight > 33554428){
			throw "The list is too big";
		}

		var callback = function(){
			if(container.scrollTop == scrollOffset) return;
			if(!dataProvider || !dataProvider.length) return;

			scrollOffset = Math.max(0,container.scrollTop);
			scrollOffset = Math.min(scrollOffset, scrollHeight);
			
			computeChange(container.scrollLeft, scrollOffset);
			setSelectedIndex(selectedIndex-cy/rowHeight, false);
			recordCords(container.scrollLeft, scrollOffset);
		};

		window.setInterval(callback, 1000/60);
	}  
}
		
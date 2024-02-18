var SunriseSunsetJS=function(t){"use strict";var e=90.8333;function n(t){return Math.sin(2*t*Math.PI/360)}function a(t){return 360*Math.acos(t)/(2*Math.PI)}function r(t){return Math.cos(2*t*Math.PI/360)}function u(t,e){var n=t%e;return n<0?n+e:n}function i(t,e,i,o,M){var h,c,f=function(t){return Math.ceil((t.getTime()-new Date(t.getFullYear(),0,1).getTime())/864e5)}(M),s=e/15,l=i?f+(6-s)/24:f+(18-s)/24,g=.9856*l-3.289,v=u(g+1.916*n(g)+.02*n(2*g)+282.634,360),P=.91764*(h=v,Math.tan(2*h*Math.PI/360));c=u(c=360/(2*Math.PI)*Math.atan(P),360),c+=90*Math.floor(v/90)-90*Math.floor(c/90),c/=15;var D,I=.39782*n(v),S=r((D=I,360*Math.asin(D)/(2*Math.PI))),d=(r(o)-I*n(t))/(S*r(t)),w=u((i?360-a(d):a(d))/15+c-.06571*l-6.622-e/15,24),T=Date.UTC(M.getFullYear(),M.getMonth(),M.getDate());return new Date(T+36e5*w)}return t.getSunrise=function(t,n,a){return void 0===a&&(a=new Date),i(t,n,!0,e,a)},t.getSunset=function(t,n,a){return void 0===a&&(a=new Date),i(t,n,!1,e,a)},Object.defineProperty(t,"__esModule",{value:!0}),t}({});

const sunrise = SunriseSunsetJS.getSunrise(35.0078, -97.0929);
const sunset = SunriseSunsetJS.getSunset(35.0078, -97.0929);
const sunriseHour = sunrise.getHours();
const sunsetHour = sunset.getHours();

//console.log("sunrise = " + sunriseHour);
//console.log("sunset = " + sunsetHour);

Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
	var dayOfYear = ((today - onejan + 86400000)/86400000);
	return Math.ceil(dayOfYear/7)
};

function formatDate(date){
	try {
		const y = date.getFullYear();
		const m = (date.getMonth()+1).toString().padStart(2,'0');
		const d = date.getDate().toString().padStart(2,'0');
		return y + "-" + m + "-" + d;
	} catch (error){
		console.log("ERROR: invoking dateFormat(...) with NULL");
		console.log("date object = ", date);
		console.log("ERROR = ", error);
	}
	return "2000-01-01";
}

function isDateInRange(y,m,d){
	const str = y + "-" + m.padStart(2,'0') + "-" + d.padStart(2,'0');
 	const tmpDate = new Date(str);
    var ret = (tmpDate >= dateRangeFrom && tmpDate <= dateRangeTo);
	return ret;
}

function daysBetweenDates(a,b){
	let diff = a.getTime() - b.getTime();
	let diffDays = Math.abs(Math.round(diff/(1000*3600*24)));
	return diffDays;
}

function countOfSpecifiedMonthInDateRange(fromDate, toDate, month){
	var count = 0;
	var indexDate = new Date(fromDate);
	indexDate.setDate(1); // reset to first of month to avoid rolling over
	while( indexDate <= toDate ){
		if(indexDate.getMonth()+1 == month){
			count = count + 1;
		}
		indexDate = new Date(indexDate.getFullYear(), indexDate.getMonth()+1, 1);
	}
	return count;
}

function transformMapToD3DataArray(theMap) {
    var m = [];
    for( const [key, value] of theMap.entries()){
		const o = {};
		o["year"] = key;
		o["observations"] = value;
		m.push(o);
    }
    return m;
}
const cameraArray = ["TOP","MIDDLE","HOUSE"];
const monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function numericToTextMonth(month){
	return monthArray[ month -1 ];
}

function calculateMinMaxDateRange(DATA){
	var oD = new Date();
	var nD = new Date();
    // First and last day in the dataset
    DATA.forEach((image) => {
        const tmpDate = new Date(image.year, (image.month-1), image.day);
        if(tmpDate < oD){
			oD = new Date(tmpDate);
        }
        if(tmpDate > nD){
			nD = new Date(tmpDate);
        }
    });
	return [oD, nD];
}



// Repeatable graph creation, StackedHBAR
function createStackedHBarGraph(divName, title, dataObject, barLabel, groupLabel, valueLabel,  widthScale = 1, heightScale = 1, daytimeIndicator = false){
	if(dataObject == null){
		console.log("ERROR: Invoked createHBarGraph with dataObject null");
	}
	// Remove old SVGs
	const myNode = document.getElementById(divName.substring(1));
	while(myNode && myNode.firstChild){
		myNode.removeChild(myNode.lastChild);
	}

    let margin = {top: 30, right: 30, bottom: 70, left: 60},
	width = (460*widthScale) - margin.left - margin.right,
	height = (400*heightScale) - margin.top - margin.bottom;
	// expect obj { barLabel: ... , groupLabel: ... , valueLabel: ... } 
	// for ex	{ year: 2010, camera: "TOP", observations: 100 }

	// figure out X labels, and combined max X label (for Y scale)
	var distinctBarLabels = [];
	dataObject.forEach( (row) => {
		if( distinctBarLabels.indexOf(row[barLabel]) === -1 ){
			distinctBarLabels.push( row[barLabel] );
		}
	});
	//console.log("distinct bar labels: ", distinctBarLabels);
	var distinctGroupLabels = [];
	dataObject.forEach( (row) =>{
		if(distinctGroupLabels.indexOf(row[groupLabel]) === -1){
			distinctGroupLabels.push(row[groupLabel]);
		}
	});
	distinctGroupLabels.sort();
	//console.log("distinct group labels: ", distinctGroupLabels);

	let maxPerRow = 0;
	distinctBarLabels.forEach( (row) => {
		const subset = dataObject.filter( function(d) {
			return d[barLabel] === row;
		});
		let sum = subset.reduce( function(a,d){
			return a + +(d[valueLabel]);
		},0);
		if(sum > maxPerRow){
			maxPerRow = sum;
		}
	});

	//console.log("Max accumulated value for one row is: " , maxPerRow);

    // append the svg object to the body of the page
    let svg = d3.select(divName)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

    // Specific to Stacked BHar
	var color = d3.scaleOrdinal()
		.domain(distinctGroupLabels)
		.range(d3.schemeSet1);

	// Add X axis
	var x = d3.scaleBand()
		.domain(distinctBarLabels)
		.range([0, width])
		.padding([0.2])

    svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, Math.ceil( 1.1 * maxPerRow)])
		.range([ height, 0 ]);
	svg.append("g")
		.call(d3.axisLeft(y));

	var stackedData = d3.stack()
		.keys(d3.union(dataObject.map(d => d[groupLabel])))
		.value(([,group], key) => group.get(key)[valueLabel])
		(d3.index(dataObject, d => d[barLabel], d => d[groupLabel]));

	// Show the bars
	svg.append("g")
		.selectAll("g")
		// Enter in the stack data = loop key per key = group per group
		.data(stackedData)
		.enter().append("g")
			.attr("fill", function(d) { return color(d.key); })
			.selectAll("rect")
			// enter a second time = loop subgroup per subgroup to add all rectangles
			.data(function(d) { return d; })
				.enter().append("rect")
					.attr("x", function(d) { return x(d.data[0]); })
					.attr("y", function(d) { return y(d[1]); })
					.attr("height", function(d) { return y(d[0]) - y(d[1]); })
					.attr("width",x.bandwidth());

	//// Group labels
	// Circle
	var keys = distinctGroupLabels;
	svg.selectAll("mydots")
		.data(keys)
		.enter()
		.append("circle")
			.attr("cx", function(d,i){ return 30 + i*100;})
			.attr("cy", function(d,i){ return height+58})
			.attr("r", 7)
			.style("fill", function(d){ return color(d)})
	// Text
	svg.selectAll("mylabels")
		.data(keys)
		.enter()
		.append("text")
			.attr("x", function(d,i){ return 45 + i*100;})
			.attr("y", function(d,i){ return height+60;}) 
			.style("fill", function(d){ return color(d)})
			.style("font-size", "14px")
			.text(function(d){ return d})
			.attr("text-anchor", "left")
			.style("alignment-baseline", "middle");

	// Graph title
    svg.append("text")
		.attr("x", (width / 2))
		.attr("y", 0 - (margin.top / 2))
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.text(title);

	// Attempt to add sunrise and sunset, if bar labels are "Jan 01 03:00"
	if(daytimeIndicator && distinctBarLabels.length > 0 && distinctBarLabels[0].length >= 10){
		const regex = /^[A-Z][a-z][a-z]\s\d+\s(\d\d):\d\d$/;
		let match = distinctBarLabels[0].match(regex);
		if(match){
			const daytimeArr = [];
			//console.log("match = " + match[1]);
			for(let i=0;i<distinctBarLabels.length;i++){
				match = distinctBarLabels[i].match(regex);
				const hour = match[1];
				if( hour >= sunriseHour && hour <= sunsetHour ){
					daytimeArr.push(i);
				}
			}

			// Adding small orange dots to show daytime
			svg.selectAll("daytimeDots")
				.data(daytimeArr)
				.enter()
				.append("circle")
					.attr("cx", function(d,i){ return 10 + d*18;})
					.attr("cy", function(d,i){ return height-8})
					.attr("r", 3)
					.style("fill", "orange"); 
			}
	}
}

// Repeatable graph creation, HBAR
function createHBarGraph(divName, title, dataObject, leftKey, rightKey, widthScale = 1, heightScale = 1) {
	// error flagging
	if(dataObject == null){
		console.log("ERROR: Invoked createHBarGraph with dataObject null");
	}
	// Remove old SVGs
	const myNode = document.getElementById(divName.substring(1));
	while(myNode && myNode.firstChild){
		myNode.removeChild(myNode.lastChild);
	}

	//
    let margin = {top: 30, right: 30, bottom: 70, left: 60},
	width = (460*widthScale) - margin.left - margin.right,
	height = (400*heightScale) - margin.top - margin.bottom;

    const maxObs = dataObject.reduce(
    	function(acc, obj){
		return Math.max(obj[rightKey], acc);
	}, 0);

    // append the svg object to the body of the page
	let svg = d3.select(divName)
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
			  "translate(" + margin.left + "," + margin.top + ")");

    // x axis
    let x = d3.scaleBand()
	.range([0, width])
	.domain( dataObject.map(function(d) { return d[leftKey] }))
	.padding(0.2);
    svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

    // y axis
    let y = d3.scaleLinear()
      .domain([0, maxObs * 1.1])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
	if(maxObs > 0){
		svg.selectAll("mybar")
			.data(dataObject)
			.enter()
			.append("rect")
				.attr("x", function(d) { return x(d[leftKey]); })
				.attr("y", function(d) { return y(d[rightKey]); })
				.attr("width", x.bandwidth())
				.attr("height", function(d) { return height - y(d[rightKey]); })
				.attr("fill", "#69b3a2");
	}

    svg.append("text")
		.attr("x", (width / 2))
		.attr("y", 0 - (margin.top / 2))
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.text(title);
}


function createPieChart(divName, title, dataObject){
	const width = 450,
		height = 450,
		margin = 40;

		// Remove old SVGs
		const myNode = document.getElementById(divName.substring(1));
		while(myNode && myNode.firstChild){
			myNode.removeChild(myNode.lastChild);
		}


	// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
	const radius = Math.min(width, height) / 2 - margin

	// append the svg object to the div called 'my_dataviz'
	const svg = d3.select(divName)
	  .append("svg")
		.attr("width", width)
		.attr("height", height)
	  .append("g")
		.attr("transform", `translate(${width / 2}, ${height / 2})`);

	const data = {};
	for(const [key,value] of Object.entries(dataObject)){
		data[ value.category ] = +value.count;
	}

	// set the color scale
	const color = d3.scaleOrdinal()
	  .range(d3.schemeSet2);

	// Compute the position of each group on the pie:
	const pie = d3.pie()
	  .value(function(d) {return d[1]});

	const data_ready = pie(Object.entries(data));

	// shape helper to build arcs:
	const arcGenerator = d3.arc()
	  .innerRadius(0)
	  .outerRadius(radius);

	// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
	svg
	  .selectAll('mySlices')
	  .data(data_ready)
	  .join('path')
		.attr('d', arcGenerator)
		.attr('fill', function(d){ return(color(d.data[0])) })
		.attr("stroke", "black")
		.style("stroke-width", "2px")
		.style("opacity", 0.7);

	// Now add the annotation. Use the centroid method to get the best coordinates
	svg
	  .selectAll('mySlices')
	  .data(data_ready)
	  .join('text')
	  .text(function(d){ return d.data[0]})
	  .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
	  .style("text-anchor", "middle")
	  .style("font-size", 17);

		svg.append("text")
			.attr("x",1) 
			.attr("y", -200 )
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.text(title);

}

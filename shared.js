// First graph - Observation per month 
// Declare the chart dimensions and margins.
function transformMapToD3DataArray(theMap) {
    m = [];
    for( const [key, value] of theMap.entries()){
	const o = {};
	o["year"] = key;
	o["observations"] = value;
	m.push(o);
    }
    return m;
}

const monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function numericToTextMonth(month){
	return monthArray[ month -1 ];
}

// Repeatable graph creation, HBAR
function createHBarGraph(divName, title, dataObject, leftKey, rightKey, widthScale = 1, heightScale = 1){
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

    svg.selectAll("mybar")
      .data(dataObject)
      .enter()
      .append("rect")
	.attr("x", function(d) { return x(d[leftKey]); })
	.attr("y", function(d) { return y(d[rightKey]); })
	.attr("width", x.bandwidth())
	.attr("height", function(d) { return height - y(d[rightKey]); })
	.attr("fill", "#69b3a2");

    svg.append("text")
	.attr("x", (width / 2))
	.attr("y", 0 - (margin.top / 2))
	.attr("text-anchor", "middle")
	.style("font-size", "16px")
	.text(title);
}

///////// BEGIN MAIN DATA PROCESSING ////////////

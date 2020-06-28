var parser = new DOMParser();

// fetches the data series from the xmlhttp.do endpoint
async function fetchSeries(table, groupBy, filter) {
	const formData = new URLSearchParams();
	formData.append("sysparm_processor", "ChartDataProcessor");
	formData.append("sysparm_request_params", JSON.stringify({
	  "table": table,
	  "group_by": groupBy,
	  "filter": filter,
	  "series": [
	    {
	      "table": table,
	      "groupby": groupBy,
	      "filter": filter,
	      "plot_type": "bar"
	    }
	  ],
	  "report_uuid": "builder",
	  "page_num": 0
	}));

	let resp = await fetch("/xmlhttp.do", {
	  "headers": {
	    "accept": "application/xml, text/xml, */*; q=0.01",
	    "accept-language": "en-US,en",
	    "content-type": "application/x-www-form-urlencoded",
	    "sec-fetch-dest": "empty",
	    "sec-fetch-mode": "cors",
	    "sec-fetch-site": "same-origin",
	    "x-usertoken": getUserToken(),
	  },
	  "referrerPolicy": "same-origin",
	  "body": formData,
	  "method": "POST",
	  "mode": "cors",
	  "credentials": "include"
	});

	if (!resp.ok) {
		console.log('Failed to fetch series, response: ' + resp);
		return null;
	}

	let bdy = await resp.text();
	let xml = parser.parseFromString(bdy, 'text/xml');
	let chartDataResponse = JSON.parse(xml.getElementsByTagName('CHART_DATA_RESPONSE')[0].childNodes[0].nodeValue);
	if (chartDataResponse.STATUS !== 'SUCCESS') {
		console.log('Failed to fetch series, response: ' + xml);
		return null;
	}
	return JSON.parse(chartDataResponse.CHART_DATA).series[0];
}

// transforms the fetched series as follows:
// - reduce to max of 5 items. If more, keep the most dominant 4 and add an "other" entry
// - transform from arrays to array of entries [{"name": "whatever", "value": 4}, {"name": "another", "value": 5}]
function transformSeries(series) {
	const retval = [];
	let i=0;
	for (; i<Math.min(series.xvalues.length, 4); i++) {
    	retval.push({
    		name: series.xvalues[i],
    		value: parseFloat(series.yvalues[i])
    	});
    }

    if (i < series.xvalues.length) {
    	let sum = 0;
    	while (i < series.xvalues.length)
    		sum += parseFloat(series.yvalues[i++]);

    	retval.push({
    		name: 'other',
    		value: sum
    	})
    }

    return retval;
}

// creates an S3 bar chart
function barChart(svgElem, width, height, series) {
	const svg = d3.select(svgElem);

	const margin = {top: 10, right: 0, bottom: 20, left: 10};

	y = d3.scaleBand()
	      .domain(series.map(d => d.name))
	      .range([height - margin.bottom, margin.top])
	      .padding(0.1);

	x = d3.scaleLinear()
          .domain([0, d3.max(series, d => d.value)])
          .nice()
          .range([margin.left, width - margin.right]);

    yAxis = g => g
        .attr("transform", `translate(${margin.left},-5)`)
        .call(d3.axisRight(y).tickSizeOuter(0));

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove());

	svg.append("g")
        .attr("fill", "#2f7ed8")
	    .selectAll("rect").data(series).enter()
	        .append("rect")
            .attr("x", d => x(0))
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth() - 20) // leave room for text
            .attr("transform", "translate(0,20)")
            .attr("width", d => x(d.value) - x(0));
  
	svg.append("g")
	  .call(xAxis);

	svg.append("g")
	  .call(yAxis);

	return svg.node();
}
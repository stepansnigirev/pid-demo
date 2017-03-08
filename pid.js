Highcharts.theme = {
	colors: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628"]
}
Highcharts.setOptions(Highcharts.theme);

function Bulk(options){
	var bulk = options;
	bulk.evaluate = function(dt, heat_rate){
		var qhd = bulk.kappa_int * (bulk.t_heat - bulk.t_det) * dt;
		var qho = bulk.kappa_ext * (bulk.t_heat - bulk.t_ext) * dt;
		var qdo = bulk.kappa_ext * (bulk.t_det - bulk.t_ext) * dt;
		var qh = bulk.q_in * heat_rate * dt;
		bulk.t_heat += (qh - qho - qhd) / bulk.c_heat;
		bulk.t_det += (qhd - qdo) / bulk.c_det;
	}
	return bulk;
}

function PID(options){
	var blk = options.system;
	var data_heat = [];
	var data_det = [];
	var dt = options.dt;
	var tset = options.tset;
	for (var t = 0; t < options.t; t+=dt) {
		data_heat.push([t,blk.t_heat]);
		data_det.push([t,blk.t_det]);
		switch(options.mode){
			case "relay":
				out = (blk.t_det < tset) ? 1 : 0;
				break
			default:
				out = 0;
		}
		blk.evaluate(dt,out);
	}
	Highcharts.chart(options.element, {
		chart: {
            zoomType: 'x'
        },
		title: "",
	    yAxis: {
	        title: {
	            text: 'Temperature (°C)'
	        }
	    },
	    xAxis: {
	        title: {
	            text: 'Time (min)'
	        }
	    },

	    series: [{
	        name: 'Heating region',
	        data: data_heat
	    },{
	        name: 'Detection region',
	        data: data_det
	    }]

	});
}
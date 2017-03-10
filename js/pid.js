Highcharts.theme = {
	colors: ["#e41a1c", "#ff7f00", "#377eb8", "#4daf4a", "#984ea3", "#ffff33", "#a65628"]
}
var colors = {
	red: "#e41a1c",
	orange: "#ff7f00",
	blue: "#377eb8",
	green: "#4daf4a",
	violet: "#984ea3",
	yellow: "#ffff33",
	brown: "#a65628",
}

Highcharts.setOptions(Highcharts.theme);

function doMagic(options){
	(function(){
		var element = options.element;
		var loaded = false;
		var doPlot = function(){
			if(!loaded && isVisible(element)){
				loaded=true;
				var series = [];
				if(options.pids){
					for (var i = 0; i < options.pids.length; i++) {
						var opts = Object.assign({}, options.common, options.pids[i]);
						var pid = PID(opts);
						var data = pid();
						series.push(Object.assign({
					        name: opts.label || "Measured temperature",
					        data: data.t_det,
					    }, opts.chart || {}));
					}
				}else{
					var pid = PID(options);
					var data = pid();
					series.push({
				        name: options.label || "Measured temperature",
				        data: data.t_det
				    });
				}
			    setTimeout(function(){
				    plot(element, series);
			    },0);
			}
		}
		window.addEventListener("load", doPlot, false);
		window.addEventListener("scroll", doPlot);
	})()
}

function isVisible(element) {
	var el = document.getElementById(element);
	var top = el.offsetTop;
	var left = el.offsetLeft;
	var width = el.offsetWidth;
	var height = el.offsetHeight;

	while(el.offsetParent) {
		el = el.offsetParent;
		top += el.offsetTop;
		left += el.offsetLeft;
	}

	return (
		top < (window.pageYOffset + window.innerHeight) &&
		left < (window.pageXOffset + window.innerWidth) &&
		(top + height) > window.pageYOffset &&
		(left + width) > window.pageXOffset
	);
}

function plot(element, series=[{name: "Sample chart", data: [1,3,2,4,5]}], callback=null){
	return Highcharts.chart(element, {
		chart: {
            zoomType: 'x'
        },
	    plotOptions: {
	        series: {
	            marker: {
	                fillColor: '#FFFFFF',
	                lineWidth: 2,
	                lineColor: null, // inherit from series
	                symbol: "circle",
	                enabled: false
	            }
	        }
	    },
	    tooltip: {
	        formatter: function() {
		        return this.x.toFixed(2) + '<br>' +
		        	'<b style="color: '+this.point.color + '; font-weight: bold;">' +
		        	this.series.name + '</b>: <b>' +
		        	this.y.toFixed(2) + '</b> °C';
		    }
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

	    series: series

	});
}

function Bulk(options){
	var bulk = Object.assign({},options);
	bulk.heat_data = [[0, bulk.t_heat]];
	bulk.det_data = [[0, bulk.t_det]];
	bulk._t = 0;
	bulk._evaluate = function(dt, heat_rate){
		var qhd = bulk.kappa_int * (bulk.t_heat - bulk.t_det) * dt;
		var qho = bulk.kappa_ext * (bulk.t_heat - bulk.t_ext) * dt;
		var qdo = bulk.kappa_ext * (bulk.t_det - bulk.t_ext) * dt;
		var qh = bulk.q_in * heat_rate * dt;
		bulk.t_heat += (qh - qho - qhd) / bulk.c_heat;
		bulk.t_det += (qhd - qdo) / bulk.c_det;
		bulk._t += dt;
		var lastt = bulk.det_data[bulk.det_data.length-1][0];
		if(bulk._t - lastt >= bulk.t_sample){
			bulk.heat_data.push([bulk._t, bulk.t_heat]);
			bulk.det_data.push([bulk._t, bulk.t_det]);
		}
	};
	bulk.evaluate = function(dt, heat_rate){
		for (var t = 0; t < dt; t+=options.dt) {
			var delta = (t+options.dt < dt) ? options.dt : (dt-t)
			bulk._evaluate(delta, heat_rate);
		}
	};
	return bulk;
}

function PID(opt){
	var options = Object.assign({
		umin: -1,
		umax: 1,
	}, opt);
	var blk = options.system;
	var dt = options.dt;
	var tset = options.tset;

	var ramp_mult = (options.tset > blk.t_det) ? 1 : -1;
	if(options.ramp_speed && options.ramp_mode == "setpoint"){
		tset = blk.t_det;
	}

	var lastt = 0;
	var integral = 0;
	var oldt = blk.t_det;
	var mode = options.mode;

	if(options.ramp_speed && (options.ramp_mode == "pi")){
		mode = "ramp";
	}
	var tinit = blk.t_det;
	// var out_arr = [];

	return function(){
		for (var t = 0; t < options.t; t+=dt) {

			if(options.ramp_speed && (options.ramp_mode == "setpoint") && (tset * ramp_mult < options.tset * ramp_mult)){
				tset += options.ramp_speed * dt;
				if(tset * ramp_mult > options.tset * ramp_mult){
					tset = options.tset;
				}
			}
			if(mode=="ramp" && (options.tset * ramp_mult <= blk.t_det * ramp_mult)){
				mode = options.mode;
			}


			var out = 0;
			switch(mode){
				case "relay":
					out = (blk.t_det < tset) ? options.umax : options.umin;
					break
				case "pid":
					var int = integral + options.ki * (tset - blk.t_det) * dt;
					var diff = (blk.t_det - oldt) / dt;
					out = options.kp * (tset - blk.t_det) + integral - options.kd * diff;
					oldt = blk.t_det;
					if(out > options.umax){
						out = options.umax;
					}else{
						if(out < options.umin){
							out = options.umin;
						}else{
							integral = int;
						}
					}
					if(options.nolimit){
						integral = int;
					}
					break;
				case "ramp":
					var diff = (blk.t_det - oldt) / dt;
					out = options.kp * (options.ramp_speed * t + tinit - blk.t_det) + options.kd * (options.ramp_speed - diff);
					if(out > options.umax){
						out = options.umax;
					}
					if(out < options.umin){
						out = options.umin;
					}
					// comparing with pid
					var curtset = options.ramp_speed * t + tinit;
					// var int = integral + options.ki * (curtset - blk.t_det) * dt;
					var diff = (blk.t_det - oldt) / dt;
					out2 = options.kp * (tset - blk.t_det) - options.kd * diff;
					if(out2 > options.umax){
						out2 = options.umax;
					}
					if(out2 < options.umin){
						out2 = options.umin;
					}
					if(out2 * ramp_mult < out * ramp_mult){
						mode = options.mode;
					}
					oldt = blk.t_det;
					break;
				case "step":
					out = (t < options.t_trans) ? options.out_i : options.out_f;
					break;
				case "autotune":
					if(t < options.t_trans){
						out = options.out;
					}else{
						out = (blk.t_det < tset) ? options.out+options.d : options.out-options.d;
					}
					break;
				default:
					out = 0;
			}
			// out_arr.push([t,out]);
			blk.evaluate(dt,out);
		}
		return {
			// out: out_arr,
			t_det: blk.det_data,
			t_heat: blk.heat_data
		}
	}
}
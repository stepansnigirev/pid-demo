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
			if(!loaded){
				loaded=true;
				var series = [];
				if(options.pids){
					for (var i = 0; i < options.pids.length; i++) {
						var opts = Object.assign({}, options.common, options.pids[i]);
						var pid = PID(opts);
						var data = pid();
						series.push(Object.assign({
					        name: opts.label || "Measured temperature",
					        data: data.t_det.splice(1),
					    }, opts.chart || {}));
					}
				}else{
					var pid = PID(options);
					var data = pid();
					series.push({
				        name: options.label || "Measured temperature",
				        data: data.t_det.splice(1)
				    });
				    if(options.mode == "step"){
				    	console.log("step here");
				    	var d = data.t_det;
				    	var tset = options.tset;
				    	var b = d[d.length-1][1] - tset;
				    	var t2 = null;
				    	var t3 = null;
				    	for (var i = 0; i < d.length; i++) {
				    		if( (d[i][1] > tset + 0.5*b) && (t2==null) ){
				    			t2 = d[i][0];
				    		}
				    		if( (d[i][1] > tset + 0.632*b) && (t3==null) ){
				    			t3 = d[i][0];
				    		}
				    	}
				    	var t0 = options.t_trans;
				    	var r = {
				    		b: b,
				    		t0: t0,
				    		t2: t2,
				    		t3: t3
				    	};
				    	r.t1 = (r.t2-r.t3*Math.log(2))/(1-Math.log(2));
				    	r.tau = r.t3 - r.t1;
				    	r.tdel = r.t1 - r.t0;
				    	r.k = b/options.dout;
				    	r.r = r.tdel / r.tau;
				    	console.log(r);
				    	console.log("Just P:");
				    	var kp = (1/r.r/r.k)*(1+r.r/3);
				    	console.log(kp);
				    	console.log("PI:");
				    	kp = (1/r.r/r.k)*(0.9+r.r/12);
				    	var ki = kp * (1/r.tdel) * (9+20*r.r)/(30+3*r.r);
				    	console.log(kp,ki);
				    	console.log("PID:");
				    	kp = (1/r.r/r.k)*(4/3+r.r/4);
				    	ki = kp * (1/r.tdel) * (13+8*r.r)/(32+6*r.r);
				    	var kd = kp * r.tdel * 4/(11+2*r.r);
				    	console.log(kp,ki,kd);
				    }
				}
			    setTimeout(function(){
				    plot(element, series);
			    },0);
			}
		}
		// window.addEventListener("load", doPlot, false);
		// window.addEventListener("scroll", doPlot);
		doPlot();
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
		        },
		        gridLineColor: '#aaa',
		        gridLineWidth: 1,
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
	bulk.offset = 0;
	bulk._evaluate = function(dt, heat_rate){
		bulk.t_det -= bulk.offset;
		bulk.offset = options.noize * (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 2.5)/5;
		var qhd = bulk.kappa_int * (bulk.t_heat - bulk.t_det) * dt;
		var qho = bulk.kappa_ext * (bulk.t_heat - bulk.t_ext) * dt;
		var qdo = bulk.kappa_ext * (bulk.t_det - bulk.t_ext) * dt;
		var qh = bulk.q_in * heat_rate * dt;
		bulk.t_heat += (qh - qho - qhd) / bulk.c_heat;
		bulk.t_det += (qhd - qdo) / bulk.c_det;
		bulk._t += dt;
		var lastt = bulk.det_data[bulk.det_data.length-1][0];
		bulk.t_det += bulk.offset;
		if(bulk._t - lastt >= bulk.t_sample){
			bulk.heat_data.push([bulk._t, bulk.t_heat]);
			bulk.det_data.push([bulk._t, bulk.t_det + bulk.offset]);
		}
	};
	bulk.evaluate = function(dt, heat_rate){
		for (var t = 0; t < dt; t+=options.dt) {
			var delta = (t+options.dt < dt) ? options.dt : (dt-t)
			bulk._evaluate(delta, heat_rate);
		}
	};
	bulk.getSteadyState = function(tset){
		var d = {
			t_heat: tset+bulk.kappa_ext * (tset - bulk.t_ext) / bulk.kappa_int,
			t_det: tset,
			out: 0
		}
		d.out = (bulk.kappa_ext * (d.t_heat - bulk.t_ext) + bulk.kappa_int * (d.t_heat - tset))/bulk.q_in;
		return d;
	};
	return bulk;
}

function PID(opt){
	var options = Object.assign({
		umin: -10,
		umax: 10,
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
	if(mode == "step" || mode == "autotune"){
		var d = blk.getSteadyState(options.tset);
		blk.t_det = d.t_det;
		blk.t_heat = d.t_heat;
		if(mode == "step"){
			options.out_i = d.out;
			options.out_f = d.out + options.dout;
		}else{
			options.out = d.out;
			tset = options.tset - options.dtset;
		}
	}
	var falling = true;

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
						if(falling){
							out = (blk.t_det < tset) ? options.out+options.d : options.out-options.d;
							falling = (blk.t_det > tset);
						}else{
							out = (blk.t_det < tset + 2 * options.dtset) ? options.out+options.d : options.out-options.d;
							falling = (blk.t_det > tset + 2 * options.dtset);
						}
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
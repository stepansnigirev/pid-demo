var common = {
	tset: 200,
	q_in: 10000,
	c_heat: 3,
	c_det: 3,
	t_room: 20,
	kappa_int: 30,
	kappa_ext: 3,
	dt: 0.000001,
	t: 1,
	t_sample: 0.001,
}
var system = {
	q_in: common.q_in, // heat that we get from the heating tape
	c_heat: common.c_heat, // heat capacitance of the heating region
	c_det: common.c_det, // heat capacitance of the detection region
	t_heat: common.t_room, // temperature of the heating region
	t_det: common.t_room, // temperature of the detection region
	kappa_int: common.kappa_int, // heat conductivity within a bulk
	kappa_ext: common.kappa_ext, // heat conductivity to external bath
	t_ext: common.t_room,	// external temperature
	dt: common.dt, // simulating step
	t_sample: common.t_sample, // sampling rate for the data array
	noize: 0,
}
var system2 = Object.assign({}, system, {
	q_in: 40000,
});

var my_colors = [
	// "#ffffd4",
	// "#fee391",
	// "#fec44f",
	// "#8c2d04",
	// "#cc4c02",
	// "#ec7014",
	// "#fe9929",
	// "#c6dbef",
	// "#9ecae1",
	"#6baed6",
	"#4292c6",
	"#2171b5",
	"#084594",
]

var app = new Vue({
	el: '#app',
	data: {
		slide: 0,
		step: 0,
		time: +new Date(),
		timeleft: 45,
		slides: [
			{ title: "Digital feedback controllers" },
			{
				title: "A few examples",
				steps: 5,
			},
			{
				title: "Toy model",
				heating: false,
				steps: 5,
				callback: function(){
					app.curslide.heating = !app.curslide.heating;
				},
				init: function(){
					app.curslide.heating = true;
				}
			},
			{
				title: "Relay heating",
				heating: true,
				init: function(){
					doMagic({
						element: "relay-pid",
						tset: common.tset,
						mode: "relay",
						system: Bulk(system),
						dt: common.dt, // time step
						t: common.t, // detection step
					});
				}
			},
			{
				title: "Relay heating",
				heating: true,
				init: function(){
					doMagic({
						element: "relay-pid2",
						tset: common.tset,
						mode: "relay",
						system: Bulk(system),
						dt: 1/600, // time step
						t: common.t, // detection step
					});
				}
			},
			{
				title: "P-controller",
				init: function(){
					doMagic({
						element: "p-pid",
						tset: common.tset,
						mode: "pid",
						kp: 7e-3,
						ki: 0,
						kd: 0,
						system: Bulk(system),
						dt: 1/60, // time step
						t: common.t, // detection step
					});
				}
			},
			{
				title: "PI-controller",
				init: function(){
					doMagic({
						element: "pi-pid",
						tset: common.tset,
						mode: "pid",
						kp: 7e-3,
						ki: 7e-3,
						kd: 0,
						system: Bulk(system),
						dt: 1/60, // time step
						t: common.t, // detection step
					});
				}
			},
			{
				title: "PID-controller",
				init: function(){
					doMagic({
						element: "pid-pid",
						tset: common.tset,
						mode: "pid",
						kp: 3e-2,
						ki: 1.5e-2,
						kd: 8e-4,
						system: Bulk(system),
						dt: 1/60, // time step
						t: common.t, // detection step
					});
				}
			},
			{
				title: "PID-controller",
				init: function(){
					doMagic({
						element: "all-pid",
						pids: [
							{
								kp: 7e-3,
								ki: 0,
								kd: 0,
								system: Bulk(system),
								label: "P",
							},
							{
								kp: 7e-3,
								ki: 7e-3,
								kd: 0,
								system: Bulk(system),
								label: "PI",
							},
							{
								kp: 3e-2,
								ki: 1.5e-2,
								kd: 8e-4,
								system: Bulk(system),
								label: "PID",
							},
						],
						common: {
							tset: common.tset,
							mode: "pid",
							dt: 1/60, // time step
							t: common.t, // detection step
						}
					});
				}
			},
			{
				title: "Autotuning",
				init: function(){
					doMagic({
						element: "large-pid",
						pids: [
							{
								kp: 6e-2,
								ki: 1.5e-2,
								kd: 8e-4,
								system: Bulk(system),
								label: "Large P",
							},
							{
								kp: 3e-2,
								ki: 0.6,
								kd: 8e-4,
								system: Bulk(system),
								label: "Large I",
							},
							{
								kp: 3e-2,
								ki: 1.5e-2,
								kd: 2e-3,
								system: Bulk(system),
								label: "Large D",
							},
							{
								kp: 3e-2,
								ki: 1.5e-2,
								kd: 8e-4,
								system: Bulk(system),
								label: "Normal PID",
								chart: {
									dashStyle: 'shortdot',
									color: "#777",
								}
							},
						],
						common: {
							tset: common.tset,
							mode: "pid",
							dt: 1/60, // time step
							t: common.t, // detection step
						}
					});
				}
			},
			{
				title: "Autotuning",
				steps: 8,
				kp: [3e-3, 1e-2, 3e-2, 5e-2, 7e-2, 8e-2, 9e-2, 8.5e-2],
				callback: function(){
					var s = Bulk(system);
					var o = s.getSteadyState(common.tset);
					s.t_det = o.t_det;
					s.t_heat = o.t_heat;
					doMagic({
						element: "classic-autotune",
						tset: common.tset,
						mode: "pid",
						kp: app.curslide.kp[app.step],
						ki: 0,
						kd: 0,
						system: s,
						dt: 1/60, // time step
						t: common.t, // detection step
						label: "P = "+app.curslide.kp[app.step]
					});
				},
				init: function(){
					app.curslide.callback();
				}
			},
			{ 	title: "Ziegler–Nichols method" 	},
			{	title: "Autotuning: Step responce"	},
			{	title: "Autotuning: Step responce"	},
			{	title: "Autotuning: Relay method"	},
			{	title: "Autotuning: Relay method"	},
			{
				title: "Setpoint ramp",
				heating: true,
				init: function(){
					doMagic({
						element: "ramp-setpoint-pid",
						tset: common.tset,
						mode: "pid",
						kp: 3e-2,
						ki: 2e-1,
						kd: 8e-4,
						ramp_speed: 200,
						ramp_mode: "setpoint",
						system: Bulk(system),
						dt: 1/60, // time step
						t: 2*common.t, // detection step
					});
				}
			},
			{
				title: "Setpoint ramp",
				heating: true,
				init: function(){
					doMagic({
						element: "smart-ramp-pid",
						pids: [
							{
								ramp_mode: "setpoint",
								label: "Simple ramp",
								system: Bulk(system),
								chart: {
									color: colors.red,
								}
							},
							{
								ramp_mode: "pi",
								label: "PI-controlled ramp",
								system: Bulk(system),
								chart: {
									color: colors.blue,
								}
							},
						],
						common: {
							tset: common.tset,
							mode: "pid",
							kp: 3e-2,
							ki: 2e-1,
							kd: 4e-4,
							ramp_speed: 150,
							dt: 1/60, // time step
							t: 2* common.t, // detection step
						}
					});
				}
			},
			{
				title: "Limited output problem",
				heating: true,
				init: function(){
					doMagic({
						element: "integral-problem-pid",
						pids: [
							{
								system: Bulk(system),
								nolimit: true,
								label: "Limited output",
								umax: .5,
								umin: 0,
								chart: {
									color: colors.red,
								}
							},
							{
								system: Bulk(system),
								label: "Unlimited output",
								umax: 100,
								umin: -100,
								nolimit: true,
								chart: {
									color: colors.blue,
								}
							},
						],
						common: {
							tset: common.tset,
							mode: "pid",
							kp: 3e-2,
							ki: 1.5e-2,
							kd: 8e-4,
							dt: 1/60, // time step
							t: common.t, // detection step
						}
					});
				}
			},
			{
				title: "Limited output problem",
				heating: true,
				init: function(){
					doMagic({
						element: "integral-fix-pid",
						pids: [
							{
								system: Bulk(system),
								nolimit: true,
								label: "Default controller",
								chart: {
									color: colors.red,
								}
							},
							{
								system: Bulk(system),
								label: "With integral fix",
								chart: {
									color: colors.blue,
								}
							},
						],
						common: {
							umax: .5,
							umin: 0,
							tset: common.tset,
							mode: "pid",
							kp: 3e-2,
							ki: 1.5e-2,
							kd: 8e-4,
							dt: 1/60, // time step
							t: common.t, // detection step
						}
					});
				}
			},
			{
				title: "Noize and D-part",
				init: function(){
					doMagic({
						element: "d-noize",
						pids: [
							{
								label: "With noize",
								system: Bulk(Object.assign({},system,{noize: 5})),
								chart: {
									color: colors.blue,
								}
							},
							{
								label: "No noize",
								system: Bulk(system),
								chart: {
									color: colors.red,
								}
							},
						],
						common: {
							tset: common.tset,
							mode: "pid",
							kp: 3e-2,
							ki: 1.5e-2,
							kd: 8e-4,
							umax: 0.5,
							umin: 0,
							dt: 1/600, // time step
							t: 1.5*common.t, // detection step
						}
					});
				}
			},
			{
				title: "Noize and autotuning",
				init: function(){
					var s1 = Bulk(system);
					var o1 = s1.getSteadyState(common.tset);
					s1.t_det = o1.t_det;
					s1.t_heat = o1.t_heat;

					var s2 = Bulk(Object.assign({},system,{noize:3}));
					var o2 = s2.getSteadyState(common.tset);
					s2.t_det = o2.t_det;
					s2.t_heat = o2.t_heat;

					var s3 = Bulk(Object.assign({},system,{noize:3}));
					var o3 = s3.getSteadyState(common.tset);
					s3.t_det = o3.t_det;
					s3.t_heat = o3.t_heat;

					doMagic({
						element: "autotune-noize",
						pids: [
							{
								label: "With noize",
								system: s2,
								dtset: 0.01,
								chart: {
									color: colors.red,
									visible: false,
								}
							},
							{
								label: "Noize and range",
								system: s3,
								dtset: 2,
								chart: {
									color: colors.orange,
									visible: false,
								}
							},
							{
								label: "No noize",
								system: s1,
								dtset: 0.01,
								chart: {
									color: colors.blue,
								}
							},
						],
						common: {
							mode: "autotune",
							d: 0.1,
							t_trans: common.t/4,
							tset: 200,
							dt: 1/100, // time step
							t: 2*common.t, // detection step
						}
					});
				}
			},
			{	title: "Mean filter",
				init: function(){
					var data = d3.range(0,100).map(function(d){ return [d, 190 + Math.sqrt(d) + (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 2.5)]});
					var series = [
						{name: "Measured data", data: data},
						// {name: "Mean filter", data: dmean},
						// {name: "Exponential mean filter", data: dexp},
						// {name: "Kalman filter", data: kalman},
					]
					lmax = [2,5,10,20];
					for (var ii = 0; ii < lmax.length; ii++) {
							series.push({name: "Mean over "+lmax[ii],
								color: my_colors[ii],
								visible: false,
								data: data.map(function(d, j, arr){
								var l = (j < lmax[ii]) ? j : lmax[ii];
								var v = 0;
								for(var i = j-l; i <= j; i++){
									v += arr[i][1];
								}
								v = v/(l+1);
								return [d[0], v]
							})
						});
					}
					// var dexp = [data[0]];
					// var k=0.2;
					// for (var i = 1; i < data.length; i++) {
					// 	var v = dexp[dexp.length-1][1];
					// 	dexp.push([data[i][0], data[i][1]*k + (1-k)*v])
					// }
					// var kalman = [data[0]];
					// var kk = 0.1;
					// for (var i = 1; i < data.length; i++) {
					// 	var v = kalman[kalman.length-1][1];
					// 	kalman.push([data[i][0], data[i][1]*kk + (1-kk)*(v+0.5/Math.sqrt(data[i][0]))])
					// }
					setTimeout(function(){
						plot("filters-plot", series)
					},0);
				}
			},
			{	title: "Exponential mean filter",
				init: function(){
					var data = d3.range(0,100).map(function(d){ return [d, 190 + Math.sqrt(d) + (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 2.5)]});
					var series = [
						{name: "Measured data", data: data},
					]
					var dexp = [[data[0]],[data[0]],[data[0]],[data[0]]];
					var k=[0.7, 0.5, 0.2, 0.1];
					for (var ii = 0; ii < k.length; ii++) {
						for (var i = 1; i < data.length; i++) {
							var v = dexp[ii][dexp[ii].length-1][1];
							dexp[ii].push([data[i][0], data[i][1]*k[ii] + (1-k[ii])*v])
						}
						series.push({name: "Mean with k="+k[ii],
							color: my_colors[ii],
							visible: false,
							data: dexp[ii],
						});
					}
					// var kalman = [data[0]];
					// var kk = 0.1;
					// for (var i = 1; i < data.length; i++) {
					// 	var v = kalman[kalman.length-1][1];
					// 	kalman.push([data[i][0], data[i][1]*kk + (1-kk)*(v+0.5/Math.sqrt(data[i][0]))])
					// }
					setTimeout(function(){
						plot("exp-filter-plot", series)
					},0);
				}
			},
			{	title: "Kalman filter"	},
			{	title: "Kalman filter",
				init: function(){
					var data = d3.range(0,100).map(function(d){ return [d, 190 + Math.sqrt(d) + (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 2.5)]});
					var series = [
						{name: "Measured data", data: data},
					]
					var kalman = [[data[0]],[data[0]],[data[0]],[data[0]],[data[0]]];
					var k=[0.7, 0.5, 0.2, 0.1, 0];
					for (var ii = 0; ii < k.length; ii++) {
						for (var i = 1; i < data.length; i++) {
							var v = kalman[ii][kalman[ii].length-1][1];
							kalman[ii].push([data[i][0], data[i][1]*k[ii] + (1-k[ii])*(v+0.5/Math.sqrt(data[i][0]))])
						}
						series.push({name: "Kalman filter with k="+k[ii],
							color: my_colors[ii],
							visible: false,
							data: kalman[ii],
						});
					}
					setTimeout(function(){
						plot("kalman-filter-plot", series)
					},0);
				}
			},
			{	title: "Arduino?"	},
			{	title: ""	},
		],
	},
	computed: {
		curslide: function(){
			return this.slides[this.slide];
		}
	},
	created: function(){
        window.addEventListener('keyup', function(e){
        	switch(e.keyCode){
        		case 33:
        		case 37:
        			app.prev();
        			break;
        		case 34:
        		case 39:
        			app.next();
        			break;
        		case 190:
        			app.animate();
        			break;
        		default:
        			console.log(e.keyCode);
        	}

        });
    },
    watch: {
    	step: function(v){
    		console.log(v);
    		if(app.curslide.callback){
    			app.curslide.callback();
    		}
    	},
    	slide: function(v){
    		if(app.curslide.init){
    			app.curslide.init();
    		}
			var tt = +new Date() - app.time;
			app.timeleft = 45 - Math.round(tt/1000/60);
    	}
    },
	methods: {
		next: function(step=null){
			this.slide++;
			if(step == null){
				if(this.curslide.steps){
					this.step = this.curslide.steps-1;
				}
			}else{
				this.step = step;
			}
			if(this.slide>=this.slides.length){
				this.slide = this.slides.length-1;
			}
		},
		prev: function(){
			this.slide--;
			if(this.slide < 0){
				this.slide = 0;
			}
			if(this.curslide.steps){
				this.step = this.curslide.steps-1;
			}
		},
		animate: function(){
			if(!this.curslide.steps){
				this.next(0);
			}else{
				this.step++;
				if(this.step >= this.curslide.steps){
					this.next(0);
				}
			}
		}
	}
});

// app.slide=11;
// app.slide = app.slides.length-2;
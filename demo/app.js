var app = new Vue({
	el: '#app',
	data: {
		chart: null,
		system: {
			q_in: 1e3, // heat that we get from the heating tape
			c_heat: 3, // heat capacitance of the heating region
			c_det: 3, // heat capacitance of the detection region
			t_heat: 20, // temperature of the heating region
			t_det: 20, // temperature of the detection region
			t_ext: 20,	// external temperature
			kappa_int: 10, // heat conductivity within a bulk
			kappa_ext: 3, // heat conductivity to external bath
			dt: 1e-6, // simulating step
			t_sample: 3e-3, // sampling rate for the data array
		},
		pid: {
			tset: 40,

			// mode: "relay",
			mode: "pid",
			kp: 4e-1,
			ki: 1,
			kd: 1e-2,

			// dt: 1e-6, // relay time step
			dt: 1/60, // relay time step
			t: 1, // simulation range up to t
			umin: -1, // max output value
			umax: 1, // min output value
		}
	},
 	// 	computed: {
	// 	series: function () {
	// 		return [];
	// 	},
	// },
	// watch:{
	// 	series: function(val){
	// 		// this.redraw()
	// 	},
	// },
	methods: {
		getSeries: function(){
			var sys = Bulk(this.system);
			var settings = Object.assign({}, this.pid);
			settings.system = sys;
			var pid = PID(settings);
			var data = pid();
			return [{
				name: "Measured temperature",
				data: data.t_det,
			},{
				name: "Setpoint",
				data: [[0, this.pid.tset],[this.pid.t,this.pid.tset]],
				// data: data.t_heat,
				dashStyle: "shortdot",
			}];
		},
		redraw: function(){
			this.draw();
		},
		draw: function(){
			this.chart = plot("chart", this.getSeries());
		},
		change: function(){
			this.redraw();
		}
	}
});

app.draw();

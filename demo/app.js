var app = new Vue({
	el: '#app',
	data: {
		chart: null,
		system: {
			q_in: 100, // heat that we get from the heating device (peltie or heating tape)
			c_heat: 30, // heat capacitance of the heating region
			c_det: 30, // heat capacitance of the detection region
			t_heat: 20, // temperature of the heating region
			t_det: 20, // temperature of the detection region
			kappa_int: 30, // heat conductivity within a bulk
			kappa_ext: 3, // heat conductivity to external bath
			t_ext: 20,	// external temperature
			dt: 1e-3, // simulation step
			t_sample: 1e-2, // sampling rate for the plot
			noize: 0,
		},
		pid: {
			tset: 200,

			// mode: "relay",
			mode: "pid",
			kp: 54,
			ki: 160,
			kd: 6,

			// dt: 1e-6, // relay time step
			dt: 1e-3, // relay time step
			t: 10, // simulation range up to t
			umin: -100, // max output value
			umax: 100, // min output value
		}
	},
	methods: {
		getSeries: function(){
			var sys = Bulk(this.system);
			var settings = Object.assign({}, this.pid);
			settings.system = sys;
			var pid = PID(settings);
			var data = pid();
			console.log(data);
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
			// this.draw();
			var ser = this.getSeries();
			this.chart.series[0].setData(ser[0].data);
			this.chart.series[1].setData(ser[1].data);
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

var app = new Vue({
	el: '#app',
	data: {
		chart: null,
		system: {
			q_in: 10, // heat that we get from the heating device (peltie or heating tape)
			c_heat: 3, // heat capacitance of the heating region
			c_det: 3, // heat capacitance of the detection region
			t_heat: 20, // temperature of the heating region
			t_det: 20, // temperature of the detection region
			kappa_int: 30, // heat conductivity within a bulk
			kappa_ext: 3, // heat conductivity to external bath
			t_ext: 20,	// external temperature
			dt: 1e-4, // simulation step
			t_sample: 1e-3, // sampling rate for the plot
			noize: 0,
		},
		pid: {
			tset: 200,

			// mode: "relay",
			mode: "pid",
			kp: 30,
			ki: 15,
			kd: 8e-1,

			// dt: 1e-6, // relay time step
			dt: 1e-3, // relay time step
			t: 1, // simulation range up to t
			umin: -10e3, // max output value
			umax: 10e3, // min output value
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

// PID module
var PID = (function(){
	var PID = {};

	// default options for System constructor
	var default_system_options = {
		name: "Basic heater", // just a name, might be used for plot labels or whatever. Not used internally.
		q_in: 10000,
		c_heat: 3,
		c_det: 3,
		t_room: 20,
		kappa_int: 30,
		kappa_ext: 3,
		dt: 0.000001,
		t: 1,
		t_sample: 0.003,
	};
	// System constructor
	PID.System = function(options={}){
		var sys = Object.assign(default_system_options, options);
		sys.t_ext = sys.t_room;
		if(!sys.t_heat){
			sys.t_heat = sys.t_room;
		}
		if(!sys.t_det){
			sys.t_det = sys.t_room;
		}
		// initialize, first data points
		// sys.init = function(){
		// 	sys.heat_data = [[0, sys.t_heat]];
		// 	sys.det_data = [[0, sys.t_det]];
		// };
		sys._t = 0;
		sys._evaluate = function(dt, heat_rate){
			var qhd = sys.kappa_int * (sys.t_heat - sys.t_det) * dt; // heat heating => detection
			var qho = sys.kappa_ext * (sys.t_heat - sys.t_ext) * dt; // heat heating => environment
			var qdo = sys.kappa_ext * (sys.t_det - sys.t_ext) * dt; // heat detection => environment
			var qh = sys.q_in * heat_rate * dt; // heat from output to heating region
			sys.t_heat += (qh - qho - qhd) / sys.c_heat;
			sys.t_det += (qhd - qdo) / sys.c_det;
			sys._t += dt;
			// var lastt = sys.det_data[sys.det_data.length-1][0];
			// if(sys._t - lastt >= sys.t_sample){
			// 	sys.heat_data.push([sys._t, sys.t_heat]);
			// 	sys.det_data.push([sys._t, sys.t_det]);
			// }
		};
		sys.evaluate = function(dt, heat_rate){
			for (var t = 0; t < dt; t+=options.dt) {
				var delta = (t+options.dt < dt) ? options.dt : (dt-t)
				sys._evaluate(delta, heat_rate);
			}
		};
		sys.getSteadyState = function(tset){
			var d = {
				t_heat: tset+sys.kappa_ext * (tset - sys.t_ext) / sys.kappa_int,
				t_det: tset,
				out: 0
			}
			d.out = (sys.kappa_ext * (d.t_heat - sys.t_ext) + sys.kappa_int * (d.t_heat - tset))/sys.q_in;
			return d;
		};
		return sys;
	};
	return PID;
})();

// basic system example
system = PID.System({
	t_room: 36.6,
});
console.log(system);
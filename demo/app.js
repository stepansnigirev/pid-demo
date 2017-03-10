var app = new Vue({
	el: '#app',
	data: {
		amp: 1,
		freq: 1,
		ph: 0.3,
		tmax: 2*3.14,
		dt: 0.01,
		chart: null,
	},
  	computed: {
		series: function () {
			var data = [];
			for (var t = 0; t < this.tmax; t+=this.dt) {
				data.push([t, this.amp * Math.sin( this.freq * t + this.ph)]);
			};
			return [{
				name: "Sine wave",
				data: data,
			}]
		},
		val: function(){
			return this.amp * Math.sin( this.freq + this.ph );
		}
	},
	watch:{
		series: function(val){
			this.redraw()
		},
	},
	methods: {
		redraw: function(){
			this.chart.series[0].setData(this.series[0].data);
		},
		draw: function(){
			this.chart = plot("chart", this.series);
		},
		change: function(){
			console.log("change");
		}
	}
});

app.draw();

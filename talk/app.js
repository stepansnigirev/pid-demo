var app = new Vue({
	el: '#app',
	data: {
		slide: 3,
		step: 0,
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
				// steps: 5,
				// callback: function(){
				// 	app.curslide.heating = !app.curslide.heating;
				// },
			},
			{
				title: "",
			},
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
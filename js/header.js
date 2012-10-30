// Return a random number between from and to
function randomFromTo(from, to){
    return Math.floor(Math.random() * (to - from + 1) + from);
}

// Grow and element from size to maxSize either by height or width
// `fn` is called at the end and `e` at each iteration
function growElement(el, size, attr, maxSize, fn, inverse) {
    size += 1;
    el.css(attr, size + "px");

    if (inverse == true) {
        var posAttr = (attr == 'width') ? 'left' : 'top';
        var pos = parseInt(el.css(posAttr));
        el.css(posAttr, (pos - 1) + 'px');
    }
    
    if (size <= maxSize) {
        setTimeout(function() {
            growElement(el, size, attr, maxSize, fn, inverse);
        }, 1000/200);
    } else {
        if (fn) fn();
    }
}

function cowDefecate(objects, load, maxLoad) {
    new Dung(objects, 6, load);
    
    if (Math.abs(load) < maxLoad) {
        load -= 1;
        setTimeout(function() {
            cowDefecate(objects, load--, maxLoad);
        }, 400);
    }
}

function createPipe(width, height, top, left, target, color) {
    var pipe = $("<div class='pipe'></div>");
    color = (typeof(color) == 'undefined') ? "#361600" : color;
    
    var css = {
        background: color,
        width: width + "px",
        height: height + "px",
        position: "absolute",
        zIndex: 4,
        top: top + "px",
        left: left + "px"
    };
    
    pipe.css(css);
    target.append(pipe);
    return pipe;
}

function setStory(id) {
    $(".story").hide();
    $(id).show();
}

function setupScenario(paper, width, height, options) {
    var defaultOptions = {
        sky: "#87CEEB",
        ground: "90-#189100-#22CC00"
    };
    
    options = $.extend({}, defaultOptions, options);
    
    var sky = paper.rect(0, 0, width, height);
    sky.attr("fill", options.sky);
    sky.attr("stroke", options.sky);
    
    var cloud_one = new Cloud(paper, 0, 0);
    cloud_one.animate(100);
    
    var cloud_two = new Cloud(paper, 200, 200);
    cloud_two.animate(500);
    
    var ground = paper.rect(0, 538, 1024, 230);
    ground.attr("fill", options.ground);
    ground.attr("stroke", options.ground);
}

// path object: {direction: 'up'|'down'|'left'|'right', length: int, x: int, y: int}
function fillPipe(target, path, options, callback) {
    var defaultOptions = {
        width: 12,
        step: 10,
        color: "black"
    };
    
    if (typeof(options) == 'function') {
        callback = options;
        options = {};
    }
    
    options = $.extend({}, defaultOptions, options);
    
    function executeStep(i) {
        if (i >= path.length) {
            if (callback) callback();
            return;
        }
        
        var step = path[i];
        var vertical = (step.direction == 'up' || step.direction == 'down');
        var width  = vertical ? options.width : options.step;
        var height = vertical ? options.step : options.width;
        
        var pipe = createPipe(width, height, step.y, step.x, target, options.color);
        growElement(pipe, options.step, vertical ? "height" : "width", step.length, function() {
            i += 1;
            executeStep(i);
        }, (step.direction == 'up' || step.direction == 'left'));
    }
    
    executeStep(0);
}

function tweenMoveLeft(el, options) {
    var defaultOptions = {
        start: el.position().left,
        stop: 2000,
        time: 0,
        units: 'px',
        duration: 2,
        effect:'easeInOut'
    };
    
    options = $.extend({}, defaultOptions, options);
    
    el.tween({left: options});
}

function createLight(canvas, context, x, y, options) {
    var defaultOptions = {
        position: new Vec2(x, y),
        color: 'yellow',
        distance: 70,
        radius: 30,
        samples: 100
    };
    
    options = $.extend({}, defaultOptions, options);
    
    var lamp = new Lamp(options);

    var lighting = new Lighting({
        light: lamp,
    });
    lighting.compute(canvas.width, canvas.height);
    lighting.render(context);
    return lighting;
}

function createArc(context, x, y, radius, startAngle, endAngle, counterClockwise, lineWidth, strokeStyle) {
    if (typeof(counterClockwise) == 'undefined') counterClockwise = false;
    if (typeof(lineWidth) == 'undefined') lineWidth = 3;
    if (typeof(strokeStyle) == 'undefined') strokeStyle = 'yellow';

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    
    context.lineWidth = lineWidth;

    // line color
    context.strokeStyle = strokeStyle;
    context.stroke();
}

function radioWave(ctx, x, y, radius, counterClockwise) {
    if (typeof(counterClockwise) == 'undefined') counterClockwise = false;
    
    var startAngle = 1.6 * Math.PI
      , endAngle   = 0.4 * Math.PI
      ;
    
    if (radius > 0)
        createArc(ctx, x, y, radius, startAngle, endAngle, counterClockwise);
    
    setTimeout(function() {
        if (radius >= 40) {
            if (counterClockwise == true)
                ctx.clearRect(x-radius-6, y-radius-2, radius+25, radius*2+5);
            else
                ctx.clearRect(x-6, y-radius-2, radius+20, radius*2+3);
            radius = -5;
        } else {
            radius += 5;
        }
        
        radioWave(ctx, x, y, radius, counterClockwise);
    }, 200);
}


// Create a cloud at `x` and `y`
var Cloud = function(paper, x, y) {
    this.paper = paper;
    this.x = x;
    this.y = y;
    
    this.cloud = paper.path('M 80 180 A 50,50 0 0,1 82,90 '
    + 'A 50,50 20  0,1 168,84  '
    + 'A 50,50 20  0,1 317,98  '
    + 'A 50,50 20  0,1 388,97  '
    +' A 50,50 0   0,1 395,180 '
    + 'A 50,50 0   0,1 300,200 '
    + 'A 70,50 120 0,1 200,200 '
    + 'A 70,50 120 0,1 150,200 '
    + 'A 70,50 120 0,1 100,200 Z');
    
    this.cloud.attr({
        fill: 'white',
        stroke: 'white',
        'stroke-width': 8,
        'stroke-linejoin': 'round',
        'stroke-miterlimit': 200
    });
    
    this.cloud.transform("T"+x+","+y);
};

Cloud.prototype = {
    animate: function(i) {
        var self = this;
        i = (i > width || typeof(i) == 'undefined') ? -420 : (i+1);
        this.cloud.transform("T"+i+","+this.y);
        
        setTimeout(function() {
            self.animate(i);
        }, 1000/50);
    }
};

// Create a dung and animate it
// The position of the dung is already defined
var Dung = function(parent, zIndex, topIncrease) {
    if (typeof(zIndex) == 'undefined') zIndex = 4;
    if (typeof(topIncrease) == 'undefined') topIncrease = 0;
    this.el = $('<img class="dung" src="img/shit.svg" />');
    this.el.css({zIndex: zIndex, height: 45, top: 550, left: 680});
    parent.append(this.el);
    
    var append = randomFromTo(-20, 20);
    
    this.el.tween({
        left: {
            start: 750,
            stop: 620 + append,
            time: 0,
            units: 'px',
            duration: 1,
            effect:'easeInOut'
        },
        top:{
            start: 430,
            stop: 540 + topIncrease,
            time: 0,
            units: 'px',
            duration: 1,
            effect:'bounceOut'
        }
    }).play();
};

// Particle animation
var particles = function(el, colors) {
    var SCREEN_WIDTH = 180;
    var SCREEN_HEIGHT = 138;

    var RADIUS = 1;

    var RADIUS_SCALE = 1;
    var RADIUS_SCALE_MIN = 1;
    var RADIUS_SCALE_MAX = 1.5;

    var QUANTITY = 1000;

    var canvas;
    var context;
    var particles;
    var colors = (typeof(colors) == 'undefined') ? ['black'] : colors;//['#8e2bff', '#ff6600', '#ff2a2a', '#fffa10' ];

    var mouseX = (window.innerWidth - SCREEN_WIDTH);
    var mouseY = (window.innerHeight - SCREEN_HEIGHT);
    
    var targetX = 0;
    var targetY = 0;

    var PARTICLE_SIZE = 10;
    
    init();
    


    function init() {
        canvas = document.getElementById(el);

        if(canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            context.globalCompositeOperation = 'destination-over';
            //document.addEventListener('mousemove', documentMouseMoveHandler, false);
            //document.addEventListener('mousedown', documentMouseDownHandler, false);
            //document.addEventListener('mouseup', documentMouseUpHandler, false);
            window.addEventListener('resize', windowResizeHandler, false);
            //canvas.addEventListener('touchmove', canvasTouchMoveHandler, false);
            windowResizeHandler();

            createParticles();
           
            setInterval(loop, 1000/60);
        }
    }

    function createParticles() {
        particles = [];
        var depth = 0;
            
        for (var i = 0; i < QUANTITY; i++) {
            var posX = PARTICLE_SIZE/2 + Math.random() * (window.innerWidth - PARTICLE_SIZE/2)
            var posY = PARTICLE_SIZE/2 + Math.random() * (window.innerHeight - PARTICLE_SIZE/2);

            var speed = 2;
            var directionX = -speed + (Math.random() * speed*2);
            var directionY = -speed + (Math.random()* speed*2);
                    
	        var particle = {
		        position: { x: posX, y: posY },
		        size: PARTICLE_SIZE,
                directionX: directionX,
                directionY: directionY,
		        speed: speed,
                targetX: posX,
                targetY: posY,
                depth: depth,
                index:i,
                fillColor: colors[randomFromTo(0, colors.length-1)]//'blue'
		        //fillColor: '#' + (Math.random() * 0x00eaff + 0xff0000 | 0).toString(16)
	        };

	        particles.push( particle );
        }
    }

    function documentMouseMoveHandler(event) {
        mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * .5;
        mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * .5;
        targetX = mouseX - window.innerWidth / 2;
        targetY = mouseY - window.innerHeight / 2;
    }

    function loop() {
        context.fillStyle = 'rgba(153,153,153,0.2)';
	    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            
        var z = 0;
        var xdist = 0;
        var ydist = 0;
        var dist = 0;
            
        for (var i=0; i < particles.length; i++) {
            var particle = particles[i];
                
            var lp = { x: particle.position.x, y: particle.position.y };
            
            if (particle.position.x <=particle.size/2 || particle.position.x >= SCREEN_WIDTH - PARTICLE_SIZE/2) {
                particle.directionX *= -1;
            }

            if (particle.position.y <=particle.size/2 || particle.position.y >= SCREEN_HEIGHT - PARTICLE_SIZE/2) {
                particle.directionY *= -1;
            }

            particle.position.x -= particle.directionX;
            particle.position.y -= particle.directionY;

            context.beginPath();
            context.fillStyle = particle.fillColor;
            context.lineWidth = particle.size;
            context.moveTo(lp.x, lp.y);
            context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
            context.closePath();
            context.fill();
        }
    }

    function randomiseDirection(particle) {
        //pick a random deg
        var d = 0;
        while((d == 0) || (d == 90) || (d == 180) || (d == 360)) {
            d = Math.floor(Math.random() * 360);
        }
        //convert to r
        var r = (d * 180)/Math.PI;

        //use to calculate vectors
        particle.directionX = Math.sin(r) * particle.speed;
        particle.directionY = Math.cos(r) * particle.speed;

        //check
        // if ((Math.abs(this.xspeed) < 2) || (Math.abs(this.yspeed) < 2)) {
        //  this.randomiseDirection();
        // }
    }
    
    function canvasTouchMoveHandler(event) {
        if(event.touches.length == 1) {
            event.preventDefault();

            mouseX = event.touches[0].pageX - (window.innerWidth - SCREEN_WIDTH) * .5;
            mouseY = event.touches[0].pageY - (window.innerHeight - SCREEN_HEIGHT) * .5;

            targetX = event.touches[0].pageX - window.innerWidth / 2;
            targetY = event.touches[0].pageY - window.innerHeight / 2;
        }
    }

    function windowResizeHandler() {
        //SCREEN_WIDTH = window.innerWidth;
        //SCREEN_HEIGHT = window.innerHeight;
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
    }
};

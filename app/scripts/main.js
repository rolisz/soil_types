var layer_width = 150;
var width = layer_width + 5;
var paper = Raphael($("#canvas")[0], width, 10);
var unit = 50;
var dom_list = $("#straturi")

var source = $("#list-template").html()
var layer_tpl = $("#layer-template").html();

var default_layer = {depth: 1, layer_type: "argila", 
    line1: {enabled: false, ratio:1, step:15, dotted: false}, 
    line2: {enabled: false, ratio:1, step:10, dotted: false},
    dots: false
}
var context = {layers: 
    [$.extend(true, {}, default_layer)]}

var ractive = new Ractive({
    el: dom_list,
    template: source,
    data: context,
    partials: {layer: layer_tpl}

});


ractive.on({change: function(event) {
    console.log(context);
    render(context)
}, change_defaults: function(event) {
    var t = event.node.value;
    var kp = event.keypath;

    ractive.set(kp+'.line1.enabled', false)
    ractive.set(kp+'.line2.enabled', false)
    ractive.set(kp+'.dots', false)
    if (t == 'marne') {
        ractive.set(kp+'.line1.enabled', true);
        ractive.set(kp+'.line1.ratio', 0)
    } else if (t == 'nisip') {
        ractive.set(kp+'.dots', true);
    } else if (t == 'argila') {
        ractive.set(kp+'.line1.enabled', true);
        ractive.set(kp+'.line1.ratio', 0)
    } else if (t == 'praf') {
        ractive.set(kp+'.line1.enabled', true);
        ractive.set(kp+'.line1.ratio', 1)
    }
    ractive.fire('redraw')
}})

function render(context) {
    if (context.layers.length == 0) {
        return ;
    }
    var total_height = _.pluck(context.layers, 'depth').reduce(function(prev, curr) {
        return prev + curr;
    })
    paper.setSize(width + 3, total_height*unit + 3)
    var current_height = 0;
    var layers = context.layers;
    var layer;
    paper.clear()
    for (var i = 0; i < layers.length; i++) {
        layer = layers[i]
        var height = layer.depth*unit;
        paper.rect(1, current_height*unit + 1, layer_width, height).attr('stroke-width', 2)
        if (layer.layer_type === 'sol_vegetal') {
            draw_sol(height, current_height) 
            current_height += layer.depth
            continue 
        }
        if (layer.layer_type === 'marne') {
            var step = layer.line1.step;
            draw_marne_lines(height, current_height, step) 
        }
        if (layer.layer_type === 'umpluturi') {
            draw_umpluturi(height, current_height) 
        }
        if (layer.layer_type === 'pietris') {
            draw_ellipses(height, current_height)
            draw_dots(height, current_height) 
        }
        if (layer.dots === true) {
            draw_dots(height, current_height)
        }
        if (layer.line1.enabled === true) {
            draw_line(layer.line1.step, layer.line1.ratio, height, current_height, layer.line1.dotted)
        }
        if (layer.line2.enabled === true) {
            draw_line(layer.line2.step, layer.line2.ratio, height, current_height,layer.line2.dotted)
        }

        current_height += layer.depth
    }
}

function draw_dots(height, current_height)  {
    for (var j = 0; j < height/ 10; j+=1) {
        for (var k = 0; k < layer_width; k+=30) {
            var y = current_height * unit + j * 10 + 5;
            var x = (k+j*10 + 10 + Math.random()*15) % layer_width + 1;
            paper.circle(x, y, 0.5);
        }
    }
}

function draw_line(step, ratio, height, current_height, dotted) {
    console.log(dotted)
    if (ratio == 0) {
        for (var y = step; y < height; y+=step) {
            var line = paper.path("M0,"+(y+current_height*unit)+"H"+layer_width);
            if (dotted) {
                line.attr('stroke-dasharray', "15, 15")
                console.log(line)
            }
            console.log(y, height, y+step)
        }
    } else {
        var max_x = (height + ratio*layer_width)/ratio;
        var max_y = max_x*ratio;
        var y = step, x = step/ratio
        while (x < max_x || y < max_y) {
            x1 = (y > height)?(x-height/ratio):0;
            y_f = Math.min(y, height) + current_height*unit;
            y2 = ((x > layer_width)?((x-layer_width)*ratio):0)+current_height*unit
            x_f = Math.min(x, layer_width)
            var line = paper.path("M"+x1+","+y_f+"L"+x_f+","+y2);
            if (dotted) {
                line.attr('stroke-dasharray', "15,15")
            }
            y += step;
            x += step/ratio;
        }
    }
}

function draw_sol(height, current_height) {
    for (var x = 15; x < layer_width; x+=30) {
        paper.path("M"+x+","+(current_height*unit+2)+"c-4.115013,-0.901581 -9.5233,-0.563488 -12.844704,0.309917c-3.321396,0.873404 -4.555901,2.282122 -0.323318,3.521795c9.288162,-4.282503 16.989105,-1.014263 12.051102,-0.563473c-4.938011,0.45079 -7.759727,1.803158 -7.877296,1.782669c0.117569,0.020489 9.288155,-1.782669 7.407005,0.020489c-1.881142,1.803162 -5.643433,2.704739 -5.761009,2.68425c0.117577,0.020489 2.704147,1.37286 2.586578,1.352367c0.117569,0.020493 -0.822998,3.401413 -0.940575,3.380924") 
    }
}

function draw_ellipses(height, current_height) {
    for (var j = 0; j < height/ 15; j+=1) {
        for (var k = 0; k < layer_width; k+=30) {
            var y = j * 15 + 5+(Math.random()*8-4);
            var x = (k+j*10 + 10 + (Math.random()*15-7)) % layer_width + 1;
            var rx = Math.random()*6+1, ry = Math.random()*5+1;
            if (y + ry > height) {
                y = height -ry; 
            }
            if (y -ry < 0) {
                y = ry
            }
            if (x + rx > layer_width) {
                x = layer_width - rx; 
            }
            paper.ellipse(x, current_height * unit + y, rx, ry);
        }
    }
}

function draw_marne_lines(height, current_height, step) {
    for (var j = 0; j < height - step; j+=step) {
        for (var k = 20; k < layer_width; k+=30) {
            paper.path("M"+k+","+(j+current_height*unit)+"l-10,"+(step-2))
        }
    }
}

function draw_umpluturi(height, current_height) {
    var length = 20;
    var count_per_unit = 20;
    for (var i = 5; i < height; i+=30) {
        for (var j = 0; j < count_per_unit; j++) {
            var y = i + (Math.random()*15 - 7) + current_height*unit;
            if (y < current_height*unit + length/2) {
                y+= length/2 
            }
            var x = Math.random()*layer_width - length;
            var x2 = x + (Math.random()*length - length/2)
            var y2 = y + (Math.random()*length - length/2)
            if ((x-x2)*(x-x2) + (y-y2)*(y-y2) < 10) {
                if (x < x2) {
                    x2+=3 
                } 
                else {
                    x2-=3 
                }
                if (y < y2) {
                    y2+=3 
                }
                else {
                    y2-=3
                }
            }
            console.log(y, y2, i, current_height*unit)
            paper.path("M"+x+","+y+"L"+x2+","+y2)
        }
    }
}

$("#add_layer").click(function(e) {
    context.layers.push($.extend(true, {}, default_layer))
    render(context)

})

$('#save').click(function(e) {
    var canvas = document.createElement('canvas');
    canvas.id = "canvas";
    document.body.appendChild(canvas) 
    canvg(canvas, svgfix(paper.toSVG()))
    document.body.removeChild(canvas)
    a = document.createElement('a');
    a.download = 'straturi.png';
    a.type = 'image/png';
    a.href = canvas.toDataURL();
    a.click();
})

render(context)

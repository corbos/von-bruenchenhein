var VonBruenchenhein = function (canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
        throw "Canvas element '" + canvasId + "' was not found.";
    }
    this.ctx = this.canvas.getContext('2d');
    whatNext.emit('vbInit', this);
};

VonBruenchenhein.prototype.mouseToPoint = function (e) {
    return {
        x: e.clientX - this.canvas.offsetLeft + window.pageXOffset,
        y: e.clientY - this.canvas.offsetTop + window.pageYOffset
    };
};

VonBruenchenhein.prototype.clear = function () {
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

(function (VonBruenchenhein) {

    var getHandler = function (vb, name) {
        return function (e) {
            vb[name](e);
        };
    },

    init = function (vb) {
        var stopDrawing = getHandler(vb, 'stopDrawing');
        vb.canvas.addEventListener('mousedown', getHandler(vb, 'startDrawing'));
        vb.canvas.addEventListener('mousemove', getHandler(vb, 'moveDrawing'));
        vb.canvas.addEventListener('mouseup', stopDrawing);
        vb.canvas.addEventListener('mouseout', stopDrawing);
        vb.initDrawing();
    },

    FULL_CIRCLE = Math.PI * 2.0;

    VonBruenchenhein.prototype.initDrawing = function () {
        this.points = [];
        this.lineWidth = 5;
        this.strokeStyle = '#000';
        this.lineJoin = this.lineCap = 'round';
        this.shadowBlur = 0;
        this.shadowColor = '#000';
        this.shadowOffsetX = this.shadowOffsetY = 0;
    };

    VonBruenchenhein.prototype.startDrawing = function (e) {
        this.drawing = true;
        this.points.push(this.mouseToPoint(e));
    };

    VonBruenchenhein.prototype.moveDrawing = function (e) {
        if (this.drawing) {
            var pt = this.mouseToPoint(e);
            this.points.push(pt);
            this.drawLine();
        }
    };

    VonBruenchenhein.prototype.stopDrawing = function (e) {
        if (this.drawing) {
            this.drawLine();
            this.drawing = false;
            this.points.length = 0;
        }
    };
    
    VonBruenchenhein.prototype.setDrawingProperties = function (ctx) {
        ctx.lineWidth = this.lineWidth;
        ctx.lineJoin = this.lineJoin;
        ctx.lineCap = this.lineCap;
        ctx.strokeStyle = this.strokeStyle;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowColor = this.shadowColor;
        ctx.shadowOffsetX = this.shadowOffsetX;
        ctx.shadowOffsetY = this.shadowOffsetY;
    };

    VonBruenchenhein.prototype.drawLine = function () {

        var ctx = this.ctx,
            points = this.points,
            i;

        ctx.save();
        this.setDrawingProperties(ctx);
        ctx.beginPath();
        if (points.length === 1) {
            ctx.fillStyle = this.strokeStyle;
            ctx.arc(points[0].x, points[0].y, Math.max(Math.round(ctx.lineWidth / 2), 0.5), 0, FULL_CIRCLE);
            ctx.fill();
        } else {
            ctx.moveTo(points[0].x, points[0].y);
            for (i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        }

        ctx.restore();
    };

    whatNext.on('vbInit', init);

})(VonBruenchenhein);

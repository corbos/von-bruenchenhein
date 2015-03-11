(function () {

    var app = new VonBruenchenhein('canvas'),
        txtLineWidth = document.getElementById('txtLineWidth'),
        txtStrokeStyle = document.getElementById('txtStrokeStyle'),
        btnClear = document.getElementById('btnClear'),
        ddlLineJoin = document.getElementById('ddlLineJoin'),
        ddlLineCap = document.getElementById('ddlLineCap'),
        txtShadowBlur = document.getElementById('txtShadowBlur'),
        txtShadowColor = document.getElementById('txtShadowColor'),
        txtShadowOffsetX = document.getElementById('txtShadowOffsetX'),
        txtShadowOffsetY = document.getElementById('txtShadowOffsetY'),
        download = document.getElementById('download')
    ;

    whatNext.on('vbRendered', function (vb) {
        download.href = vb.dataURL;
    });
    whatNext.on('colorChange', function (elem) {
        if (elem === txtStrokeStyle) {
            app.strokeStyle = elem.value;
        }
        else if (elem === txtShadowColor) {
            app.shadowColor = elem.value;
        }
    });

    txtLineWidth.addEventListener('change', function () {
        var lineWidth = parseInt(this.value, 10);
        if (!isNaN(lineWidth) && lineWidth > 0) {
            app.lineWidth = lineWidth;
        }
    });  

    btnClear.addEventListener('click', function () {
        app.clear();
    });

    ddlLineJoin.addEventListener('change', function () {
        app.lineJoin = this.value;
    });

    ddlLineCap.addEventListener('change', function () {
        app.lineCap = this.value;
    });

    txtShadowBlur.addEventListener('change', function () {
        var shadowBlur = parseInt(this.value, 10);
        if (!isNaN(shadowBlur) && shadowBlur >= 0) {
            app.shadowBlur = shadowBlur;
        }
    });

    txtShadowOffsetX.addEventListener('change', function () {
        var shadowOffsetX = parseInt(this.value, 10);
        if (!isNaN(shadowOffsetX) && shadowOffsetX >= 0) {
            app.shadowOffsetX = shadowOffsetX;
        }
    });

    txtShadowOffsetY.addEventListener('change', function () {
        var shadowOffsetY = parseInt(this.value, 10);
        if (!isNaN(shadowOffsetY) && shadowOffsetY >= 0) {
            app.shadowOffsetY = shadowOffsetY;
        }
    });

    txtLineWidth.value = app.lineWidth;
    txtStrokeStyle.value = app.strokeStyle;
    whatNext.emit('colorChange', txtStrokeStyle);
    ddlLineJoin.value = app.lineJoin;
    ddlLineCap.value = app.lineCap;
    txtShadowBlur.value = app.shadowBlur;
    txtShadowColor.value = app.shadowColor;
    whatNext.emit('colorChange', txtShadowColor);
    txtShadowOffsetX.value = app.shadowOffsetX;
    txtShadowOffsetY.value = app.shadowOffsetY;
})();

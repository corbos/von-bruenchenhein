(function () {

    var pickers = document.querySelectorAll('input[data-colorpicker]'),
        canvas,
        i,
        current,
        hexChars = "0123456789ABCDEF",
        hovered = false,

        colorStrength = function (focus, index) {
            var diff = Math.min(Math.abs(focus - index), Math.abs(focus + 120 - index));
            if (diff <= 20) {
                return 255;
            } else if (diff > 40) {
                return 0.0;
            }
            return Math.max(0, 255 - (255 * (diff - 20.0) / 25.0));
        },

        safeColor = function (val) {
            return Math.min(255, Math.max(0, Math.round(val)));
        },

        createCanvas = function () {

            var canvas = document.createElement('canvas'),
                ctx,
                square = 120,
                i, j,               
                red, green, blue,
                factor;

            canvas.width = square;
            canvas.height = square;
            canvas.style.display = 'none';
            canvas.style.position = 'absolute';
            ctx = canvas.getContext('2d');

            for (i = 0; i < square; i++) {
                red = colorStrength(0, i);
                green = colorStrength(40, i);
                blue = colorStrength(80, i);
                for (j = 0; j < square; j++) {
                    factor = 3.2 * (j - 60);
                    ctx.fillStyle = '#' 
                        + intToHex(safeColor(red - factor))
                        + intToHex(safeColor(green - factor)) 
                        + intToHex(safeColor(blue - factor)) 
                    ctx.fillRect(i, j, 1, 1);
                }
            }

            canvas.addEventListener('click', function (e) {

                var x = e.clientX - this.offsetLeft + window.pageXOffset,
                    y = e.clientY - this.offsetTop + window.pageYOffset
                    data = ctx.getImageData(x, y, 1, 1).data;

                current.value = '#' + intToHex(data[0]) + intToHex(data[1]) + intToHex(data[2]);
                this.style.display = 'none';
                whatNext.emit('colorChange', current);
            });
            canvas.addEventListener('mouseover', function (e) { hovered = true; });
            canvas.addEventListener('mouseout', function (e) { hovered = false; });

            return canvas;
        },

        hexToInt = function (first, second) {

            var fIndex = hexChars.indexOf(first.toUpperCase()),
                sIndex = hexChars.indexOf(second.toUpperCase());

            if (fIndex >= 0 && sIndex >= 0) {
                return fIndex * 16 + sIndex;
            }

            return 0;
        },

        intToHex = function (val) {
            var first = Math.floor(val / 16),
                second = val % 16;
            return hexChars.charAt(first) + hexChars.charAt(second);
        };

    whatNext.on('colorChange', function (elem) {

        var val = elem.value.replace('#', ''),
            red,
            green,
            blue,
            avg;

        if (val.length === 6) {
            red = hexToInt(val.charAt(0), val.charAt(1));
            green = hexToInt(val.charAt(2), val.charAt(3));
            blue = hexToInt(val.charAt(4), val.charAt(5));
            avg = (red + green + blue) / 3.0;
            elem.style.background = elem.value;
            elem.style.color = avg < 125 ? "#FFF" : "#000";
        }
    });

    if (pickers.length > 0) {

        canvas = createCanvas();
        pickers[0].parentNode.appendChild(canvas);

        for (i = 0; i < pickers.length; i++) {
            (function (picker) {
                picker.addEventListener('focus', function () {
                    picker.parentNode.appendChild(canvas);
                    canvas.style.display = 'block';
                    current = picker;
                });
                picker.addEventListener('blur', function () {
                    if (!hovered) {
                        canvas.style.display = 'none';
                    }
                });
                picker.addEventListener('change', function () {
                    whatNext.emit('colorChange', this);
                });
            })(pickers[i]);
        }
    }

})();

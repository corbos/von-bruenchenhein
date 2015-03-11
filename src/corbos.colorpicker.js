(function () {

    var pickers = document.querySelectorAll('input[data-colorpicker]'),
        canvas,
        i,
        current,
        hexChars = "0123456789ABCDEF",

        createCanvas = function () {

            var canvas = document.createElement('canvas'),
                ctx,
                square = 120,
                i, j,
                magnitude,
                red, green, blue;

            canvas.width = square;
            canvas.height = square;
            canvas.style.display = 'none';
            canvas.style.position = 'absolute';
            ctx = canvas.getContext('2d');

            for (i = 0; i < square; i++) {
                for (j = 0; j < square; j++) {
                    ctx.fillStyle = '#' + intToHex(i / square * 255) + intToHex(j / square * 255) + intToHex(0);
                    ctx.fillRect(i, j, 1, 1);
                }
            }

            canvas.addEventListener('click', function (e) {

                var x = e.clientX - this.offsetLeft + window.pageXOffset,
                    y = e.clientY - this.offsetTop + window.pageYOffset
                    data = ctx.getImageData(x, y, 1, 1).data;

                current.value = '#' + intToHex(data[0]) + intToHex(data[1]) + intToHex(data[2]);
                whatNext.emit('colorChange', current);
            });

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
            avg = (red + green + blue) / 3;
            elem.style.background = elem.value;
            elem.style.color = avg < 90 ? '#FFF' : '#000';
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
                    setTimeout(function () { canvas.style.display = 'none'; }, 100);
                });
                picker.addEventListener('change', function () {
                    whatNext.emit('colorChange', this);
                });
            })(pickers[i]);
        }
    }

})();

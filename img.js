(function () {
    'use strict';

    var byId = function (id) {
            return document.getElementById(id);
        },

        fixColor = function (val) {
            return Math.max(Math.min(Math.round(val), 255), 0);
        },
        drawing = false,
        theFile = byId("theFile"),
        download = byId("download"),
        canvas = byId("canvas"),
        ctx = canvas.getContext('2d'),
        img = new Image(),

        restore = function () {
            if (img.width && img.width > 0) {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                download.href = canvas.toDataURL("image/jpeg", 0.8);
            } else {
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },

        transform = function (fn) {

            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
                data = imgData.data,
                len = data.length,
                i;

            for (i = 0; i < len; i += 4) {
                fn(data, i);
            }
            ctx.putImageData(imgData, 0, 0);
            download.href = canvas.toDataURL("image/jpeg", 0.8);
        },

        runKernel = function (kernel) {

            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
                data = imgData.data,
                len = data.length,
                index = 0,
                width = canvas.width * 4,
                height = canvas.height,
                buffer = [],

                work = function (data, index) {

                    var red = 0.0,
                        green = 0.0,
                        blue = 0.0,
                        i,
                        j,
                        k,
                        row = Math.floor(index / width),
                        col = index % width,
                        c,
                        baseIndex;

                    for (i = -1; i < 2; i++) {
                        if (row + i >= 0 && row + i < height) {
                            for (j = -1; j < 2; j++) {
                                c = col + (j * 4);
                                if (c >= 0 && c < width) {
                                    baseIndex = index + (width * i) + (j * 4);
                                    k = kernel[i + 1][j + 1];
                                    red += (data[baseIndex] * k);
                                    green += (data[baseIndex + 1] * k);
                                    blue += (data[baseIndex + 2] * k);
                                }
                            }
                        }
                    }

                    buffer[index] = fixColor(red);
                    buffer[index + 1] = fixColor(green);
                    buffer[index + 2] = fixColor(blue);
                    buffer[index + 3] = data[index + 3];
                };

            for (index = 0; index < len; index += 4) {
                work(data, index);
            }
            for (index = 0; index < len; index++) {
                data[index] = buffer[index];
            }
            ctx.putImageData(imgData, 0, 0);
            download.href = canvas.toDataURL("image/jpeg", 0.8);
        },

        operations = {

            redder: function () {
                transform(function (data, i) {
                    data[i] = Math.min(data[i] + 50, 255);
                });
            },

            greener: function () {
                transform(function (data, i) {
                    data[i + 1] = Math.min(data[i + 1] + 50, 255);
                });
            },

            bluer: function () {
                transform(function (data, i) {
                    data[i + 2] = Math.min(data[i + 2] + 50, 255);
                });
            },

            lighter: function () {
                transform(function (data, i) {
                    data[i] = Math.min(data[i] + 25, 255);
                    data[i + 1] = Math.min(data[i + 1] + 25, 255);
                    data[i + 2] = Math.min(data[i + 2] + 25, 255);
                });
            },

            darker: function () {
                transform(function (data, i) {
                    data[i] = Math.max(data[i] - 25, 0);
                    data[i + 1] = Math.max(data[i + 1] - 25, 0);
                    data[i + 2] = Math.max(data[i + 2] - 25, 0);
                });
            },

            identity: function () {
                runKernel([
                    [0.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0],
                    [0.0, 0.0, 0.0]
                ]);
            },

            sharpen: function () {
                runKernel([
                    [0.0, -1.0, 0.0],
                    [-1.0, 5.0, -1.0],
                    [0.0, -1.0, 0.0]
                ]);
            },

            blur: function () {
                runKernel([
                    [0.0625, 0.125, 0.0625],
                    [0.125, 0.25, 0.125],
                    [0.0625, 0.125, 0.0625]
                ]);
            },

            emboss: function () {
                runKernel([
                    [-2.0, -1.0, 0.0],
                    [-1.0, 1.0, 1.0],
                    [0.0, 1.0, 2.0]
                ]);
            },

            outline: function () {
                runKernel([
                    [-1.0, -1.0, -1.0],
                    [-1.0, 8.0, -1.0],
                    [-1.0, -1.0, -1.0]
                ]);
            },

            edge: function () {
                runKernel([
                    [-1.0, 0.0, 0.0],
                    [-1.0, 3.0, 0.0],
                    [-1.0, 0.0, 0.0]
                ]);
            },

            sobelBottom: function () {
                runKernel([
                    [-1.0, -2.0, -1.0],
                    [0.0, 0.0, 0.0],
                    [1.0, 2.0, 1.0]
                ]);
            },

            gradientHorizontal: function () {
                runKernel([
                    [-1.0, -1.0, -1.0],
                    [0.0, 0.0, 0.0],
                    [1.0, 1.0, 1.0]
                ]);
            },

            invert: function () {
                transform(function (data, i) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                });
            },

            grayscale: function () {
                transform(function (data, i) {
                    var avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                });
            },

            blackAndWhite: function () {
                this.grayscale();
                transform(function (data, i) {
                    if(data[i] < 128) {
                        data[i] = 0;
                        data[i + 1] = 0;
                        data[i + 2] = 0;
                    } else {
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                    }
                });
            },

            enlarge: function () {
                var image = new Image();
                image.onload = function () {
                    canvas.width = Math.round(image.width * 1.1);
                    canvas.height = Math.round(canvas.width * image.height / image.width);
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                };
                image.src = canvas.toDataURL("image/jpeg", 1.0);
            },

            shrink: function () {
                var image = new Image();
                image.onload = function () {
                    canvas.width = Math.round(image.width * 0.9);
                    canvas.height = Math.round(canvas.width * image.height / image.width);
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                };
                image.src = canvas.toDataURL("image/jpeg", 1.0);
            },

            restore: restore
        },

        buttons = byId("buttons"),
        key,
        btn,
        handler = function () {
            operations[this.value]();
        },
        endDrawing = function (e) {
            if (drawing) {
                drawing = false;
                download.href = canvas.toDataURL("image/jpeg", 0.8);
            }
        };

    img.onload = restore;

    theFile.addEventListener("change", function () {
        var reader = new FileReader();
        reader.onload = function () {
            img.src = reader.result;
        };
        reader.readAsDataURL(theFile.files[0]);
    }, false);

    canvas.addEventListener("mousedown", function (e) {
        var x = e.clientX - this.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
        var y = e.clientY - this.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
        ctx.beginPath();
        ctx.moveTo(x, y);
        drawing = true;
    });
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseout", endDrawing);
    canvas.addEventListener("mousemove", function (e) {
        if (drawing) {
            var x = e.clientX - this.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
            var y = e.clientY - this.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (key in operations) {
        btn = document.createElement("button");
        btn.value = key;
        btn.innerText = key;
        btn.addEventListener("click", handler, false);
        buttons.appendChild(btn);
    }

})();

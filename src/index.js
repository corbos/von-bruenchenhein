(function () {

    var app = new VonBruenchenhein('canvas'),      
        download = document.getElementById('download'),
        theFile = document.getElementById('theFile'),      
        btns,
        propCtrls,
        i,
        ctrl,
        handleOperation = function () {
            app[this.getAttribute('data-vb-operation')]();
        },
        handleProp = function () {

            var key = this.getAttribute('data-vb-property'),
                n;

            if (typeof app[key] === "number") {
                n = parseInt(this.value, 10);
                if (!isNaN(n)) {
                    app[key] = n;
                }
            } else {
                app[key] = this.value;
            }
        }
    ;

    whatNext.on('vbRendered', function (vb) {
        download.href = vb.dataURL;
    });
    
    whatNext.on('colorChange', function (elem) {
        var key = elem.getAttribute('data-vb-property');
        app[key] = elem.value;      
    }); 

    theFile.addEventListener("change", function () {

        if (theFile.files.length === 0) {
            return;
        }

        var reader = new FileReader();
        reader.onload = function () {
            app.setImageSrc(reader.result);
        };
        reader.readAsDataURL(theFile.files[0]);
    }, false);

    btns = document.querySelectorAll('button[data-vb-operation]');
    for (i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', handleOperation);
    }

    propCtrls = document.querySelectorAll('*[data-vb-property]');
    for (i = 0; i < propCtrls.length; i++) {
        ctrl = propCtrls[i];
        ctrl.addEventListener('change', handleProp);
        ctrl.value = app[ctrl.getAttribute('data-vb-property')]; 
        if (typeof ctrl.getAttribute('data-colorpicker') === "string") {
            whatNext.emit('colorChange', ctrl);
        }       
    } 

})();

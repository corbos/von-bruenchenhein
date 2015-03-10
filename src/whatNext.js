var whatNext = {

    handlers: {},

    on: function (name, handler) {
        if (name in this.handlers) {
            this.handlers[name].push(handler);
        } else {
            this.handlers[name] = [handler];
        }
    },

    off: function (name, handler) {
    },

    emit: function (name) {

        var i,
            args = [].slice.call(arguments, 1);

        if (name in this.handlers) {
            for (i = 0; i < this.handlers[name].length; i++) {
                this.handlers[name][i].apply(null, args);
            }
        }
    }

};

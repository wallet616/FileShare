// Global objects:
var animatedBackground;

// Background class:
class AnimatedBackground {
    constructor(id, bg_url) {
        // Values:
        this.element = document.getElementById(id);
        this.height = 0;
        this.width = 0;
        this.speed = 20;
        this.refTime = 100;

        this.current_pos_x = 0.0;
        this.destination_pos_x = 0.0;
        this.destination_chart = 0;
        this.move_need = true;
        this.timer = 0.0;

        $(this.element).css({
            "position": "fixed",
            "margin": "0",
            "padding": "0",
            "z-index": "-100",
            "top": "0",
            "left": "0",
            "background-size": "100% 100%",
            "background-repeat": "no-repeat",
            "background-position": "center",
            "background-image": "url(" + bg_url + ")"
        });

        this.resize();
        $(window).resize(() => this.resize());

        this.reDraw();
    }

    resize() {
        if (this.width !== window.innerWidth || this.height !== window.innerHeight) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            $(this.element).css({
                "width": 1.2 * this.width,
                "height": this.height
            });

            this.move_need = true;
            this.refTime = 20;
        }
    }

    reDraw() {
        if (this.move_need) {
            this.calcDestination();

            this.current_pos_x += (this.destination_pos_x - this.current_pos_x) * (1.0 / this.speed);

            var dist = this.destination_pos_x - this.current_pos_x;
            if (dist * dist < 2.0) {
                this.current_pos_x = this.destination_pos_x;
                this.move_need = false;

                this.refTime = 100;
            }

            this.element.style.left = -this.current_pos_x + "px";
        }

        setTimeout(() => this.reDraw(), this.refTime);
    }

    setDestination(id) {
        this.move_need = true;
        this.destination_chart = id;
        this.refTime = 20;
    }

    calcDestination() {
        switch (this.destination_chart) {
            case 0:
                this.destination_pos_x = 0.0;
                this.speed = 10;
                break;

            case 1:
                this.destination_pos_x = 0.06 * this.width;
                this.speed = 200;
                break;

            case 2:
                this.destination_pos_x = 0.2 * this.width;
                this.speed = 10;
                break;

            case 3:
                this.destination_pos_x = 0.15 * this.width;
                this.speed = 50;
                break;

            default:
                this.destination_pos_x = 0.0;
                this.speed = 100;
                break;
        }
    }
}

// Ready
$(document).ready(function() {
    animatedBackground = new AnimatedBackground("animated-background-hook", "/img/bg.jpg");

    animatedBackground.setDestination(3);
});
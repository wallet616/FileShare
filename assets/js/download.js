"use strict";

var download_started = false;

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function base64_to_array_buffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

$(document).ready(function() {
    $(".download-button").click(function() {
        var id = $(this).data("id");

        $.ajax({
            method: "GET",
            data: {
                id: id
            },
            url: "/ajax/download",
            success: function(response) {
                console.log(response);
                var originaldata = base64_to_array_buffer(response.data);
                download(originaldata, response.name, 'text/plain');
            },
            error: function(response) {
                ALERT.push(ALERT_TYPE.DANGER, "Błąd", "Moduł pobierania nie odpowiada.");
            }
        });
    });
});
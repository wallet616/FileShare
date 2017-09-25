"use strict";

var list_element_view = undefined;

var current_expanded = undefined;
var previous_expanded = undefined;

var file_to_upload_selected = false;
var file_to_upload_lock = false;
var file_to_upload = {
    name: "",
    expire_date: "",
    expire_never: true,
    //extension: "",
    data: ""
};

$(document).ready(function() {
    $(".button-upload").on("click", upload_button);
    $(".button-upload-cancel").on("click", cancel_upload_button);
    $("#edit-file").on("change", file_to_upload_listener);
    $("#files_list").on("click", ".more-element-details", expand_details);
    $("#files_list").on("click", ".button-delete", expand_delete);
    $("#files_list").on("click", ".button-delete-cancel", cancel_delete);
    $("#files_list").on("click", ".button-delete-confirm", confirm_delete);
    $("#files_list").on("click", ".button-cancel", cancel_button);
    $("#files_list").on("click", ".button-download", download_button);
    $("#files_list").on("click", ".element-link-to-download", copy_link_to_download);
    $("#files_list").on("click", ".button-save", save_button);

    refresh_upload_information();
    refresh_list();
});

function copy_link_to_download() {
    var el = $(this).parent().parent().parent();

    var textarea = $("<textarea></textarea>");
    textarea.css({
        "opacity": "0",
        "position": "fixed",
        "z-index": "-99999"
    });
    var new_link = document.location.origin + "/download?id=" + el.data("id");
    textarea.val(new_link);
    $("body").append(textarea);
    textarea.select();
    document.execCommand('copy');

    textarea.remove();
}

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

function download_button() {
    $.ajax({
        method: "GET",
        data: {
            id: current_expanded.data("id")
        },
        url: "/ajax/download",
        success: function(response) {
            var originaldata = base64_to_array_buffer(response.data);
            download(originaldata, response.name, 'text/plain');
        },
        error: function(response) {
            ALERT.push(ALERT_TYPE.DANGER, "Błąd", "Moduł pobierania nie odpowiada.");
        }
    });
}


function cancel_button() {
    get_list();
}

function cancel_delete() {
    current_expanded.find(".button-delete").removeClass("hide");
    current_expanded.find(".button-delete-confirm").addClass("hide");
    current_expanded.find(".button-delete-cancel").addClass("hide");
}

function confirm_delete() {
    $.ajax({
        method: "POST",
        url: "/ajax/panel",
        dataType: 'json',
        data: {
            command: "delete",
            id: current_expanded.data("id")
        },
        beforeSend: function() {
            file_to_upload_lock = true;
        },
        success: function(response) {
            ALERT.push(ALERT_TYPE.SUCCESS, "Sukces", "Plik usunięty pomyślnie.");

            file_to_upload_lock = false;
            cancel_upload_button();
            refresh_list();
        },
        error: function(response) {
            ALERT.push(ALERT_TYPE.DANGER, "Błąd serwera", "Nie można usunąć pliku.");
            console.error(response);

            file_to_upload_lock = false;
            cancel_upload_button();
        }
    });
}


function expand_delete() {
    if (previous_expanded) {
        previous_expanded.find(".button-delete").removeClass("hide");
        previous_expanded.find(".button-delete-confirm").addClass("hide");
        previous_expanded.find(".button-delete-cancel").addClass("hide");
    }

    current_expanded.find(".button-delete").addClass("hide");
    current_expanded.find(".button-delete-confirm").removeClass("hide");
    current_expanded.find(".button-delete-cancel").removeClass("hide");
}


function expand_details() {
    previous_expanded = current_expanded;
    current_expanded = $(this).parent().parent().parent();

    if (previous_expanded) {
        previous_expanded.find(".file-detail-edit").addClass("hide");
    }

    current_expanded.find(".file-detail-edit").removeClass("hide");
}

function get_new_date() {
    var today = new Date();
    today.setDate(today.getDate() + 1);
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '-' + mm + '-' + dd;

    return today;
}

function array_buffer_to_base64(buffer) {
    var binary = '';
    var buff = new Uint8Array(buffer);
    var len = buff.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(buff[i]);
    }
    return btoa(binary);
}

function file_to_upload_listener() {
    if (file_to_upload_lock) return;

    var file = $("#edit-file")[0];
    file = file.files[0];
    if (file) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var extension = file.name.split(".");
            extension = extension[extension.length - 1];

            file_to_upload.name = file.name;
            file_to_upload.extension = extension;
            file_to_upload.data = array_buffer_to_base64(reader.result);
            //console.log(reader.result);
            //var a = array_buffer_to_base64(reader.result);
            //console.log(a);
            //console.log(base64_to_array_buffer(a));

            if (file_to_upload.expire_date == "")
                file_to_upload.expire_date = get_new_date();

            file_to_upload_selected = true;
            refresh_upload_information();
        }

        reader.readAsArrayBuffer(file);
    } else {
        file_to_upload_selected = false;
    }
}

function save_button() {
    if (!current_expanded) return;

    var id = current_expanded.data("id");
    var new_name = current_expanded.find(".element_file_name").val();
    var new_expires = current_expanded.find(".element_file_expires").val();
    var new_expires_never = current_expanded.find(".element_file_expires_never").prop("checked");

    $.ajax({
        method: "POST",
        url: "/ajax/panel",
        dataType: 'json',
        data: {
            command: "change",
            id: id,
            name: new_name,
            expires: new_expires,
            expires_never: new_expires_never
        },
        beforeSend: function() {
            file_to_upload_lock = true;
        },
        success: function(response) {
            ALERT.push(ALERT_TYPE.SUCCESS, "Sukces", "Dane pliku zmienione pomyślnie.");

            file_to_upload_lock = false;
            cancel_upload_button();
            refresh_list();
        },
        error: function(response) {
            ALERT.push(ALERT_TYPE.DANGER, "Błąd serwera", "Nie można zmienić danych pliku pliku.");
            console.error(response);

            file_to_upload_lock = false;
            cancel_upload_button();
        }
    });
}


function refresh_upload_information() {
    $("#new_file_name").val(file_to_upload.name);
    $("#new_file_expires_never").prop("checked", file_to_upload.expire_never);
    $("#new_file_expires_date").val(file_to_upload.expire_date);
    $("#edit-file").val("");
}

function cancel_upload_button() {
    if (file_to_upload_lock) return;

    file_to_upload_selected = false;
    file_to_upload = {
        name: "",
        expire_date: "",
        expire_never: true,
        //extension: "",
        data: ""
    };

    refresh_upload_information();
}

function upload_button() {
    if (!file_to_upload_selected) return;
    if (file_to_upload_lock) return;

    file_to_upload.name = $("#new_file_name").val();
    file_to_upload.expire_date = $("#new_file_expires_date").val();
    file_to_upload.expire_never = $("#new_file_expires_never").prop("checked");

    file_to_upload.command = "upload";

    $.ajax({
        method: "POST",
        url: "/ajax/panel",
        dataType: 'json',
        data: file_to_upload,
        beforeSend: function() {
            file_to_upload_lock = true;
        },
        success: function(response) {
            ALERT.push(ALERT_TYPE.SUCCESS, "Sukces", "Plik wysłany pomyślnie.");

            file_to_upload_lock = false;
            cancel_upload_button();
            refresh_list();
        },
        error: function(response) {
            ALERT.push(ALERT_TYPE.DANGER, "Błąd serwera", "Nie można wysłać pliku.");
            console.error(response);

            file_to_upload_lock = false;
            cancel_upload_button();
        }
    });
}


function display_list(list) {
    var new_list = "";

    for (var i in list) {
        var expires = (list[i].never_exipres == "true") ? "nigdy" : list[i].expires;
        var expires_checkbox = (list[i].never_exipres == "true") ? "checked" : "";
        var new_size = parseFloat(list[i].size / 1000000).toFixed(2);

        var new_item = list_element_view
            .replace(/{file_id}/g, list[i].id)
            .replace("{file_name}", list[i].name)
            .replace("{size}", new_size)
            .replace("{file_name_val}", list[i].name)
            .replace("{time_expires}", expires)
            .replace("{expires_never}", expires_checkbox)
            .replace("{time_expires_value}", list[i].expires);

        new_list += new_item;
    }

    $("#files_list").html(new_list);
}


function get_list() {
    $.ajax({
        method: "POST",
        url: "/ajax/panel",
        dataType: 'json',
        data: { command: "get_list" },
        beforeSend: function() {

        },
        success: function(response) {
            display_list(response.data);
        },
        error: function(response) {
            ALERT.push(ALERT_TYPE.DANGER, "Błąd serwera", "Nie można pobrać listy plików.");
            console.error(response);
        }
    });
}


function refresh_list() {
    if (!list_element_view) {
        list_element_view = $("#files_list").html();
    }

    get_list();
}
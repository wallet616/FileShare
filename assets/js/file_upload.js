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

    refresh_upload_information();
    refresh_list();
});

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
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
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

        var new_item = list_element_view
            .replace("{file_id}", list[i].id)
            .replace("{file_name}", list[i].name)
            .replace("{file_name_val}", list[i].name)
            .replace("{time_expires}", list[i].expires)
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
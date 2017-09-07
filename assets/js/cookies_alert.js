$(document).ready(function() {
    function cookies_accepted() {
        $.ajax({
            method: "POST",
            data: "{}",
            url: "/ajax/cookies_alert",
            dataType: 'json',
            cache: false,
            processData: false,
            success: function(response) {
                console.log(response)
                if (response.status === "OK") {
                    $(".cookies-alert").addClass("dismiss");
                } else {
                    ALERT.push(ALERT_TYPE.DANGER, "Błąd", "Nie serwer nie akceptuje zapytania.");
                }
            },
            error: function(response) {
                ALERT.push(ALERT_TYPE.DANGER, "Błąd", "Moduł ciasteczek nie odpowiada.");
            }
        });
    }

    $("#cookies_accept").click(function() {
        cookies_accepted();
    });
});
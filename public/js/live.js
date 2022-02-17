var clock_going = 0;

document.addEventListener("DOMContentLoaded", function (event) {

    var team1_input = document.querySelector("#team1_score_input");
    var team1_score = document.querySelector("#team1_score");
    var team1_plus1 = document.querySelector("#team1_plus1");
    var team1_update = document.querySelector("#team1_score_update");
    var team2_input = document.querySelector("#team2_score_input");
    var team2_plus1 = document.querySelector("#team2_plus1");
    var team2_update = document.querySelector("#team2_score_update")
    var team2_score = document.querySelector("#team2_score");

    let url;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        url = 'http://localhost:3000'
    } else {
        url = 'https://nepalscores.herokuapp.com'
    }

//fixture tala aune
    // document.getElementById('fixButton').addEventListener('click', function (e) {
    //     var fixture_title = document.getElementById("selectFixture").value;
    //     console.log("Tournament title is ", fixture_title);
    //     document.getElementById('scoreboardTitle').setAttribute('value', fixture_title);      
    //     e.preventDefault();  
    // })

    document.getElementById('fixtureButton').addEventListener('click', function (e) {
        var fixture_title = document.getElementById("selectFixture").value;
        console.log("Tournament title is ", fixture_title);
        document.getElementById('scoreboardTitle').setAttribute('value', fixture_title);        
    })

    //fetches the fixtures
    fetch(url + '/api/fixtures')
        .then(response => response.json())
        .then(data => {
            options = data.map(item => item.fixname)
            var select = document.getElementById("selectFixture");
            
            for (var i = 0; i < options.length; i++) {
                var opt = options[i];

                var el = document.createElement("option");

                el.text = opt;
                el.value = opt;

                select.add(el);
            }
        });

    // TEAM 1 SCORE
    team1_plus1.addEventListener("click", function (e) {
        var oldscore = parseInt(team1_input.value, 10);
        var newscore = oldscore + 1;
        team1_input.value = newscore;
        team1_score.innerText = newscore;
    }, false);

    team1_update.addEventListener("click", function (e) {
        var newscore = parseInt(team1_input.value, 10);
        team1_input.value = newscore;
        team1_score.innerText = newscore;
    }, false);
    team1_input.addEventListener("keypress", function (event) {
        if (event.key == 'Enter') {
            team1_update.click();
        }
    });

    // TEAM 2 SCORE		
    team2_plus1.addEventListener("click", function (e) {
        var oldscore = parseInt(team2_input.value, 10);
        var newscore = oldscore + 1;
        team2_input.value = newscore;
        team2_score.innerText = newscore;
    }, false);

    team2_update.addEventListener("click", function (e) {
        var newscore = parseInt(team2_input.value, 10);
        team2_input.value = newscore;
        team2_score.innerText = newscore;
    }, false);

    team2_input.addEventListener("keypress", function (event) {
        if (event.key == 'Enter') {
            team2_update.click();
        }
    });


    // Extra Time MESSAGE
    document.querySelector("#show_msg").addEventListener("click", function (e) {
        document.querySelector("#downdist").innerText = document.querySelector("#downdist_input").value;
    }, false);


    // $("#show_msg").click(function() {
    // $("#downdist").text($("#downdist_input").val());
    // });

    $("#downdist_input").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#show_msg").click();
        }
    });

    $("#show_kickoff").click(function () {
        $("#downdist").text("Kickoff");
    });



    // Half
    $("#qtr_1").click(function () {
        $("#qtr").text("1st Half");
    });
    $("#qtr_2").click(function () {
        $("#qtr").text("2nd Half");
    });
    $("#qtr_ot").click(function () {
        $("#qtr").text("ET");
    });
    $("#qtr_half").click(function () {
        $("#qtr").text("Half");
        $("#downdist").text("");
        $('#clock_input_min').val("45");
        $('#clock_input_sec').val("00");
        $('#clock_update').click();
        $('#clock_start').click();
    });

    // CLOCK
    $("#clock_start").click(function () {
        if (clock_going == 0) {
            clock = setInterval('countUp()', 1000);
            clock_going = 1;
        }
    });

    $("#clock_stop").click(function () {
        clearInterval(clock);
        clock_going = 0;
        $("#clock_input_min").val($('#clock_min').html());
        $("#clock_input_sec").val($('#clock_sec').html());
    });

    $("#clock_update").click(function () {
        //clock_going = 0; clearInterval(clock); // THIS WOULD STOP THE CLOCK WHILE UPDATING - uncomment if needed
        $('#clock_min').html($("#clock_input_min").val());
        $('#clock_sec').html($("#clock_input_sec").val());
    });

    $("#clock_plus").click(function () {

        clearInterval(clock);
        var m = $('#clock_min');
        var s = $('#clock_sec');
        if ((parseInt(s.html()) == 59)) {
            m.html(parseInt(m.html()) + 1);
            s.html("00");
        } else {
            if ((parseInt(s.html()) + 1) < 10) { s.html("0" + (parseInt(s.html()) + 1)); } else {
                s.html(parseInt(s.html()) + 1);
            }
        }
        if (clock_going == 1) { clock = setInterval('countUp()', 1000); }

        $("#clock_input_min").val($('#clock_min').html());
        $("#clock_input_sec").val($('#clock_sec').html());

    });

    $("#clock_minus").click(function () {

        clearInterval(clock);
        var m = $('#clock_min');
        var s = $('#clock_sec');
        if ((parseInt(s.html()) == 00)) {
            m.html(parseInt(m.html()) - 1);
            s.html("59");
        } else {
            if ((parseInt(s.html()) - 1) < 10) { s.html("0" + (parseInt(s.html()) - 1)); } else {
                s.html(parseInt(s.html()) - 1);
            }
        }


        $("#clock_input_min").val($('#clock_min').html());
        $("#clock_input_sec").val($('#clock_sec').html());

    });

    $("#clock_input_min").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#clock_update").click();
        }
    });

    $("#clock_input_sec").keyup(function (event) {
        if (event.keyCode == 13) {
            $("#clock_update").click();
        }
    });

});

function countUp() {
    var m = $('#clock_min');
    var s = $('#clock_sec');
    if (m.html() == "45" && s.html() == "00") {
        clearInterval(clock);
        clock_going = 0;
        return;
    }
    if ((parseInt(s.html()) == 59)) {
        m.html(parseInt(m.html()) + 1);
        s.html("00");
    } else {
        if ((parseInt(s.html()) + 1) < 10) { s.html("0" + (parseInt(s.html()) + 1)); } else {
            s.html(parseInt(s.html()) + 1);
        }
    }
}

document.addEventListener("DOMContentLoaded", function (event) {

    document.addEventListener("keypress", function (event) {
        // console.log(event);
        var keyName = event.key;
        if (keyName == 'w') { //left
            document.querySelector("#clock_start").click();
        }
        if (keyName == 'd') { //up
            document.querySelector("#clock_plus").click();
        }
        if (keyName == 's') { //right
            document.querySelector("#clock_stop").click();
        }
        if (keyName == 'a') { //down
            document.querySelector("#clock_minus").click();
        }

    });

});




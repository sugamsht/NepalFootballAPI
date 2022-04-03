var clock_going = 0;

document.addEventListener("DOMContentLoaded", function (event) {

    var team1_input = document.querySelector("#team1_score_input");
    var team1_score = document.querySelector("#team1_score");
    var team1_name = document.querySelector("#team1");
    var team1_plus1 = document.querySelector("#team1_plus1");
    var team1_update = document.querySelector("#team1_score_update");
    var team2_name = document.querySelector("#team2");
    var team2_input = document.querySelector("#team2_score_input");
    var team2_plus1 = document.querySelector("#team2_plus1");
    var team2_update = document.querySelector("#team2_score_update")
    var team2_score = document.querySelector("#team2_score");
    var minutes = document.querySelector("#clock_min");
    var timer = document.querySelector("#qtr");
    var qtr_1 = document.querySelector("#qtr_1");
    var qtr_2 = document.querySelector("#qtr_2");
    var qtr_ft = document.querySelector("#qtr_ft");
    var qtr_et = document.querySelector("#qtr_et");
    var qtr_half = document.querySelector("#qtr_half");

    var fix1 = document.querySelector("#scoreboardTitle");

    let url;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        url = 'http://localhost:3000'
    } else {
        url = 'https://nepalscores.herokuapp.com'
    }

    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for (i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }

    //fixture tala aune
    document.getElementById('fixtureButton').addEventListener('click', function (e) {
        var fixture_title = document.getElementById("selectFixture").value;
        console.log("Tournament title is ", fixture_title);
        document.getElementById('scoreboardTitle').setAttribute('value', fixture_title);
        console.log('Maile leko is: ', fix1.value);
        var result = fix1.value?.split(' vs ');
        var team1 = result[0];
        var team2 = result[1];



        fetch(url + '/api/scoreboard/')
            .then(response => response.json())
            .then(data => {
                var score1 = data[0].score1;
                var score2 = data[0].score2;
                var timer = data[0].timer;
                var team1 = data[0].team1;
                var team2 = data[0].team2;
                console.log("yo live data aako", data);
                team1_score.innerHTML = score1;
                team1_input.value = score1;
                team2_score.innerHTML = score2;
                team2_input.value = score2;
                console.log("timer is", timer);
                var [team1, team2] = data[0].fixname?.split(' vs ');
                minutes.innerHTML = timer;
                team1_name.innerHTML = team1;
                team2_name.innerHTML = team2;
            }
            );

        //fetches the players
        fetch(url + '/api/players')
            .then(response => response.json())
            .then(data => {
                // console.log("Players are ", data);
                // console.log('Team 1 is: ', team1);
                // console.log('Team 2 is: ', team2);

                var select = document.getElementById("selectPlayer");
                removeOptions(select)

                for (var j = 0; j < data.length; j++) {
                    // console.log('hereko hai ', data[j].team_name);
                    if (data[j].team_name === team1 || data[j].team_name === team2) {
                        // console.log("Chaine Players are ", data[j]);
                        var el = document.createElement("option");
                        options = data[j].fname + " " + data[j].lname;
                        el.text = options;
                        el.value = options;
                        select.add(el);
                        // }  
                    }
                }
                select.selectedIndex = -1;
            });
    })

    //fetches the fixtures
    fetch(url + '/api/fixtures')
        .then(response => response.json())
        .then(data => {
            data.sort(function (a, b) {
                var dateA = new Date(a.date), dateB = new Date(b.date)
                return dateA - dateB
            });
            var fullDay = new Date();
            var today = new Date(fullDay.toDateString());
            var yochai;
            // console.log('first wala', today);
            for (let j = 0; j < data.length; j++) {
                var datea = new Date(data[j].date);
                // console.log("1st date hai", datea);
                if (datea >= today) {
                    yochai = data.slice(j, j + 5);
                    break;
                }
            }
            console.log("Fixtures are ", yochai);
            options = yochai.map(item => item.fixname)
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

    //timer
    // qtr_1.addEventListener('click', function (e) {
    //     timer.value = 'First Half';
    // }, false);
    // qtr_2.addEventListener('click', function (e) {
    //     timer.value = 'Second half';
    // }, false);
    // qtr_et.addEventListener('click', function (e) {
    //     timer.value = 'Extra Time';
    // }, false);
    // qtr_ft.addEventListener('click', function (e) {
    //     timer.value = 'Full Time';
    // }, false);
    // qtr_half.addEventListener('click', function (e) {
    //     timer.value = 'Half Time';
    // }, false);



    // Extra Time MESSAGE
    // document.querySelector("#show_msg").addEventListener("click", function (e) {
    //     document.querySelector("#downdist").innerText = document.querySelector("#downdist_input").value;
    // }, false);


    // $("#show_msg").click(function() {
    // $("#downdist").text($("#downdist_input").val());
    // });

    // $("#downdist_input").keyup(function (event) {
    //     if (event.keyCode == 13) {
    //         $("#show_msg").click();
    //     }
    // });

    // $("#show_kickoff").click(function () {
    //     $("#downdist").text("Kickoff");
    // });

    // qtr_half.click(function () {
    //     timer.value = 'Half Time';
    //     // $("#qtr").text("Half");
    //     // $("#downdist").text("");
    //     // $('#clock_input_min').val("45");
    //     // $('#clock_input_sec').val("00");
    //     // $('#clock_update').click();
    //     // $('#clock_start').click();
    // });

    // CLOCK
    $("#clock_start").click(function () {
        if (clock_going == 0) {
            clock = setInterval('countUp()', 1000 * 60);
            clock_going = 1;
            $("#clock_start").text("Stop Clock");
            $("#clock_input_min").val($('#clock_min').html());
        }
        else {
            clearInterval(clock);
            clock_going = 0;
            $("#clock_input_min").val($('#clock_min').html());
            $("#clock_start").text("Start Clock");
        }
    });

    // $("#clock_stop").click(function () {
    //     clearInterval(clock);
    //     clock_going = 0;
    //     $("#clock_input_min").val($('#clock_min').html());
    //     $("#clock_input_sec").val($('#clock_sec').html());
    // });

    $("#clock_update").click(function () {
        //clock_going = 0; clearInterval(clock); // THIS WOULD STOP THE CLOCK WHILE UPDATING - uncomment if needed
        $('#clock_min').html($("#clock_input_min").val());
    });

    $("#clock_plus").click(function () {
        // clearInterval(clock);
        var m = $('#clock_min');
        m.html(parseInt(m.html()) + 1);
        $("#clock_input_min").val($('#clock_min').html());

    });

    $("#clock_minus").click(function () {
        // clearInterval(clock);
        var m = $('#clock_min');
        m.html(parseInt(m.html()) - 1);
        $("#clock_input_min").val($('#clock_min').html());

    });

    //key to change the clock
    document.addEventListener("keypress", function (event) {
        var keyName = event.key;
        if (keyName == '+') { //up
            document.querySelector("#clock_plus").click();
        }
        if (keyName == '-') { //down
            document.querySelector("#clock_minus").click();
        }
    });
});

// function countUp() {
//     var m = $('#clock_min');
//     var s = $('#clock_sec');
//     if (m.html() == "45" && s.html() == "00") {
//         clearInterval(clock);
//         clock_going = 0;
//         return;
//     }
//     if ((parseInt(s.html()) == 59)) {
//         m.html(parseInt(m.html()) + 1);
//         s.html("00");
//     } else {
//         if ((parseInt(s.html()) + 1) < 10) { s.html("0" + (parseInt(s.html()) + 1)); } else {
//             s.html(parseInt(s.html()) + 1);
//         }
//     }
// }

function countUp() {
    var m = $('#clock_min');
    // var i = $('#clock_input_min');
    // i.html(parseInt(i.html()) + 1);
    m.html(parseInt(m.html()) + 1);
    $("#clock_input_min").val($('#clock_min').html());
}



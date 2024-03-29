var clockGoing = 0;

document.addEventListener("DOMContentLoaded", function (event) {
    var team1Input = document.querySelector("#team1_score_input");
    var team1Score = document.querySelector("#team1_score");
    var team1Name = document.querySelector("#team1");
    var team1Plus1 = document.querySelector("#team1_plus1");
    var team1Update = document.querySelector("#team1_score_update");
    var team2Name = document.querySelector("#team2");
    var team2Input = document.querySelector("#team2_score_input");
    var team2Plus1 = document.querySelector("#team2_plus1");
    var team2Update = document.querySelector("#team2_score_update");
    var team2Score = document.querySelector("#team2_score");
    var clock_input_min = document.querySelector("#clock_input_min");
    var minutes = document.querySelector("#clock_min");
    var fix1 = document.querySelector("#scoreboardTitle");
    var select1 = document.getElementById("selectPlayer1");
    var select2 = document.getElementById("selectPlayer2");

    document.getElementById('titleButton').addEventListener('click', function (e) {
        var tournament_title = document.getElementById("selectTournament").value;
        document.getElementById('resultTitle').setAttribute('value', tournament_title);
    });

    document.getElementById('fixtureButton').addEventListener('click', function (e) {
        var fixtureTitle = document.getElementById("selectFixture").value;
        document.getElementById('scoreboardTitle').setAttribute('value', fixtureTitle);
        console.log('Maile leko is: ', fix1.value);
        var result = fix1.value?.split(' vs ');
        var team1 = result[0];
        var team2 = result[1];

        fetch(url + '/api/scoreboard/')
            .then(response => response.json())
            .then(data => {
                const [score1, score2, timer] = [data[0].score1, data[0].score2, data[0].timer];
                console.log("yo live data aako", data);
                team1Score.innerHTML = score1;
                team1Input.value = score1;
                team2Score.innerHTML = score2;
                team2Input.value = score2;
                console.log("timer is", timer);
                minutes.innerHTML = timer;
                clock_input_min.value = timer;
                team1Name.innerHTML = team1;
                team2Name.innerHTML = team2;

                const [lineupa, lineupb] = data[0].lineup.map(lineup => lineup.split(','));

                removeOptions(select1);
                removeOptions(select2);

                lineupa.forEach(player => select1.add(new Option(player, player)));
                $("#selectPlayer1").prepend("<option value='null' selected='selected'></option>");

                lineupb.forEach(player => select2.add(new Option(player, player)));
                $("#selectPlayer2").prepend("<option value='null' selected='selected'></option>");

                const team1PlayerList = data?.[0]?.fixObject?.team1Object[0]?.playerList || [];
                const team2PlayerList = data?.[0]?.fixObject?.team2Object[0]?.playerList || [];

                renderPlayerList(team1PlayerList, document.getElementById("lineup_div"));
                renderPlayerList(team2PlayerList, document.getElementById("lineup_div1"));
            })
            .catch(error => console.error('Fetch error:', error));
    });

    function renderPlayerList(playerList, container) {
        container.innerHTML = ""; // Clear existing content
        playerList.forEach(player => {
            const fullName = `${player.tournament[0].jersey_no}. ${player.fname} ${player.lname}`;
            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = `${player.jersey_no} ${player.fname} ${player.lname}`;
            input.value = `${player.tournament[0].jersey_no}. ${player.fname} ${player.lname}`;
            container.appendChild(document.createTextNode(fullName));
            container.appendChild(input);
            container.appendChild(document.createElement("br"));
        });
    }

    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for (i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }

    //Lineup
    document.getElementById("showTeam1").addEventListener("click", function () {
        var x = document.querySelector("#lineup_div");
        x.style.display = "block";
        document.querySelector("#showTeam1").style.display = "none";
    });

    document.getElementById("showTeam2").addEventListener("click", function () {
        var x = document.querySelector("#lineup_div1");
        x.style.display = "block";
        document.querySelector("#showTeam2").style.display = "none";
    });

    document.getElementById('fixButton').addEventListener('click', function (e) {
        var lineup1Array = [];
        document.querySelector("#lineup_div")
            .querySelectorAll('input:checked').forEach(function (item) {
                lineup1Array.push(item.value);
            });
        var lineup2Array = [];
        document.querySelector("#lineup_div1")
            .querySelectorAll('input:checked').forEach(function (item) {
                lineup2Array.push(item.value);
            });
        document.getElementById('line1').setAttribute('value', lineup1Array);
        document.getElementById('line2').setAttribute('value', lineup2Array);
    });

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

            for (let j = 0; j < data.length; j++) {
                var datea = new Date(data[j].date);
                if (datea >= today) {
                    yochai = data.slice(j, j + 5);
                    break;
                }
            }
            console.log("Fixtures are ", yochai);
            var select = document.getElementById("selectFixture");
            yochai.forEach(item => {
                var el = document.createElement("option");
                el.text = item.fixname;
                el.value = item.fixname;
                select.add(el);
            });
        })
        .catch(error => console.error('Fetch error:', error));

    team1Plus1.addEventListener("click", function (e) {
        var oldScore = parseInt(team1Input.value, 10);
        var newScore = oldScore + 1;
        team1Input.value = newScore;
        team1Score.innerText = newScore;
    }, false);

    team1Update.addEventListener("click", function (e) {
        var newScore = parseInt(team1Input.value, 10);
        team1Input.value = newScore;
        team1Score.innerText = newScore;
    }, false);

    team2Plus1.addEventListener("click", function (e) {
        var oldScore = parseInt(team2Input.value, 10);
        var newScore = oldScore + 1;
        team2Input.value = newScore;
        team2Score.innerText = newScore;
    }, false);

    team2Update.addEventListener("click", function (e) {
        var newScore = parseInt(team2Input.value, 10);
        team2Input.value = newScore;
        team2Score.innerText = newScore;
    }, false);

    $("#clock_start").click(function () {
        if (clockGoing === 0) {
            clock = setInterval(countUp, 1000 * 60);
            clockGoing = 1;
            $("#clock_start").text("Stop Clock");
            $("#clock_input_min").val($('#clock_min').html());
        } else {
            clearInterval(clock);
            clockGoing = 0;
            $("#clock_input_min").val($('#clock_min').html());
            $("#clock_start").text("Start Clock");
        }
    });

    $("#clock_update").click(function () {
        $('#clock_min').html($("#clock_input_min").val());
    });

    $("#clock_plus").click(function () {
        var m = $('#clock_min');
        m.html(parseInt(m.html()) + 1);
        $("#clock_input_min").val(m.html());
    });

    $("#clock_minus").click(function () {
        var m = $('#clock_min');
        m.html(parseInt(m.html()) - 1);
        $("#clock_input_min").val(m.html());
    });

    document.addEventListener("keypress", function (event) {
        var keyName = event.key;
        if (keyName === '+') {
            $("#clock_plus").click();
        }
        if (keyName === '-') {
            $("#clock_minus").click();
        }
    });
});

function countUp() {
    var m = $('#clock_min');
    m.html(parseInt(m.html()) + 1);
    $("#clock_input_min").val(m.html());
}


document.addEventListener("DOMContentLoaded", function (event) {
    let url;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "") {
        url = 'http://localhost:3000'
    } else {
        url = 'https://nepalscores.herokuapp.com'
    }
    console.log("This is your live site ", url + '/api/teams');

    document.getElementById('titleButton').addEventListener('click', function (e) {
        var tournament_title = document.getElementById("selectTournament").value;
        console.log("Tournament title is ", tournament_title);
        document.getElementById('resultTitle').setAttribute('value', tournament_title);
        document.getElementById('teamTitle').setAttribute('value', tournament_title);
        document.getElementById('fixtureTitle').setAttribute('value', tournament_title);
        document.getElementById('tournament_title').setAttribute('value', tournament_title);
    })

    function removeOptions(selectElement) {
        var i, L = selectElement.options.length - 1;
        for (i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
    }

    fetch(url + '/api/tournaments')
        .then(response => response.json())
        .then(data => {

            var optionsd = data.map(item => item.title)
            var select0 = document.getElementById("selectTournament");

            console.log("This is your data ", optionsd);

            for (var i = 0; i < optionsd.length; i++) {
                var opt = optionsd[i];
                var el = document.createElement("option");
                el.text = opt;
                el.value = opt;
                select0.add(el);
            }

            document.getElementById('titleButton').addEventListener('click', function (e) {
                var tournament_title = document.getElementById("selectTournament").value;
                // console.log("Tournament title is ", tournament_title);
                var select = document.getElementById("selectTeam");
                var select1 = document.getElementById("selectTeam1");
                var select2 = document.getElementById("selectTeam2");

                var selectf1 = document.getElementById("selectFixture");
                var selectf2 = document.getElementById("selectFixture1");

                var selectr = document.getElementById("selectResult");


                if (tournament_title === "International Friendlies") {
                    removeOptions(select);
                    removeOptions(select1);
                    removeOptions(select2);
                    removeOptions(selectf1);
                    removeOptions(selectf2);
                    removeOptions(selectr);

                    var opt2 = data[1].resultList.map(item2 => item2.fixtureResult);
                    console.log("This is your result list ", opt2);
                    for (var i = 0; i < opt2.length; i++) {
                        var opt = opt2[i];
                        var el = document.createElement("option");
                        el.text = opt;
                        el.value = opt;
                        selectr.add(el);
                    }

                    var opt1 = data[1].fixtureList.map(item1 => item1.fixname);
                    console.log("This is your fixture list ", opt1);
                    for (var i = 0; i < opt1.length; i++) {
                        var opt = opt1[i];
                        var el = document.createElement("option");
                        var el1 = document.createElement("option");
                        el.text = opt;
                        el.value = opt;
                        selectf1.add(el);
                        el1.text = opt;
                        el1.value = opt;
                        selectf2.add(el1);
                    }

                    var opt = data[1].teamList.map(item => item?.name);
                    console.log("This is the team list ", opt);
                    for (var i = 0; i < opt.length; i++) {
                        var option = opt[i];
                        var el = document.createElement("option");
                        var el1 = document.createElement("option");
                        var el2 = document.createElement("option");
                        el.text = option;
                        el.value = option;
                        select.add(el);
                        el1.text = option;
                        el1.value = option;
                        select1.add(el1);
                        el2.text = option;
                        el2.value = option;
                        select2.add(el2);
                    }

                }
                else if (tournament_title === "NSL - Nepal Super League 2022") {
                    removeOptions(select);
                    removeOptions(select1);
                    removeOptions(select2);
                    removeOptions(selectf1);
                    removeOptions(selectf2);
                    removeOptions(selectr);

                    var opt2 = data[2].resultList.map(item2 => item2.fixtureResult);
                    console.log("This is your result list ", opt2);
                    for (var i = 0; i < opt2.length; i++) {
                        var opt = opt2[i];
                        var el = document.createElement("option");
                        el.text = opt;
                        el.value = opt;
                        selectr.add(el);
                    }

                    var opt1 = data[2].fixtureList.map(item1 => item1.fixname);
                    console.log("This is your fixture list ", opt1);
                    for (var i = 0; i < opt1.length; i++) {
                        var opt = opt1[i];
                        var el = document.createElement("option");
                        var el1 = document.createElement("option");
                        el.text = opt;
                        el.value = opt;
                        selectf1.add(el);
                        el1.text = opt;
                        el1.value = opt;
                        selectf2.add(el1);
                    }
                    var opt = data[2].teamList.map(item => item?.name);
                    console.log("This is the team list ", opt);
                    for (var i = 0; i < opt.length; i++) {
                        var option = opt[i];
                        var el = document.createElement("option");
                        var el1 = document.createElement("option");
                        var el2 = document.createElement("option");
                        el.text = option;
                        el.value = option;
                        select.add(el);
                        el1.text = option;
                        el1.value = option;
                        select1.add(el1);
                        el2.text = option;
                        el2.value = option;
                        select2.add(el2);
                    }
                }
                else if (tournament_title === "Martyr's Memorial A-Division League (2078)") {
                    removeOptions(select);
                    removeOptions(select1);
                    removeOptions(select2);
                    removeOptions(selectf1);
                    removeOptions(selectf2);
                    removeOptions(selectr);

                    var opt2 = data[0].resultList.map(item2 => item2.fixtureResult);
                    console.log("This is your result list ", opt2);
                    for (var i = 0; i < opt2.length; i++) {
                        var opt = opt2[i];
                        var el = document.createElement("option");
                        el.text = opt;
                        el.value = opt;
                        selectr.add(el);
                    }

                    var opt1 = data[0].fixtureList.map(item1 => item1.fixname);
                    console.log("This is your fixture list ", opt1);
                    for (var i = 0; i < opt1.length; i++) {
                        var opt = opt1[i];
                        var el = document.createElement("option");
                        var el1 = document.createElement("option");
                        el.text = opt;
                        el.value = opt;
                        selectf1.add(el);
                        el1.text = opt;
                        el1.value = opt;
                        selectf2.add(el1);
                    }
                    var opt = data[0].teamList.map(item => item?.name);
                    console.log("This is the team list ", opt);
                    for (var i = 0; i < opt.length; i++) {
                        var option = opt[i];
                        var el = document.createElement("option");
                        var el1 = document.createElement("option");
                        var el2 = document.createElement("option");
                        el.text = option;
                        el.value = option;
                        select.add(el);
                        el1.text = option;
                        el1.value = option;
                        select1.add(el1);
                        el2.text = option;
                        el2.value = option;
                        select2.add(el2);
                    }
                }

            })

            // var nayaoption = document.getElementById("fixtureTitle").value;
            // console.log("This is your nayaoption ", nayaoption);
            // if(nayaoption= "International Friendlies"){
            //     var opt = data[0].teamList.map(item => item?.name);
            //     console.log("This is the team list ", opt);
            //     // var el = document.createElement("option");
            //     // el.text = opt;
            //     // el.value = opt;

            //     // select.add(el);
            // }

        });

});




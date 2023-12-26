const playerSelect = document.getElementById('playerSelect');
const fnameInput = document.getElementById('fname');
const lnameInput = document.getElementById('lname');
const positionInput = document.getElementById('position');
const jerseyNoInput = document.getElementById('jersey_no');  // New input field for jersey number
const updateButton = document.getElementById('updateButton');
const deleteButton = document.getElementById('deleteButton');

let players = [];
let tournament_title;
url = "//" + window.location.hostname + ":" + window.location.port;


document.getElementById('titleButton').addEventListener('click', function (e) {
    tournament_title = document.getElementById("selectTournament").value;
});


async function fetchPlayers() {
    const response = await fetch(`${url}/api/players`);
    players = await response.json();
    const selectedPlayerId = playerSelect.value; // Store the selected player
    playerSelect.innerHTML = '';
    for (const player of players) {
        const option = document.createElement('option');
        option.value = player._id;
        option.textContent = `${player.fname} ${player.lname} `;
        playerSelect.appendChild(option);
    }
    // Reselect the previously selected player
    playerSelect.value = selectedPlayerId;
    // Populate the input fields with the initial values of the selected player
    playerSelect.dispatchEvent(new Event('change'));
}

playerSelect.addEventListener('change', function () {
    const selectedPlayer = players.find(player => player._id === this.value);
    if (selectedPlayer) {
        fnameInput.value = selectedPlayer.fname || '';
        lnameInput.value = selectedPlayer.lname || '';
        positionInput.value = selectedPlayer.position || '';
        selectedTournament = selectedPlayer.tournament.find(tournament => tournament.tournament_title === tournament_title);
        jerseyNoInput.value = selectedTournament ? selectedTournament.jersey_no || '' : '';
    }
});


async function updatePlayer() {
    if (!tournament_title) {
        alert('Please select a tournament first.');
        return;
    }
    const selectedPlayer = playerSelect.value;
    const selectedPlayerName = playerSelect.options[playerSelect.selectedIndex].text;
    const confirmation = confirm(`Are you sure you want to update this player '${selectedPlayerName}'?`);
    if (confirmation) {
        const updateData = {};
        if (fnameInput.value) updateData.fname = fnameInput.value;
        if (lnameInput.value) updateData.lname = lnameInput.value;
        if (positionInput.value) updateData.position = positionInput.value;
        if (jerseyNoInput.value) {
            updateData.tournament_title = tournament_title;
            updateData.jersey_no = Number(jerseyNoInput.value);
        }
        // console.log("Update data is ", updateData);
        await fetch(`${url}/api/players/${selectedPlayer}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        fetchPlayers();
    }
}

async function deletePlayer() {
    if (!tournament_title) {
        alert('Please select a tournament first.');
        return;
    }
    const selectedPlayer = playerSelect.value;
    const selectedPlayerName = playerSelect.options[playerSelect.selectedIndex].text;
    const confirmation = confirm(`Are you sure you want to delete this player '${selectedPlayerName}'?`);
    if (confirmation) {
        await fetch(`${url}/api/players/${selectedPlayer}`, { method: 'DELETE' });
        fetchPlayers();
    }
}

fetchPlayers();

updateButton.addEventListener('click', updatePlayer);
deleteButton.addEventListener('click', deletePlayer);
const playerSelect = document.getElementById('playerSelect');
const fnameInput = document.getElementById('fname');
const lnameInput = document.getElementById('lname');
const positionInput = document.getElementById('position');
const jerseyNoInput = document.getElementById('jersey_no');  // New input field for jersey number
const tournamentSelect = document.getElementById('tournamentSelect'); // New dropdown for tournaments
const updateButton = document.getElementById('updateButton');
const deleteButton = document.getElementById('deleteButton');

let players = [];

async function fetchPlayers() {
    const response = await fetch(`http://localhost:3000/api/players`);
    players = await response.json();
    const selectedPlayerId = playerSelect.value; // Store the selected player
    playerSelect.innerHTML = '';
    tournamentSelect.innerHTML = '';
    const tournamentNames = new Set(); // Set to store unique tournament names
    for (const player of players) {
        const option = document.createElement('option');
        option.value = player._id;
        option.textContent = `${player.fname} ${player.lname}`;
        playerSelect.appendChild(option);
        player.tournament.forEach(tournament => {
            if (!tournamentNames.has(tournament.tournament_title)) { // If the tournament name is not in the Set
                tournamentNames.add(tournament.tournament_title); // Add the tournament name to the Set
                const tournamentOption = document.createElement('option');
                tournamentOption.value = tournament._id;
                tournamentOption.text = tournament.tournament_title;
                tournamentSelect.appendChild(tournamentOption);
            }
        });
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
        const selectedTournament = selectedPlayer.tournament.find(tournament => tournament.tournament_title === tournamentSelect.options[tournamentSelect.selectedIndex].text);
        jerseyNoInput.value = selectedTournament ? selectedTournament.jersey_no || '' : '';
    }
});

async function updatePlayer() {
    const selectedPlayer = playerSelect.value;
    const selectedPlayerName = playerSelect.options[playerSelect.selectedIndex].text;
    const selectedTournamentId = tournamentSelect.value; // Get selected tournament id
    const confirmation = confirm(`Are you sure you want to update this player '${selectedPlayerName}'?`);
    if (confirmation) {
        const updateData = {};
        if (fnameInput.value) updateData.fname = fnameInput.value;
        if (lnameInput.value) updateData.lname = lnameInput.value;
        if (positionInput.value) updateData.position = positionInput.value;
        if (jerseyNoInput.value) {
            updateData.tournament_id = selectedTournamentId; // Add tournament_id to updateData
            updateData.jersey_no = jerseyNoInput.value;
        }
        await fetch(`http://localhost:3000/api/players/${selectedPlayer}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        fetchPlayers();
    }
}

async function deletePlayer() {
    const selectedPlayer = playerSelect.value;
    const selectedPlayerName = playerSelect.options[playerSelect.selectedIndex].text;
    const confirmation = confirm(`Are you sure you want to delete this player '${selectedPlayerName}'?`);
    if (confirmation) {
        await fetch(`http://localhost:3000/api/players/${selectedPlayer}`, { method: 'DELETE' });
        fetchPlayers();
    }
}

fetchPlayers();

updateButton.addEventListener('click', updatePlayer);
deleteButton.addEventListener('click', deletePlayer);
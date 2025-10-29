document.addEventListener('DOMContentLoaded', () => {
    const matchesContainer = document.getElementById('matches-container');
    const slipContainer = document.getElementById('slip-container');
    const totalOddsEl = document.getElementById('total-odds');
    const stakeInput = document.getElementById('stake-input');
    const potentialWinningsEl = document.getElementById('potential-winnings');
    const placeBetButton = document.getElementById('place-bet-button');

    // Sample data for football matches
    const matches = [
        { id: 1, team1: 'Bayern Munich', team2: 'Borussia Dortmund', odds: { '1': 1.5, 'X': 4.0, '2': 6.0 } },
        { id: 2, team1: 'Real Madrid', team2: 'FC Barcelona', odds: { '1': 2.2, 'X': 3.5, '2': 3.0 } },
        { id: 3, team1: 'Manchester United', team2: 'Liverpool FC', odds: { '1': 3.8, 'X': 3.9, '2': 1.9 } },
        { id: 4, team1: 'Juventus', team2: 'AC Milan', odds: { '1': 2.5, 'X': 3.2, '2': 2.8 } },
    ];

    let bettingSlip = []; // Array to store selected bets

    // Render matches on page load
    function renderMatches() {
        matchesContainer.innerHTML = '';
        matches.forEach(match => {
            const matchEl = document.createElement('div');
            matchEl.classList.add('match');
            matchEl.innerHTML = `
                <div class="match-info">
                    <span>${match.team1} vs ${match.team2}</span>
                </div>
                <div class="odds">
                    <div class="odd" data-match-id="${match.id}" data-bet-type="1">${match.odds['1'].toFixed(2)}</div>
                    <div class="odd" data-match-id="${match.id}" data-bet-type="X">${match.odds['X'].toFixed(2)}</div>
                    <div class="odd" data-match-id="${match.id}" data-bet-type="2">${match.odds['2'].toFixed(2)}</div>
                </div>
            `;
            matchesContainer.appendChild(matchEl);
        });
    }

    // Render the betting slip
    function renderBettingSlip() {
        slipContainer.innerHTML = '';
        bettingSlip.forEach(bet => {
            const slipItemEl = document.createElement('div');
            slipItemEl.classList.add('slip-item');
            slipItemEl.innerHTML = `
                <p>${bet.team1} vs ${bet.team2}</p>
                <p>Bet: ${bet.betType} @ ${bet.odd.toFixed(2)}</p>
            `;
            slipContainer.appendChild(slipItemEl);
        });
        updateTotals();
    }

    // Update total odds and potential winnings
    function updateTotals() {
        const totalOdds = bettingSlip.reduce((acc, bet) => acc * bet.odd, 1);
        totalOddsEl.textContent = totalOdds.toFixed(2);
        calculatePotentialWinnings();
    }

    // Calculate potential winnings based on stake
    function calculatePotentialWinnings() {
        const totalOdds = parseFloat(totalOddsEl.textContent);
        const stake = parseFloat(stakeInput.value) || 0;
        const potentialWinnings = totalOdds * stake;
        potentialWinningsEl.textContent = potentialWinnings.toFixed(2);
    }

    // Handle clicks on odds
    matchesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('odd')) {
            const matchId = parseInt(e.target.dataset.matchId);
            const betType = e.target.dataset.betType;
            const match = matches.find(m => m.id === matchId);
            const odd = match.odds[betType];

            // Remove any existing bet for the same match
            bettingSlip = bettingSlip.filter(bet => bet.matchId !== matchId);

            // Add the new bet to the slip
            bettingSlip.push({
                matchId: match.id,
                team1: match.team1,
                team2: match.team2,
                betType: betType,
                odd: odd
            });

            renderBettingSlip();
        }
    });

    stakeInput.addEventListener('input', calculatePotentialWinnings);

    // Handle placing a bet
    placeBetButton.addEventListener('click', () => {
        if (bettingSlip.length === 0) {
            alert('Your betting slip is empty!');
            return;
        }
        const stake = parseFloat(stakeInput.value);
        if (isNaN(stake) || stake <= 0) {
            alert('Please enter a valid stake.');
            return;
        }

        alert(`Bet placed successfully!\\n\\nTotal Odds: ${totalOddsEl.textContent}\\nStake: ${stake.toFixed(2)}\\nPotential Winnings: ${potentialWinningsEl.textContent}`);

        // Clear the slip and reset stake
        bettingSlip = [];
        stakeInput.value = '';
        renderBettingSlip();
    });

    // Initial render
    renderMatches();
});

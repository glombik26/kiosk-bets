document.addEventListener('DOMContentLoaded', () => {
    const matchesContainer = document.getElementById('matches-container');
    const slipContainer = document.getElementById('slip-container');
    const totalOddsEl = document.getElementById('total-odds');
    const stakeInput = document.getElementById('stake-input');
    const potentialWinningsEl = document.getElementById('potential-winnings');
    const placeBetButton = document.getElementById('place-bet-button');
    const notificationContainer = document.createElement('div');
    document.body.prepend(notificationContainer);

    // --- API Configuration ---
    // IMPORTANT: Replace 'YOUR_API_KEY' with your actual API key from the-odds-api.com
    const apiKey = 'YOUR_API_KEY';
    const sport = 'soccer_germany_bundesliga'; // Example: German Bundesliga
    const regions = 'eu'; // Europe
    const markets = 'h2h'; // Head-to-head (1X2)
    const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&apiKey=${apiKey}`;

    let bettingSlip = []; // Array to store selected bets
    let allMatches = []; // To store the fetched or sample match data

    // --- Fallback Sample Data ---
    const sampleMatches = [
        { id: 'sample-1', team1: 'Bayern Munich (Sample)', team2: 'Borussia Dortmund (Sample)', odds: { '1': 1.5, 'X': 4.0, '2': 6.0 } },
        { id: 'sample-2', team1: 'Real Madrid (Sample)', team2: 'FC Barcelona (Sample)', odds: { '1': 2.2, 'X': 3.5, '2': 3.0 } },
        { id: 'sample-3', team1: 'Manchester United (Sample)', team2: 'Liverpool FC (Sample)', odds: { '1': 3.8, 'X': 3.9, '2': 1.9 } },
        { id: 'sample-4', team1: 'Juventus (Sample)', team2: 'AC Milan (Sample)', odds: { '1': 2.5, 'X': 3.2, '2': 2.8 } },
    ];

    function showNotification(message, type = 'info') {
        notificationContainer.innerHTML = `<div class="notification ${type}">${message}</div>`;
        notificationContainer.style.cssText = `
            position: sticky; top: 0; left: 0; width: 100%;
            background-color: ${type === 'error' ? '#8B0000' : '#333'};
            color: white; text-align: center; padding: 10px; z-index: 1000;
        `;
    }

    // --- Fetch Data from API ---
    async function fetchMatches() {
        matchesContainer.innerHTML = '<p>Loading live matches...</p>';

        // If no API key is provided, immediately use fallback data
        if (apiKey === 'YOUR_API_KEY' || !apiKey) {
            console.log('API key not provided. Using sample data.');
            showNotification('<b>Info:</b> Live data could not be loaded. Showing sample matches. Please add your API key to <code>script.js</code> to fetch real odds.', 'info');
            allMatches = sampleMatches;
            renderMatches();
            return;
        }

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Network response was not ok');
            }
            const data = await response.json();

            if (data.length === 0) {
                matchesContainer.innerHTML = '<p>No upcoming matches found for this league.</p>';
                return;
            }

            // Map API data to our internal structure
            allMatches = data.map(match => {
                const bookmaker = match.bookmakers[0];
                const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
                const homeOdd = h2hMarket.outcomes.find(o => o.name === match.home_team).price;
                const awayOdd = h2hMarket.outcomes.find(o => o.name === match.away_team).price;
                const drawOdd = h2hMarket.outcomes.find(o => o.name === 'Draw').price;

                return {
                    id: match.id,
                    team1: match.home_team,
                    team2: match.away_team,
                    odds: { '1': homeOdd, 'X': drawOdd, '2': awayOdd }
                };
            });

            renderMatches();
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification(`<b>Error:</b> Could not load live data (${error.message}). Showing sample matches instead.`, 'error');
            allMatches = sampleMatches;
            renderMatches();
        }
    }

    // --- Render Functions ---
    function renderMatches() {
        matchesContainer.innerHTML = '';
        allMatches.forEach(match => {
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

    // --- Calculation Functions ---
    function updateTotals() {
        const totalOdds = bettingSlip.reduce((acc, bet) => acc * bet.odd, 1);
        totalOddsEl.textContent = totalOdds.toFixed(2);
        calculatePotentialWinnings();
    }

    function calculatePotentialWinnings() {
        const totalOdds = parseFloat(totalOddsEl.textContent);
        const stake = parseFloat(stakeInput.value) || 0;
        const potentialWinnings = totalOdds * stake;
        potentialWinningsEl.textContent = potentialWinnings.toFixed(2);
    }

    // --- Event Handlers ---
    matchesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('odd')) {
            const matchId = e.target.dataset.matchId;
            const betType = e.target.dataset.betType;
            const match = allMatches.find(m => m.id === matchId);
            const odd = match.odds[betType];

            bettingSlip = bettingSlip.filter(bet => bet.matchId !== matchId);

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

        bettingSlip = [];
        stakeInput.value = '';
        renderBettingSlip();
    });

    // --- Initial Load ---
    fetchMatches();
});

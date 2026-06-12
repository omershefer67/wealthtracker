const API_KEY = "d8ll1r9r01qnkjl79vv0d8ll1r9r01qnkjl79vvg";
let portfolio = JSON.parse(localStorage.getItem('myPortfolio')) || [];

const assetForm = document.getElementById('asset-form');
const portfolioRows = document.getElementById('portfolio-rows');

// 2. Listen for User Adding Assets
assetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newAsset = {
        id: Date.now(),
        ticker: document.getElementById('ticker').value.toUpperCase(),
        shares: parseFloat(document.getElementById('shares').value),
        buyPrice: parseFloat(document.getElementById('buy-price').value),
        currentPrice: parseFloat(document.getElementById('buy-price').value) // Fallback until API loads
    };

    portfolio.push(newAsset);
    saveAndRender();
    assetForm.reset();
});

// 3. Save to Browser Storage & Refresh UI
function saveAndRender() {
    localStorage.setItem('myPortfolio', JSON.stringify(portfolio));
    renderPortfolio();
}

// 4. Render Data to the HTML Table
function renderPortfolio() {
    portfolioRows.innerHTML = '';
    let overallValue = 0;
    let overallCost = 0;

    portfolio.forEach(asset => {
        const totalCost = asset.shares * asset.buyPrice;
        const totalValue = asset.shares * asset.currentPrice;
        const gainLoss = totalValue - totalCost;
        const gainLossClass = gainLoss >= 0 ? 'profit' : 'loss';

        overallValue += totalValue;
        overallCost += totalCost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>**${asset.ticker}**</td>
            <td>${asset.shares}</td>
            <td>$${asset.buyPrice.toFixed(2)}</td>
            <td>$${asset.currentPrice.toFixed(2)}</td>
            <td>$${totalValue.toFixed(2)}</td>
            <td class="${gainLossClass}">$${gainLoss.toFixed(2)}</td>
            <td><button onclick="deleteAsset(${asset.id})" style="background:#f87171; color:white; padding:2px 8px;">X</button></td>
        `;
        portfolioRows.appendChild(row);
    });

    // Update Top Summary Cards
    document.getElementById('total-value').innerText = `$${overallValue.toFixed(2)}`;
    const netGain = overallValue - overallCost;
    const netClass = netGain >= 0 ? 'profit' : 'loss';
    document.getElementById('total-gain').className = netClass;
    document.getElementById('total-gain').innerText = `$${netGain.toFixed(2)}`;
}

async function updatePrices() {
    for (const asset of portfolio) {
        try {
            const response = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${asset.ticker}&token=${API_KEY}`
            );

            const data = await response.json();

            if (data.c) {
                asset.currentPrice = data.c;
            }
        } catch (error) {
            console.error(error);
        }
    }

    saveAndRender();
}

async function loadNews() {
    const newsContainer = document.getElementById("news-container");

    try {
        const response = await fetch(
            `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
        );

        const news = await response.json();

        newsContainer.innerHTML = news
            .slice(0, 5)
            .map(item => `
                <p>
                    <a href="${item.url}" target="_blank">
                        ${item.headline}
                    </a>
                </p>
            `)
            .join("");
    } catch (error) {
        newsContainer.innerHTML = "Failed to load news.";
    }
}


// 5. Delete Asset Feature
window.deleteAsset = function(id) {
    portfolio = portfolio.filter(asset => asset.id !== id);
    saveAndRender();
}

// Run on page load
renderPortfolio();
updatePrices();
loadNews();
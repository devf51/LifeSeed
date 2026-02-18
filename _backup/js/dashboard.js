document.addEventListener('DOMContentLoaded', () => {
    // Register Chart.js defaults for dark theme
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // --- 1. Monthly Overview Chart (Line/Area) ---
    const ctxOverview = document.getElementById('overviewChart').getContext('2d');

    // Gradient for Income
    const gradientIncome = ctxOverview.createLinearGradient(0, 0, 0, 400);
    gradientIncome.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
    gradientIncome.addColorStop(1, 'rgba(52, 211, 153, 0)');

    // Gradient for Expense
    const gradientExpense = ctxOverview.createLinearGradient(0, 0, 0, 400);
    gradientExpense.addColorStop(0, 'rgba(248, 113, 113, 0.4)');
    gradientExpense.addColorStop(1, 'rgba(248, 113, 113, 0)');

    new Chart(ctxOverview, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Income',
                    data: [12500, 19000, 15000, 22000, 18500, 24000, 21000, 25500, 23000, 28000, 32000, 35000],
                    borderColor: '#34d399',
                    backgroundColor: gradientIncome,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#10b981',
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: [8000, 12000, 9500, 11000, 14000, 13000, 15000, 14500, 16000, 18000, 19000, 22000],
                    borderColor: '#f87171',
                    backgroundColor: gradientExpense,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ef4444',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 8
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f0fdf4',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [4, 4]
                    },
                    ticks: {
                        callback: function (value) {
                            return '$' + value / 1000 + 'k';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });

    // --- 2. Categories Chart (Doughnut) ---
    const ctxCategories = document.getElementById('categoriesChart').getContext('2d');

    new Chart(ctxCategories, {
        type: 'doughnut',
        data: {
            labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Others'],
            datasets: [{
                data: [35, 20, 15, 10, 12, 8],
                backgroundColor: [
                    '#34d399', // Emerald
                    '#60a5fa', // Blue
                    '#f87171', // Red
                    '#fbbf24', // Amber
                    '#a78bfa', // Purple
                    '#94a3b8'  // Slate
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20
                    }
                }
            }
        }
    });
});

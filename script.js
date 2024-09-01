document.addEventListener("DOMContentLoaded", function() {
    const addIncomeBtn = document.getElementById("add-income-btn");
    const addExpenseBtn = document.getElementById("add-expense-btn");
    const transactionDialog = document.getElementById("transaction-dialog");
    const transactionForm = document.getElementById("transaction-form");
    const closeDialogBtn = document.getElementById("close-dialog");
    const boardContainer = document.getElementById("board-container");

    let transactions = [];
    let currentType = "";  // "ingreso" o "gasto"

    function openDialog(type) {
        currentType = type;
        transactionDialog.showModal();
    }

    function addTransaction(event) {
        event.preventDefault();

        const amount = parseFloat(document.getElementById("amount").value);
        const date = new Date(document.getElementById("date").value);
        const concept = document.getElementById("concept").value;
        const category = document.getElementById("category").value;

        // Si es un gasto, ponemos el importe en negativo
        const transaction = { amount: currentType === "expense" ? -amount : amount, date, type: currentType, category, concept };

        // Añadir al array de transacciones
        transactions.push(transaction);

        // Guardar en LocalStorage
        saveTransactionsToLocalStorage();

        // Renderizar el tablero con las transacciones actualizadas
        renderBoard();

        // Ocultar el diálogo y resetearlo
        transactionDialog.close();
        transactionForm.reset();
    }

    function renderBoard() {
        boardContainer.innerHTML = "";
        const groupedTransactions = groupByMonth(transactions);

        // Ordenar los meses en orden cronológico inverso (más reciente a la izquierda)
        const sortedMonths = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

        sortedMonths.forEach(month => {
            const items = groupedTransactions[month];
            const column = document.createElement("div");
            column.classList.add("month-column");

            // Crear el encabezado del mes y el año
            const title = document.createElement("h3");
            title.textContent = month;
            column.appendChild(title);

            // Calcular la suma total de ingresos y gastos
            let totalSum = 0;

            items.forEach(item => {
                totalSum += item.amount;

                const transactionDiv = document.createElement("div");
                transactionDiv.classList.add("transaction-item", item.type);

                // Mostrar concepto e importe
                transactionDiv.innerHTML = `
                    <p class="concept">${item.concept}</p>
                    <p class="amount">€${item.amount.toFixed(2)}</p>
                `;
                column.appendChild(transactionDiv);
            });

            // Añadir la suma total debajo del mes
            const summaryDiv = document.createElement("div");
            summaryDiv.classList.add("summary");
            summaryDiv.innerHTML = `<p>Total: €${totalSum.toFixed(2)}</p>`;
            column.insertBefore(summaryDiv, column.children[1]);

            boardContainer.appendChild(column);
        });
    }

    function groupByMonth(transactions) {
        return transactions.reduce((grouped, transaction) => {
            const month = new Date(transaction.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
            if (!grouped[month]) {
                grouped[month] = [];
            }
            grouped[month].push(transaction);
            return grouped;
        }, {});
    }

    function saveTransactionsToLocalStorage() {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }

    function loadTransactionsFromLocalStorage() {
        const storedTransactions = localStorage.getItem("transactions");
        if (storedTransactions) {
            transactions = JSON.parse(storedTransactions).map(item => ({
                ...item,
                date: new Date(item.date)
            }));
            renderBoard();
        }
    }

    addIncomeBtn.addEventListener("click", () => openDialog("income"));
    addExpenseBtn.addEventListener("click", () => openDialog("expense"));

    transactionForm.addEventListener("submit", addTransaction);
    closeDialogBtn.addEventListener("click", () => transactionDialog.close());

    // Cargar transacciones al abrir la app
    loadTransactionsFromLocalStorage();
});

/**
 * Accounting Utilities
 * 
 * Handles the conversion of simple transactions into double-entry journal entries
 * and generates financial statements.
 */

// Account Types
export const ACCOUNTS = {
    ASSET: 'Asset',
    LIABILITY: 'Liability',
    EQUITY: 'Equity',
    REVENUE: 'Revenue',
    EXPENSE: 'Expense'
};

// Specific Account Names
export const ACCOUNT_NAMES = {
    CASH: 'Cash',
    ACCOUNTS_RECEIVABLE: 'Accounts Receivable',
    ACCOUNTS_PAYABLE: 'Accounts Payable', // For credit card expenses
    REVENUE: 'Sales Revenue',
    EXPENSE: 'General Expense',
    RETAINED_EARNINGS: 'Retained Earnings'
};

/**
 * Generates a journal entry from a simple transaction.
 * @param {Object} transaction - { date, description, amount, type, method }
 * @returns {Object} Journal entry with debits and credits
 */
export const createJournalEntry = (transaction) => {
    const { amount, type, method } = transaction;
    const entry = {
        ...transaction,
        debits: [],
        credits: []
    };

    // Logic based on implementation plan
    if (type === 'expense') {
        // Debit Expense
        entry.debits.push({ account: ACCOUNT_NAMES.EXPENSE, amount });

        if (method === 'card') {
            // Credit Liability (Accounts Payable)
            entry.credits.push({ account: ACCOUNT_NAMES.ACCOUNTS_PAYABLE, amount });
        } else {
            // Credit Asset (Cash)
            entry.credits.push({ account: ACCOUNT_NAMES.CASH, amount });
        }
    } else if (type === 'income') {
        // Credit Revenue
        entry.credits.push({ account: ACCOUNT_NAMES.REVENUE, amount });

        if (method === 'card') {
            // Debit Asset (Accounts Receivable) - Assuming card income is not immediate cash
            // *Self-correction*: For personal finance/simple biz, card income might be treated as Cash if immediate.
            // But strictly, it's AR. Let's stick to AR for "Card" income to show difference.
            entry.debits.push({ account: ACCOUNT_NAMES.ACCOUNTS_RECEIVABLE, amount });
        } else {
            // Debit Asset (Cash)
            entry.debits.push({ account: ACCOUNT_NAMES.CASH, amount });
        }
    }

    return entry;
};

/**
 * Calculates financial statements from a list of transactions.
 * @param {Array} transactions - List of transaction objects
 * @returns {Object} Contains balanceSheet, incomeStatement, cashFlow
 */
export const calculateFinancials = (transactions) => {
    const journalEntries = transactions.map(createJournalEntry);

    // Initialize Balances
    const balances = {
        [ACCOUNT_NAMES.CASH]: 0,
        [ACCOUNT_NAMES.ACCOUNTS_RECEIVABLE]: 0,
        [ACCOUNT_NAMES.ACCOUNTS_PAYABLE]: 0,
        [ACCOUNT_NAMES.REVENUE]: 0,
        [ACCOUNT_NAMES.EXPENSE]: 0,
        [ACCOUNT_NAMES.RETAINED_EARNINGS]: 0
    };

    // Process Entries
    journalEntries.forEach(entry => {
        entry.debits.forEach(dr => {
            if (balances[dr.account] !== undefined) balances[dr.account] += dr.amount;
        });
        entry.credits.forEach(cr => {
            if (balances[cr.account] !== undefined) balances[cr.account] -= cr.amount; // Credits reduce asset/expense balances in this simple view? 
            // WAIT. Standard accounting: 
            // Assets/Expenses: Debit (+), Credit (-)
            // Liab/Equity/Revenue: Credit (+), Debit (-)
            // Let's normalize everything to "Positive is normal balance" for the statement.
        });
    });

    // Re-calculate correctly using standard accounting equation
    // We will track "Net Movement" for each account.
    // Assets: Dr - Cr
    // Liabilities: Cr - Dr
    // Equity/Rev: Cr - Dr
    // Expenses: Dr - Cr

    const accountMovements = {};
    Object.values(ACCOUNT_NAMES).forEach(name => accountMovements[name] = 0);

    journalEntries.forEach(entry => {
        entry.debits.forEach(dr => {
            // Dr is + for Assets, Expenses. - for Liab, Equity, Rev.
            // Let's just sum Dr and Cr separately first.
            if (!accountMovements[dr.account]) accountMovements[dr.account] = 0;
            accountMovements[dr.account] += dr.amount; // Treat Dr as positive number
        });
        entry.credits.forEach(cr => {
            if (!accountMovements[cr.account]) accountMovements[cr.account] = 0;
            accountMovements[cr.account] -= cr.amount; // Treat Cr as negative number
        });
    });

    // Now interpret based on account type
    // Assets (Cash, AR): Balance = Sum (Dr is +, Cr is -) => exactly what we have
    const cash = accountMovements[ACCOUNT_NAMES.CASH] || 0;
    const ar = accountMovements[ACCOUNT_NAMES.ACCOUNTS_RECEIVABLE] || 0;

    // Liabilities (AP): Balance = -Sum (since Cr is -, we want positive liability value)
    const ap = -(accountMovements[ACCOUNT_NAMES.ACCOUNTS_PAYABLE] || 0);

    // Revenue: Balance = -Sum
    const revenue = -(accountMovements[ACCOUNT_NAMES.REVENUE] || 0);

    // Expense: Balance = Sum
    const expenses = accountMovements[ACCOUNT_NAMES.EXPENSE] || 0;

    // Net Income
    const netIncome = revenue - expenses;

    // Equity (Retained Earnings) = Previous RE + Net Income
    // For this simple app, we assume starting 0.
    const equity = netIncome;

    return {
        incomeStatement: {
            revenue,
            expenses,
            netIncome
        },
        balanceSheet: {
            assets: {
                total: cash + ar,
                breakdown: {
                    [ACCOUNT_NAMES.CASH]: cash,
                    [ACCOUNT_NAMES.ACCOUNTS_RECEIVABLE]: ar
                }
            },
            liabilities: {
                total: ap,
                breakdown: {
                    [ACCOUNT_NAMES.ACCOUNTS_PAYABLE]: ap
                }
            },
            equity: {
                total: equity,
                breakdown: {
                    [ACCOUNT_NAMES.RETAINED_EARNINGS]: equity
                }
            }
        },
        cashFlow: {
            // Direct Method (Simplified)
            // Cash In = Dr Cash
            // Cash Out = Cr Cash
            // Actually, let's just look at the Cash account movement.
            operating: cash // Since we start at 0, the ending cash balance IS the net cash flow.
        }
    };
};

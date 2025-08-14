// Helper function to find balance by account name
export const getBalanceByName=(accounts, accountName)=> {
    const account = accounts.find(
        (acc) => acc.account.type.name === accountName
    );
    return account ? account.status.formattedAvailableBalance : "0.00 Rwf";
}
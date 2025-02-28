export const positionABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lendingPool",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_router",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_creator",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "InsufficientCollateral",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientMinimumLeverage",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidToken",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "LeverageTooHigh",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NoChangeDetected",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PositionAtRisk",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "baseCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "effectiveCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowShares",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidationPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "health",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            }
        ],
        "name": "Borrow",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "baseCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "effectiveCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowShares",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidationPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "health",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            }
        ],
        "name": "Repay",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "baseCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "effectiveCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowShares",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidationPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "health",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            }
        ],
        "name": "SupplyCollateral",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "baseCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "effectiveCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowShares",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidationPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "health",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            }
        ],
        "name": "UserPosition",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "baseCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "effectiveCollateral",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "borrowShares",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "leverage",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidationPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "health",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ltv",
                "type": "uint256"
            }
        ],
        "name": "WithdrawCollateral",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "addCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "baseCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "borrow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "borrowShares",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "closePosition",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "convertBorrowAmountToShares",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ],
        "name": "convertBorrowSharesToAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "collateralAmount",
                "type": "uint256"
            }
        ],
        "name": "convertCollateralPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "creator",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "effectiveCollateral",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "health",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastUpdated",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lendingPool",
        "outputs": [
            {
                "internalType": "contract ILendingPool",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "leverage",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "liquidationPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ltv",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "onFlashLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_baseCollateral",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_leverage",
                "type": "uint256"
            }
        ],
        "name": "openPosition",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "router",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "setRiskInfo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newLeverage",
                "type": "uint256"
            }
        ],
        "name": "updateLeverage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
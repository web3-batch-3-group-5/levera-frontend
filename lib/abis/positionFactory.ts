export const positionFactoryABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "positionAddress",
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
                "name": "leverage",
                "type": "uint256"
            }
        ],
        "name": "PositionCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "lendingPool",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            }
        ],
        "name": "PositionDeleted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lendingPool",
                "type": "address"
            },
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
        "name": "createPosition",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lendingPool",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "onBehalf",
                "type": "address"
            }
        ],
        "name": "deletePosition",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "positions",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const positionFactoryABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "lendingPoolAddr",
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
                "name": "positionAddr",
                "type": "address"
            }
        ],
        "name": "CreatePosition",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "lendingPoolAddr",
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
                "name": "positionAddr",
                "type": "address"
            }
        ],
        "name": "DeletePosition",
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
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_lendingPool",
                "type": "address"
            }
        ],
        "name": "getPoolPositions",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
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
        "name": "liquidatePosition",
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
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userPoolPositions",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
  
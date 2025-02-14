export const lendingPoolFactoryABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        inputs: [],
        name: "NotALendingPool",
        type: "error"
    },
    {
        inputs: [],
        name: "PoolAlreadyCreated",
        type: "error"
    },
    {
        inputs: [],
        name: "PoolNotFound",
        type: "error"
    },
    {
        inputs: [],
        name: "Unauthorized",
        type: "error"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "lendingPool",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "loanToken",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "collateralToken",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "loanTokenUsdDataFeed",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "collateralTokenUsdDataFeed",
                type: "address"
            },
            {
                indexed: false,
                internalType: "string",
                name: "loanTokenName",
                type: "string"
            },
            {
                indexed: false,
                internalType: "string",
                name: "collateralTokenName",
                type: "string"
            },
            {
                indexed: false,
                internalType: "string",
                name: "loanTokenSymbol",
                type: "string"
            },
            {
                indexed: false,
                internalType: "string",
                name: "collateralTokenSymbol",
                type: "string"
            },
            {
                indexed: false,
                internalType: "address",
                name: "creator",
                type: "address"
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isActive",
                type: "bool"
            }
        ],
        name: "AllLendingPool",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "lendingPool",
                type: "address"
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "loanToken",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "collateralToken",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "loanTokenUsdDataFeed",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "collateralTokenUsdDataFeed",
                        type: "address"
                    },
                    {
                        internalType: "string",
                        name: "loanTokenName",
                        type: "string"
                    },
                    {
                        internalType: "string",
                        name: "collateralTokenName",
                        type: "string"
                    },
                    {
                        internalType: "string",
                        name: "loanTokenSymbol",
                        type: "string"
                    },
                    {
                        internalType: "string",
                        name: "collateralTokenSymbol",
                        type: "string"
                    },
                    {
                        internalType: "address",
                        name: "creator",
                        type: "address"
                    },
                    {
                        internalType: "bool",
                        name: "isActive",
                        type: "bool"
                    }
                ],
                indexed: false,
                internalType: "struct PoolParams",
                name: "poolParams",
                type: "tuple"
            }
        ],
        name: "CreateLendingPool",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "lendingPool",
                type: "address"
            }
        ],
        name: "DiscardLendingPool",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "lendingPool",
                type: "address"
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "loanToken",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "collateralToken",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "loanTokenUsdDataFeed",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "collateralTokenUsdDataFeed",
                        type: "address"
                    },
                    {
                        internalType: "string",
                        name: "loanTokenName",
                        type: "string"
                    },
                    {
                        internalType: "string",
                        name: "collateralTokenName",
                        type: "string"
                    },
                    {
                        internalType: "string",
                        name: "loanTokenSymbol",
                        type: "string"
                    },
                    {
                        internalType: "string",
                        name: "collateralTokenSymbol",
                        type: "string"
                    },
                    {
                        internalType: "address",
                        name: "creator",
                        type: "address"
                    },
                    {
                        internalType: "bool",
                        name: "isActive",
                        type: "bool"
                    }
                ],
                indexed: false,
                internalType: "struct PoolParams",
                name: "poolParams",
                type: "tuple"
            }
        ],
        name: "StoreLendingPool",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "loanToken",
                type: "address"
            },
            {
                internalType: "address",
                name: "collateralToken",
                type: "address"
            },
            {
                internalType: "address",
                name: "loanTokenUsdDataFeed",
                type: "address"
            },
            {
                internalType: "address",
                name: "collateralTokenUsdDataFeed",
                type: "address"
            }
        ],
        name: "createLendingPool",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        name: "createdLendingPools",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_lendingPool",
                type: "address"
            }
        ],
        name: "discardLendingPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_token",
                type: "address"
            }
        ],
        name: "getTokenName",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_token",
                type: "address"
            }
        ],
        name: "getTokenSymbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        name: "lendingPoolIds",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        name: "lendingPools",
        outputs: [
            {
                internalType: "address",
                name: "loanToken",
                type: "address"
            },
            {
                internalType: "address",
                name: "collateralToken",
                type: "address"
            },
            {
                internalType: "address",
                name: "loanTokenUsdDataFeed",
                type: "address"
            },
            {
                internalType: "address",
                name: "collateralTokenUsdDataFeed",
                type: "address"
            },
            {
                internalType: "string",
                name: "loanTokenName",
                type: "string"
            },
            {
                internalType: "string",
                name: "collateralTokenName",
                type: "string"
            },
            {
                internalType: "string",
                name: "loanTokenSymbol",
                type: "string"
            },
            {
                internalType: "string",
                name: "collateralTokenSymbol",
                type: "string"
            },
            {
                internalType: "address",
                name: "creator",
                type: "address"
            },
            {
                internalType: "bool",
                name: "isActive",
                type: "bool"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_lendingPool",
                type: "address"
            }
        ],
        name: "storeLendingPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_lendingPool",
                type: "address"
            },
            {
                internalType: "bool",
                name: "_status",
                type: "bool"
            }
        ],
        name: "updateLendingPoolStatus",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
] as const;
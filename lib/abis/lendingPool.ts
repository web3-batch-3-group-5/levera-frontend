export const lendingPoolABI = [
    {
        inputs: [
            { internalType: "contract IERC20", name: "_loanToken", type: "address" },
            { internalType: "contract IERC20", name: "_collateralToken", type: "address" },
            { internalType: "contract AggregatorV2V3Interface", name: "_loanTokenUsdPriceFeed", type: "address" },
            { internalType: "contract AggregatorV2V3Interface", name: "_collateralTokenUsdPriceFeed", type: "address" }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    // ... other error types
    {
        inputs: [],
        name: "accrueInterest",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "onBehalf", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "borrowByPosition",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "borrowRate",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "onBehalf", type: "address" }],
        name: "closePosition",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "collateralToken",
        outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "totalSupplyAssets",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "totalSupplyShares",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "totalBorrowAssets",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "totalBorrowShares",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "supply",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
] as const;
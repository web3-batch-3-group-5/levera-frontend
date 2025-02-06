export const mockWBTCABI = [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "allowance", type: "uint256" },
        { internalType: "uint256", name: "needed", type: "uint256" },
      ],
      name: "ERC20InsufficientAllowance",
      type: "error",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "needed", type: "uint256" },
      ],
      name: "ERC20InsufficientBalance",
      type: "error",
    },
    { inputs: [{ internalType: "address", name: "approver", type: "address" }], name: "ERC20InvalidApprover", type: "error" },
    { inputs: [{ internalType: "address", name: "receiver", type: "address" }], name: "ERC20InvalidReceiver", type: "error" },
    { inputs: [{ internalType: "address", name: "sender", type: "address" }], name: "ERC20InvalidSender", type: "error" },
    { inputs: [{ internalType: "address", name: "spender", type: "address" }], name: "ERC20InvalidSpender", type: "error" },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "owner", type: "address" },
        { indexed: true, internalType: "address", name: "spender", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "from", type: "address" },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { inputs: [], name: "decimals", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]

export const mockUSDCABI = [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "allowance", type: "uint256" },
        { internalType: "uint256", name: "needed", type: "uint256" },
      ],
      name: "ERC20InsufficientAllowance",
      type: "error",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "uint256", name: "balance", type: "uint256" },
        { internalType: "uint256", name: "needed", type: "uint256" },
      ],
      name: "ERC20InsufficientBalance",
      type: "error",
    },
    { inputs: [{ internalType: "address", name: "approver", type: "address" }], name: "ERC20InvalidApprover", type: "error" },
    { inputs: [{ internalType: "address", name: "receiver", type: "address" }], name: "ERC20InvalidReceiver", type: "error" },
    { inputs: [{ internalType: "address", name: "sender", type: "address" }], name: "ERC20InvalidSender", type: "error" },
    { inputs: [{ internalType: "address", name: "spender", type: "address" }], name: "ERC20InvalidSpender", type: "error" },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "owner", type: "address" },
        { indexed: true, internalType: "address", name: "spender", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "from", type: "address" },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { inputs: [], name: "decimals", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]
  
  export const lendingPoolABI = [
    { inputs: [
        { internalType: "contract IERC20", name: "_loanToken", type: "address" },
        { internalType: "contract IERC20", name: "_collateralToken", type: "address" },
        { internalType: "contract AggregatorV2V3Interface", name: "_loanTokenUsdPriceFeed", type: "address" },
        { internalType: "contract AggregatorV2V3Interface", name: "_collateralTokenUsdPriceFeed", type: "address" }
      ], stateMutability: "nonpayable", type: "constructor" },
    { inputs: [], name: "TransferReverted", type: "error" },
    { inputs: [], name: "ZeroAddress", type: "error" },
    { anonymous: false, inputs: [
        { indexed: true, internalType: "address", name: "user", type: "address" }
      ], name: "PositionClosed", type: "event" },
    { anonymous: false, inputs: [
        { indexed: true, internalType: "address", name: "user", type: "address" },
        { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
      ], name: "PositionCreated", type: "event" },
    { anonymous: false, inputs: [
        { indexed: true, internalType: "address", name: "user", type: "address" },
        { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
      ], name: "Repaid", type: "event" },
    { inputs: [], name: "accrueInterest", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [
        { internalType: "address", name: "onBehalf", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" }
      ], name: "borrowByPosition", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [
        { internalType: "address", name: "onBehalf", type: "address" }
      ], name: "closePosition", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [], name: "collateralToken", outputs: [
        { internalType: "contract IERC20", name: "", type: "address" }
      ], stateMutability: "view", type: "function" },
    { inputs: [], name: "createPosition", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [], name: "loanToken", outputs: [
        { internalType: "contract IERC20", name: "", type: "address" }
      ], stateMutability: "view", type: "function" },
    { inputs: [
        { internalType: "address", name: "onBehalf", type: "address" },
        { internalType: "uint256", name: "shares", type: "uint256" }
      ], name: "repayByPosition", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [
        { internalType: "uint256", name: "amount", type: "uint256" }
      ], name: "supply", outputs: [], stateMutability: "nonpayable", type: "function" },
    { inputs: [], name: "totalBorrowAssets", outputs: [
        { internalType: "uint256", name: "", type: "uint256" }
      ], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalBorrowShares", outputs: [
        { internalType: "uint256", name: "", type: "uint256" }
      ], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalSupplyAssets", outputs: [
        { internalType: "uint256", name: "", type: "uint256" }
      ], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalSupplyShares", outputs: [
        { internalType: "uint256", name: "", type: "uint256" }
      ], stateMutability: "view", type: "function" },
    { inputs: [
        { internalType: "address", name: "onBehalf", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" }
      ], name: "withdrawCollateralByPosition", outputs: [], stateMutability: "nonpayable", type: "function" }
  ]  
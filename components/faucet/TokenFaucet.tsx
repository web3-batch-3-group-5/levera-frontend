'use client';

import { useState, useEffect } from 'react';
import { Address, parseUnits } from 'viem';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/shared/Button';
import { toast } from 'sonner';
import { ChevronDown, Droplets, Copy, CheckCircle2 } from 'lucide-react';

const tokenFaucetABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Token addresses on Educhain testnet
const TOKEN_LIST = [
  { address: '0x74B59C6C38AEA54644527aA0c5f8f4796e777533' as Address, label: 'laUSDC' },
  { address: '0x5e4695a76Dc81ECc041576d672Da1208d6d8922B' as Address, label: 'laUSDT' },
  { address: '0xe4e0BB3C56e735c72D6696B4F56B7251BB4ab35b' as Address, label: 'laDAI' },
  { address: '0x919c586538EE34B87A12c584ba6463e7e12338E9' as Address, label: 'laWBTC' },
  { address: '0xe7d9E1dB89Ce03570CBA7f4C6Af80EC14a61d1db' as Address, label: 'laWETH' },
];

interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  isLoading: boolean;
}

export function TokenFaucet() {
  // Use client-side only rendering to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { address, isConnected } = useAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('100');
  const [isPending, setIsPending] = useState(false);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState<Address | null>(null);
  
  const { writeContract } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  
  // Observe transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash: txHash });

  // Initialize token data with loading states
  const [tokensData, setTokensData] = useState<TokenInfo[]>(
    TOKEN_LIST.map(token => ({
      address: token.address,
      symbol: token.label,
      name: token.label,
      decimals: 18,
      balance: 0n,
      isLoading: true
    }))
  );
  
  // Effect to fetch token data on component mount
  useEffect(() => {
    if (!isClient || !isConnected) return;
    
    // Fetch data for each token
    const fetchTokenData = async () => {
      const updatedTokens = [...tokensData];
      
      for (let i = 0; i < TOKEN_LIST.length; i++) {
        const token = TOKEN_LIST[i];
        try {
          // Create a fetch request function that works with your environment
          const fetchData = async (functionName: string, args?: any[]) => {
            // Use a basic fetch to your RPC endpoint
            const response = await fetch('https://rpc.open-campus-codex.gelato.digital/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [
                  {
                    to: token.address,
                    data: functionName === 'symbol' ? '0x95d89b41' : 
                           functionName === 'decimals' ? '0x313ce567' :
                           functionName === 'balanceOf' ? `0x70a08231000000000000000000000000${address?.slice(2)}` : 
                           '0x',
                  },
                  'latest'
                ]
              })
            });
            
            const result = await response.json();
            if (result.error) throw new Error(result.error.message);
            
            if (functionName === 'symbol') {
              // Decode symbol (string)
              const hex = result.result.slice(130);
              const symbol = Buffer.from(hex, 'hex').toString().replace(/\0/g, '');
              return symbol || token.label;
            } else if (functionName === 'decimals') {
              // Decode decimals (uint8)
              return parseInt(result.result, 16) || 18;
            } else if (functionName === 'balanceOf') {
              // Decode balance (uint256)
              return BigInt(result.result || '0x0');
            }
            
            return null;
          };
          
          // Fetch token data in parallel
          const [symbol, decimals, balance] = await Promise.all([
            fetchData('symbol'),
            fetchData('decimals'),
            isConnected && address ? fetchData('balanceOf', [address]) : 0n
          ]);
          
          // Update token data
          updatedTokens[i] = {
            ...updatedTokens[i],
            symbol: symbol as string || token.label,
            decimals: decimals as number || 18,
            balance: balance as bigint || 0n,
            isLoading: false
          };
        } catch (error) {
          console.error(`Error fetching data for token ${token.label}:`, error);
          // Keep default values but mark as not loading
          updatedTokens[i] = {
            ...updatedTokens[i],
            isLoading: false
          };
        }
      }
      
      setTokensData(updatedTokens);
    };
    
    fetchTokenData();
  }, [isClient, isConnected, address]);

  // Format token amount with appropriate decimals
  const formatBalance = (token: TokenInfo | null) => {
    if (!token) return '0';
    
    return (Number(token.balance) / 10 ** token.decimals).toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
  };

  // Copy token address to clipboard
  const copyToClipboard = (tokenAddress: Address) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tokenAddress)
        .then(() => {
          setCopiedAddress(tokenAddress);
          toast.success('Token address copied to clipboard');
          
          // Reset copied state after 2 seconds
          setTimeout(() => {
            setCopiedAddress(null);
          }, 5000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast.error('Failed to copy address');
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = tokenAddress;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopiedAddress(tokenAddress);
        toast.success('Token address copied to clipboard');
        
        setTimeout(() => {
          setCopiedAddress(null);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy address');
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Request tokens from the faucet
  const requestTokens = async () => {
    if (!address || !tokensData[selectedTokenIdx]) {
      toast.error('Please connect your wallet and select a token');
      return;
    }

    const selectedToken = tokensData[selectedTokenIdx];

    try {
      setIsPending(true);
      
      // Convert amount to proper decimals
      const mintAmount = parseUnits(amount, selectedToken.decimals);
      
      toast.loading(`Requesting ${selectedToken.symbol}...`, {
        id: `faucet-request`,
      });

      console.log('Minting with params:', {
        address: selectedToken.address,
        args: [address, mintAmount.toString()],
        gas: '15000000'
      });

      writeContract({
        address: selectedToken.address,
        abi: tokenFaucetABI,
        functionName: 'mint',
        args: [address, mintAmount],
        gas: 15000000n,
      }, {
        onSuccess: (hash) => {
          console.log('Mint transaction hash:', hash);
          setTxHash(hash);
          toast.dismiss(`faucet-request`);
          toast.loading('Transaction submitted...', { id: 'tx-pending' });
        },
        onError: (error) => {
          console.error('Mint error:', error);
          toast.dismiss(`faucet-request`);
          toast.error(`Failed to mint tokens: ${error.message}`);
          setIsPending(false);
        },
      });
    } catch (error) {
      console.error('Error in mint process:', error);
      toast.dismiss(`faucet-request`);
      toast.error('Failed to mint tokens');
      setIsPending(false);
    }
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && isPending) {
      toast.dismiss('tx-pending');
      toast.success(`${amount} ${tokensData[selectedTokenIdx]?.symbol || 'tokens'} received successfully!`);
      setIsPending(false);
      setTxHash(undefined);
      
      // Refresh token data
      const refreshTokenData = async () => {
        try {
          const response = await fetch('https://rpc.open-campus-codex.gelato.digital/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_call',
              params: [
                {
                  to: tokensData[selectedTokenIdx].address,
                  data: `0x70a08231000000000000000000000000${address?.slice(2)}`
                },
                'latest'
              ]
            })
          });
          
          const result = await response.json();
          if (result.error) throw new Error(result.error.message);
          
          const newBalance = BigInt(result.result || '0x0');
          
          setTokensData(prev => {
            const updated = [...prev];
            updated[selectedTokenIdx] = {
              ...updated[selectedTokenIdx],
              balance: newBalance
            };
            return updated;
          });
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      };
      
      if (address) {
        refreshTokenData();
      }
    }
  }, [isConfirmed, isPending, amount, selectedTokenIdx, tokensData, address]);

  // Only render the component on the client to avoid hydration mismatches
  if (!isClient) {
    return <div className="bg-card rounded-lg border p-6 shadow-sm h-96 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-muted rounded w-2/3 mb-10"></div>
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded w-full"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
        <div className="h-16 bg-muted rounded w-full"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
      </div>
    </div>;
  }

  const selectedToken = tokensData[selectedTokenIdx];

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Educhain Token Faucet</h2>
      
      <p className="text-muted-foreground mb-6">
        Select a token and amount to mint test tokens for the Levera platform.
      </p>
      
      <div className="space-y-6">
        {/* Token Selection Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Token</label>
          <div className="relative">
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 bg-background border rounded-md"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedToken.symbol}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                {tokensData.map((token, index) => (
                  <button
                    key={token.address}
                    className="w-full px-4 py-2 text-left hover:bg-muted flex justify-between items-center"
                    onClick={() => {
                      setSelectedTokenIdx(index);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span>{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {token.isLoading ? 'Loading...' : `Balance: ${formatBalance(token)}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Token Address with Copy Button */}
        <div className="p-3 bg-muted/30 rounded-lg border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono break-all">
                {selectedToken.address}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => copyToClipboard(selectedToken.address)}
            >
              {copiedAddress === selectedToken.address ? (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-2" />
                  Copy Address
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <div className="flex">
            <input
              type="number"
              className="flex-1 p-3 bg-background border rounded-l-md"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
            <div className="px-3 py-3 bg-muted border-y border-r rounded-r-md">
              {selectedToken.symbol}
            </div>
          </div>
        </div>
        
        {/* Current Balance */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Current Balance:</span>
            <span className="font-medium">
              {selectedToken.isLoading ? 'Loading...' : `${formatBalance(selectedToken)} ${selectedToken.symbol}`}
            </span>
          </div>
        </div>
        
        {/* Request Button */}
        <Button
          onClick={requestTokens}
          disabled={!isConnected || selectedToken.isLoading || isPending || isConfirming || Number(amount) <= 0}
          className="w-full"
          size="lg"
        >
          <Droplets className="size-4 mr-2" />
          {isPending || isConfirming ? 'Requesting...' : `Get ${amount} ${selectedToken.symbol}`}
        </Button>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Note: These tokens are for testing purposes only on the Educhain testnet. 
          To add a token to your wallet, copy the token address and import it as a custom token.
        </p>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectMetamask() {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 en hexadecimal
  const isWrongNetwork = chainId && chainId !== SEPOLIA_CHAIN_ID;

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    // load initial accounts
    eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length) setAccount(accounts[0]);
    }).catch(() => {});
    
    // load initial chain
    eth.request({ method: "eth_chainId" }).then((chain: string) => {
      setChainId(chain);
    }).catch(() => {});

    const handleAccounts = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };
    
    const handleChainChanged = (chain: string) => {
      setChainId(chain);
      // Reload page cuando cambia la red (recomendación de MetaMask)
      window.location.reload();
    };

    eth.on && eth.on("accountsChanged", handleAccounts);
    eth.on && eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener && eth.removeListener("accountsChanged", handleAccounts);
      eth.removeListener && eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      window.open("https://metamask.io/", "_blank");
      return;
    }
    try {
      setConnecting(true);
      if (typeof eth.request === "function") {
        const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
        if (accounts && accounts.length) setAccount(accounts[0]);
        
        // Obtener la red actual
        const chain = await eth.request({ method: "eth_chainId" });
        setChainId(chain);
      } else if (typeof eth.enable === "function") {
        // legacy provider
        const accounts = (await eth.enable()) as string[];
        if (accounts && accounts.length) setAccount(accounts[0]);
      } else {
        throw new Error("Wallet does not support request/enable methods");
      }
    } catch (err: any) {
      // Improved normalization for different provider error shapes
      const parseError = (e: any) => {
        if (!e) return String(e);
        if (typeof e === "string") return e;
        try {
          // Some providers return { code, message } or nested structures
          if (typeof e === "object") {
            if ((e as any).code === 4001) return "MetaMask request was rejected by the user.";
            const nested = e?.data?.message || e?.error?.message || e?.message || e?.reason || e?.stack;
            if (nested) return typeof nested === "string" ? nested : String(nested);
            // Fallback to JSON with safe handling of Error instances
            return JSON.stringify(e, (k, v) => (v instanceof Error ? v.message : v));
          }
        } catch (ex) {
          // ignore
        }
        return Object.prototype.toString.call(e);
      };

      const msg = parseError(err);
      console.error("MetaMask connect error:", err);

      if ((err && (err as any).code === 4001) || String(msg).toLowerCase().includes("user rejected") || String(msg).includes("4001")) {
        toast({ title: "Rechazado", description: "La solicitud de MetaMask fue rechazada", variant: "destructive" });
      } else {
        toast({ title: "❌ Error", description: `Error de conexión: ${msg}`, variant: "destructive" });
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    // There is no standard programmatic "disconnect" for MetaMask.
    // Clearing local app state gives the UX of being disconnected.
    setAccount(null);
    try {
      // best-effort: if provider exposes close or disconnect, call it
      const eth = (window as any).ethereum;
      if (eth && typeof eth.disconnect === "function") {
        eth.disconnect();
      }
    } catch (e) {
      // ignore
    }

    toast({ title: "Desconectado", description: "Para eliminar permisos completamente, desconecta el sitio desde MetaMask" });
  };
  
  const switchToSepolia = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Si Sepolia no está agregada, agregarla
      if (switchError.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"]
            }],
          });
        } catch (addError) {
          console.error("Error adding Sepolia:", addError);
        }
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <>
          {isWrongNetwork ? (
            <Button 
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white hover:bg-red-700"
              onClick={switchToSepolia}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm font-medium">Wrong Network - Switch to Sepolia</span>
            </Button>
          ) : (
            <Button className="flex items-center gap-2 px-3 py-2 bg-foreground text-background" onClick={() => navigator.clipboard?.writeText(account)}>
              <span className="text-sm font-medium">{truncateAddress(account)}</span>
            </Button>
          )}
          <Button className="h-10 w-10 p-2 rounded-md flex items-center justify-center bg-red-600 text-white" aria-label="Disconnect MetaMask" onClick={disconnect}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </>
      ) : (
        <>
          <Button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white" aria-label="Connect MetaMask" onClick={connect} disabled={connecting}>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white/10">
              <svg width="18" height="18" viewBox="0 0 212 212" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g>
                  <path d="M27 33l40 30-20 38-20-68z" fill="#E2761B" />
                  <path d="M185 33l-40 30 20 38 20-68z" fill="#E2761B" />
                  <path d="M27 33l64 24-20 38-44-62z" fill="#F6851B" />
                  <path d="M185 33l-64 24 20 38 44-62z" fill="#F6851B" />
                  <path d="M91 111l-6 30-18-10 24-20z" fill="#C0A16B" />
                  <path d="M121 111l6 30 18-10-24-20z" fill="#C0A16B" />
                  <path d="M40 40l60 30-10 40L40 40z" fill="#763C18" opacity="0.06" />
                </g>
              </svg>
            </span>
            <span className="text-sm font-medium">Connect MetaMask</span>
          </Button>

          {/* small red button present but disabled when not connected */}
          <Button className="h-10 w-10 p-2 rounded-md flex items-center justify-center bg-red-600 text-white opacity-60 cursor-not-allowed" aria-label="Disconnect MetaMask" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </>
      )}
    </div>
  );
}

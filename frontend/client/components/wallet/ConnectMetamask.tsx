import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectMetamask() {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    // load initial accounts
    eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length) setAccount(accounts[0]);
    }).catch(() => {});

    const handleAccounts = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    eth.on && eth.on("accountsChanged", handleAccounts);

    return () => {
      eth.removeListener && eth.removeListener("accountsChanged", handleAccounts);
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
      } else if (typeof eth.enable === "function") {
        // legacy provider
        const accounts = (await eth.enable()) as string[];
        if (accounts && accounts.length) setAccount(accounts[0]);
      } else {
        throw new Error("Wallet does not support request/enable methods");
      }
    } catch (err: any) {
      // Normalize error message
      let msg = "Connection to MetaMask failed.";
      try {
        if (!err) msg = String(err);
        else if (typeof err === "string") msg = err;
        else if (err.message) msg = err.message;
        else msg = JSON.stringify(err);
      } catch (e) {
        msg = "Unknown error connecting to MetaMask.";
      }
      console.error("MetaMask connect error:", err);
      // Show a friendly message to the user
      window.alert(msg.includes("user rejected") || msg.includes("User rejected") || msg.includes("4001")
        ? "MetaMask request was rejected by the user."
        : `MetaMask connection error: ${msg}`
      );
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

    window.alert("Disconnected from app. To fully remove permissions, disconnect the site from your MetaMask account in the wallet UI.");
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <>
          <Button className="flex items-center gap-2 px-3 py-2 bg-foreground text-background" onClick={() => navigator.clipboard?.writeText(account)}>
            <span className="text-sm font-medium">{truncateAddress(account)}</span>
          </Button>
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


import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Contribution = {
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
};

export default function MyContributions() {
  const [account, setAccount] = useState<string | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length) setAccount(accounts[0]);
    });
    eth.on && eth.on("accountsChanged", (accounts: string[]) => {
      setAccount(accounts && accounts.length ? accounts[0] : null);
    });
    return () => {
      eth.removeListener && eth.removeListener("accountsChanged", () => {});
    };
  }, []);

  useEffect(() => {
    if (!account) {
      setContributions([]);
      return;
    }
    // Consulta la API para obtener las contribuciones del usuario
    fetch(`/api/contributions?owner=${account}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setContributions(Array.isArray(data) ? data : []))
      .catch(() => setContributions([]));
  }, [account]);

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-8">Mis aportes</h1>
      {(!account || contributions.length === 0) ? (
        <div className="p-6 rounded-lg border bg-card text-card-foreground">
          <p className="text-sm">{!account ? "Conecta tu wallet para ver tus aportes." : "No tienes aportes registrados."}</p>
        </div>
      ) : (
        <div>
          <div className="rounded-lg border bg-card p-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="font-medium">{c.owner}</div>
                      <div className="text-xs text-muted-foreground">Campaign ID: {c.campaignId}</div>
                    </TableCell>
                    <TableCell>{c.amount.toFixed(3)} ETH</TableCell>
                    <TableCell>{new Date(c.date).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

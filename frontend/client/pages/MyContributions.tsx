
import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getContributionsByOwner, type Contribution } from "@/api/backend";
import { getConnectedAccount, onAccountsChanged } from "@/lib/contract";

export default function MyContributions() {
  const [account, setAccount] = useState<string | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);

  // Conectar cuenta de MetaMask usando funciones utilitarias
  useEffect(() => {
    // Obtener cuenta inicial
    getConnectedAccount().then(setAccount);

    // Escuchar cambios de cuenta
    const cleanup = onAccountsChanged(setAccount);

    return cleanup;
  }, []);

  // Cargar contribuciones cuando cambia la cuenta
  useEffect(() => {
    if (!account) {
      setContributions([]);
      return;
    }

    setLoading(true);
    getContributionsByOwner(account)
      .then(setContributions)
      .catch(err => {
        console.error("Error cargando contribuciones:", err);
        setContributions([]);
      })
      .finally(() => setLoading(false));
  }, [account]);

  // Renderizar estado vacío
  const renderEmptyState = () => {
    const message = !account 
      ? "Conecta tu wallet para ver tus aportes."
      : loading
      ? "Cargando contribuciones..."
      : "No tienes aportes registrados.";

    return (
      <div className="p-6 rounded-lg border bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  };

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-8">Mis aportes</h1>
      
      {!account || loading || contributions.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="rounded-lg border bg-card p-4 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                 <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.map((contribution, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="font-medium">
                      {contribution.campaignTitle || `Campaña #${contribution.campaignId}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {contribution.campaignId}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {contribution.amount.toFixed(4)} ETH
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(contribution.date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Link to={`/campaigns/${contribution.campaignId}`}>
                      <Button className="bg-green-600 text-white">Ver campaña</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
  
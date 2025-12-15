import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { contributeToCampaign, refundContribution } from "@/api/blockchain";
import { getCampaignById, getContributionsByOwner } from "@/api/backend";
import { getConnectedAccount } from "@/lib/contract";
import { Button } from "@/components/ui/button";



export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [userContribution, setUserContribution] = useState<number>(0);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getCampaignById(Number(id))
      .then(setCampaign)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    getConnectedAccount().then(setAccount);
  }, [id]);

  // Consultar la contribución del usuario para esta campaña
  useEffect(() => {
    if (!account || !id) {
      setUserContribution(0);
      return;
    }
    getContributionsByOwner(account)
      .then(contributions => {
        const contrib = contributions.find(c => String(c.campaignId) === String(id));
        setUserContribution(contrib ? contrib.amount : 0);
      })
      .catch(() => setUserContribution(0));
  }, [account, id]);
  // Handler para refund
  const handleRefund = async () => {
    if (!id) return;
    try {
      setRefundLoading(true);
      await refundContribution(Number(id));
      window.alert("Reembolso solicitado correctamente");
    } catch (err) {
      window.alert("Error al solicitar refund: " + (err?.message || err));
    } finally {
      setRefundLoading(false);
    }
  };

  // Handler para contribuir
  const handleContribute = async () => {
    if (!id || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      window.alert("Ingresa un monto válido en ETH");
      return;
    }
    try {
      // Deshabilitar el botón mientras se procesa
      setLoading(true);
      await contributeToCampaign(Number(id), amount);
      window.alert("¡Contribución enviada correctamente!");
    } catch (err) {
      window.alert("Error al contribuir: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container py-12">Loading...</div>;
  if (error) return <div className="container py-12 text-red-600">{error}</div>;
  if (!campaign) return <div className="container py-12">Campaign not found.</div>;
 
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">{campaign.title}</h1>
      <div className="text-sm text-muted-foreground mt-2">
        by {campaign.owner} 
      </div>
      <div className="mt-6 prose max-w-none">
        <p>{campaign.description}</p>
        {campaign.image && (
          <img
            src={campaign.image}
            alt={campaign.title}
            className="max-w-xs max-h-56 rounded-md object-cover border"
            style={{ display: "block", marginTop: 16, marginBottom: 16 }}
          />
        )}
      </div>
      {campaign.createdAt && (
        <div className="mt-4 text-sm text-muted-foreground">
          Created: {new Date(campaign.createdAt).toLocaleString()}
        </div>
      )}
      <div className="mt-8 flex gap-2 items-center">
        <input
          type="number"
          min="0"
          step="any"
          className="rounded-md border border-input px-3 py-2 bg-background"
          placeholder="Amount in ETH"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-foreground text-background px-4 py-2 rounded"
          onClick={handleContribute}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Back this project"}
        </button>
        {/* Botón Refund: siempre visible, desactivado si la campaña está activa o el usuario no ha contribuido */}
        {(() => {
          if (!campaign || !account) return null;
          const isCampaignFailed = Date.now() > campaign.deadline && Number(campaign.funds) < Number(campaign.goal);
          const isCampaignActive = Date.now() <= campaign.deadline;
          const hasContributed = userContribution > 0;
          let disabled = true;
          let buttonText = "Refund";
          let title = undefined;

          if (isCampaignActive) {
            buttonText = "Refund (campaña activa)";
            title = "La campaña sigue activa, no puedes pedir reembolso aún.";
          } else if (!hasContributed) {
            buttonText = "Refund (no has aportado)";
            title = "Debes haber contribuido para solicitar reembolso.";
          } else if (isCampaignFailed) {
            disabled = refundLoading;
            buttonText = refundLoading ? "Solicitando..." : "Refund";
          } else {
            // Campaña expirada pero objetivo cumplido
            buttonText = "Refund (objetivo cumplido)";
            title = "La campaña alcanzó el objetivo, no hay reembolso.";
          }

          return (
            <Button
              className="bg-red-600 text-white ml-2"
              disabled={disabled}
              onClick={handleRefund}
              title={title}
            >
              {buttonText}
            </Button>
          );
        })()}
      </div>
    </div>
  );
}
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { uploadCampaignToIPFS } from "@/api/ipfs";
import { createCampaign } from "@/api/blockchain";
import { useToast } from "@/hooks/use-toast";

export default function Create() {
  const { account, connectWallet, isConnecting } = useWallet();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!account) return "Please connect your wallet";
    if (!imageFile) return "Please upload an image";
    const goalNum = parseFloat(goal);
    if (!goalNum || goalNum <= 0) return "Please set a valid goal amount";
    const daysNum = parseInt(days);
    if (!daysNum || daysNum <= 0) return "Please set a valid duration";
    return null;
  };

  const handleCreateCampaign = async () => {
    // Validar formulario
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // Verificar conexión de wallet
    if (!account) {
      await connectWallet();
      return;
    }

    setError(null);
    setCreating(true);

    try {
      // 1. Subir imagen a IPFS
      toast({ title: "Subiendo imagen", description: "Subiendo imagen a IPFS..." });
      const { uploadImageToIPFS, uploadMetadataToIPFS } = await import("@/api/ipfs");
      const imageIpfsUri = await uploadImageToIPFS(imageFile!);

      // 2. Crear metadata JSON
      const metadata = {
        name: title,
        description: description,
        image: imageIpfsUri
      };

      // 3. Subir metadata a IPFS
      toast({ title: "Subiendo metadata", description: "Subiendo metadata a IPFS..." });
      const metadataUri = await uploadMetadataToIPFS(metadata);

      // 4. Crear campaña en blockchain (MetaMask valida la red automáticamente)
      toast({ title: "Creando campaña", description: "Confirma la transacción en MetaMask" });
      const tx = await createCampaign({
        title,
        description,
        goal,
        days,
        metadataUri
      });

      toast({ title: "Transacción enviada", description: "Esperando confirmación..." });
      await tx.wait();

      toast({ title: "✅ Éxito", description: "Campaña creada correctamente" });

      // Limpiar formulario
      setTitle("");
      setDescription("");
      setGoal("");
      setDays("");
      setImageFile(null);

    } catch (err: any) {
      console.error("Error creating campaign:", err);
      const errorMessage = err?.message || err?.toString() || "Unknown error";
      toast({ title: "❌ Error", description: errorMessage, variant: "destructive" });
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Start a Campaign</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose">
          Create a compelling campaign to share with backers. Fill in the details below.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short, memorable title" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Creator Address</label>
            <Input 
              value={account || ""} 
              readOnly 
              disabled 
              className="bg-muted/10" 
              placeholder="Connect your wallet to autofill" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Campaign Image</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageFile(file);
                  }}
                  className="cursor-pointer"
                />
                {imageFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              {imageFile && (
                <div className="w-32 h-32 rounded-lg border overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Goal Amount (ETH)</label>
              <Input 
                type="number" 
                step="0.01" 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
                placeholder="e.g. 1.5" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration (days)</label>
              <Input 
                type="number" 
                value={days} 
                onChange={(e) => setDays(e.target.value)} 
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              rows={6} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 bg-background text-sm" 
              placeholder="Describe your campaign story and what you plan to do with the funds..." 
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center gap-3">
            {!account ? (
              <Button 
                className="bg-foreground text-background" 
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button 
                className="bg-foreground text-background" 
                onClick={handleCreateCampaign}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Campaign"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground max-w-prose">
        This page is a placeholder. Tell Fusion what you want here and we’ll build it out.
      </p>
    </div>
  );
}

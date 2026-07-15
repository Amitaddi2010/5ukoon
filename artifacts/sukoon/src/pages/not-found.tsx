export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-serif mb-4 text-primary">404</h1>
      <p className="text-muted-foreground mb-8">The path you seek cannot be found.</p>
      <a href="/" className="text-primary hover:text-primary/80 transition-colors">Return to Sukoon</a>
    </div>
  );
}

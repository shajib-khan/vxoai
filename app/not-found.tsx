"use client"


export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      
      {/* Background Accent */}
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none 
                      [background:radial-gradient(circle_at_center,theme(colors.primary/30),transparent_70%)]" />

      <h1 className="text-7xl font-bold tracking-tight mb-4">
        404
      </h1>

      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      {/* <Link href="/signin" className="inline-flex">
        <Button className="gap-2">
          <ArrowLeft size={18} />
          Go back to Sign In
        </Button>
      </Link> */}
    </main>
  )
}

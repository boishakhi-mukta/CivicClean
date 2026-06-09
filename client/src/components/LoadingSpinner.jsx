const LoadingSpinner = () => (
  <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-bg transition-colors">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-primary animate-spin" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span className="text-xl">🌿</span>
      </div>
    </div>
    <p className="mt-6 text-muted font-semibold tracking-wide animate-pulse">Loading CivicClean...</p>
  </div>
);

export default LoadingSpinner;

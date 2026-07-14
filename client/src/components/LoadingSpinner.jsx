// ─────────────────────────────────────────────────────────────────────────────
// LoadingSpinner.jsx — Full-page loading screen shown while data is being fetched.
//
// This appears whenever the app is doing something important that requires
// the whole page to wait — for example, checking whether the user is logged in
// when the site first loads.
//
// It shows a spinning ring with the CivicClean 🌿 leaf in the centre and a
// pulsing "Loading CivicClean..." text below it.
// ─────────────────────────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-bg transition-colors">
    <div className="relative">
      {/* Spinning ring — the gap at the top creates the spinning illusion */}
      <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-primary animate-spin" />
      {/* Leaf emoji centred inside the ring */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span className="text-xl">🌿</span>
      </div>
    </div>
    {/* Pulsing text below the spinner */}
    <p className="mt-6 text-muted font-semibold tracking-wide animate-pulse">Loading CivicClean...</p>
  </div>
);

export default LoadingSpinner;

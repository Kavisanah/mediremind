function LoadingSpinner({ message = 'Loading…', fullPage = true }) {
  const inner = (
    <div className="flex flex-col items-center gap-4">
      {/* Animated logo pill */}
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700
                        flex items-center justify-center text-2xl shadow-md animate-float">
          💊
        </div>
        {/* Orbit ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary-300/40 animate-spin"
             style={{ animationDuration: '2s' }} />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-300">{message}</p>
        <div className="flex gap-1 justify-center mt-2">
          {[0,1,2].map(i => (
            <span key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (!fullPage) return inner

  return (
    <div className="min-h-screen bg-mesh-primary flex items-center justify-center">
      {inner}
    </div>
  )
}

export default LoadingSpinner





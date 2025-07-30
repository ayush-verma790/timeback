import { Loader2 } from "lucide-react"

export const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[101]">
    <Loader2 className="w-16 h-16 text-white animate-spin" />
  </div>
)

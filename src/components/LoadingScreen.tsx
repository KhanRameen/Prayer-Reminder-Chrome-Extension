export const LoadingScreen = () => {
    return (
        <div className="flex flex-col h-full items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-white/90" />
            <span className="text-sm text-gray-600">
                Loading your prayer times…
            </span>
        </div>
    );
}
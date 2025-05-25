export function EditFormActionsSkeleton() {
  return (
    <div className="flex items-center space-x-3">
      <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
      <div className="h-9 w-32 bg-blue-600 rounded-md animate-pulse"></div>
      <div className="h-9 w-20 bg-red-600 rounded-md animate-pulse"></div>
    </div>
  );
}

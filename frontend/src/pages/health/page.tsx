export default function HealthCheck() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Health Check</h1>
        <p className="text-green-600">Status: Healthy</p>
        <p className="text-gray-600 mt-2">{new Date().toISOString()}</p>
      </div>
    </div>
  );
} 
import { Shield, Users } from 'lucide-react';

export default function NoOrganisationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 dark:bg-[#1A1A1A] p-4">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-2">No Organization Access</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You are not currently a member of any organization. Please contact an administrator to add you to an organization.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Need Help?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Reach out to your system administrator or instance administrator to request access to an organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ManageServicesTab = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Services</CardTitle>
          <CardDescription>
            Create new services or edit existing ones. This section is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-500">
              Services Management Coming Soon
            </p>
            <p className="text-sm text-gray-400">
              Functionality to add, edit, and manage service offerings will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageServicesTab;
  
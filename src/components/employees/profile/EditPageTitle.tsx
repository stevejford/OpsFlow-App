"use client";

interface EditPageTitleProps {
  firstName: string;
  lastName: string;
}

export default function EditPageTitle({ firstName, lastName }: EditPageTitleProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  return (
    <div className="flex items-center mb-6">
      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
        {initials}
      </div>
      <div className="ml-4">
        <h1 className="text-2xl font-bold text-gray-900">Edit Employee Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update {firstName} {lastName}'s information below.
        </p>
      </div>
    </div>
  );
}

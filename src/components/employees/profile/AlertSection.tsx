import React from 'react';

interface Alert {
  type: string;
  title: string;
  message: string;
  icon: string;
}

interface AlertSectionProps {
  alerts: Alert[];
}

export default function AlertSection({ alerts }: AlertSectionProps) {
  return (
    <div className="space-y-3 mb-8">
      {alerts.map((alert, index) => (
        <div 
          key={index} 
          className={`bg-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'orange' : 'green'}-50 border-l-4 border-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'orange' : 'green'}-400 p-4 rounded-lg`}
        >
          <div className="flex">
            <i 
              data-feather={alert.icon} 
              className={`h-5 w-5 text-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'orange' : 'green'}-400 mr-3 mt-0.5`}
            ></i>
            <div>
              <h3 className={`text-sm font-medium text-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'orange' : 'green'}-800`}>
                {alert.title}
              </h3>
              <p className={`text-sm text-${alert.type === 'danger' ? 'red' : alert.type === 'warning' ? 'orange' : 'green'}-700 mt-1`}>
                {alert.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

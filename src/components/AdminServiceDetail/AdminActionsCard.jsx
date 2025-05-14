
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { XCircle, RefreshCcw, Briefcase, UserPlus, X } from 'lucide-react';

const serviceStatuses = ['Pending', 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'];

const AdminActionsCard = ({
    booking,
    assignedEmployees,
    availableEmployees,
    onAssignEmployee,
    onRemoveEmployee,
    onUpdateStatus,
    onCancel,
    onRefund,
    loading,
    isActionDisabled
}) => {
   const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState('');
   const [selectedStatus, setSelectedStatus] = useState(booking.serviceStatus || 'Pending');

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    onUpdateStatus(newStatus);
  };

   const handleAddEmployee = () => {
    if (selectedEmployeeToAdd) {
        onAssignEmployee(selectedEmployeeToAdd);
        setSelectedEmployeeToAdd(''); // Reset dropdown
    }
  };


  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Admin Actions</h3>

      {/* Assigned Employees */}
      <div className="space-y-2">
        <Label htmlFor="assigned-employees">Assigned Employees ({assignedEmployees.length})</Label>
        <div className="flex flex-wrap gap-2">
            {assignedEmployees.length > 0 ? assignedEmployees.map(emp => (
                <Badge key={emp.id} variant="secondary" className="py-1 pl-2 pr-1 text-sm">
                    {emp.name || emp.email.split('@')[0]}
                    <Button
                        variant="ghost" size="icon"
                        className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveEmployee(emp.id)}
                        disabled={isActionDisabled || loading}
                        aria-label={`Remove ${emp.name}`}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            )) : <p className="text-sm text-gray-500">No employees assigned.</p>}
        </div>
      </div>

      {/* Assign Employee Dropdown */}
        {!isActionDisabled && (
             <div className="space-y-2">
                <Label htmlFor="assign-employee">Assign Employee</Label>
                <div className="flex gap-2">
                    <Select inputId="assign-employee" value={selectedEmployeeToAdd} onValueChange={setSelectedEmployeeToAdd} disabled={availableEmployees.length === 0}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select employee to add..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availableEmployees.length > 0 ? availableEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                                {emp.name || emp.email} ({emp.position})
                            </SelectItem>
                        )) : <SelectItem value="" disabled>No available employees</SelectItem>}
                    </SelectContent>
                    </Select>
                    <Button onClick={handleAddEmployee} disabled={!selectedEmployeeToAdd || loading} size="sm"><UserPlus className="h-4 w-4 mr-1"/> Add</Button>
                </div>
            </div>
        )}


      {/* Update Status */}
      <div className="space-y-2">
        <Label htmlFor="update-status">Update Service Status</Label>
        <Select inputId="update-status" value={selectedStatus} onValueChange={handleStatusChange} disabled={isActionDisabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            {serviceStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cancel / Refund Buttons */}
      <div className="pt-4 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefund}
          disabled={isActionDisabled || booking.status === 'refunded'}
          className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <RefreshCcw className="h-4 w-4 mr-2" /> Issue Refund {booking.paidWithCredits > 0 ? '(+ Credits)' : ''}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          disabled={isActionDisabled || booking.status === 'cancelled'}
          className="w-full"
        >
          <XCircle className="h-4 w-4 mr-2" /> Cancel Service
        </Button>
      </div>
    </div>
  );
};

export default AdminActionsCard;
  
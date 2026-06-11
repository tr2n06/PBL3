"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  blockEmployee,
  unblockEmployee,
  type CreateEmployeeRequest,
  type EmployeeItem,
} from "@/lib/employees-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  UserX,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";

const EMPTY_EMPLOYEE_FORM: CreateEmployeeRequest = {
  name: "",
  gender: "Male",
  dateOfBirth: "",
  address: "",
  phoneNumber: "",
  email: "",
  password: "",
};

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateEmployeeRequest>(EMPTY_EMPLOYEE_FORM);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.filter((u) => u.role === "employee"));
    } catch (error) {
      console.error("Load employees failed:", error);
    } finally {
      setLoading(false);
    }
  };

  loadEmployees();
}, []);

  const handleCreateEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingEmployee(true);

    try {
      await createEmployee({
        ...createForm,
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phoneNumber: createForm.phoneNumber.trim(),
        address: createForm.address?.trim(),
        dateOfBirth: createForm.dateOfBirth || undefined,
      });
      const data = await getEmployees();
      setEmployees(data.filter((u) => u.role === "employee"));
      setCreateForm(EMPTY_EMPLOYEE_FORM);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Create employee failed:", error);
      alert(error instanceof Error ? error.message : "Create employee failed");
    } finally {
      setCreatingEmployee(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );
const handleBlockEmployee = async () => {
  if (!selectedEmployee) return;

  try {
    if (selectedEmployee.status === "active") {
      await blockEmployee(selectedEmployee.id);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, status: "blocked" } : emp
        )
      );
    } else {
      await unblockEmployee(selectedEmployee.id);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, status: "active" } : emp
        )
      );
    }

    setShowBlockDialog(false);
    setSelectedEmployee(null);
  } catch (error) {
    console.error("Update employee status failed:", error);
    alert(error instanceof Error ? error.message : "Action failed");
  }
};
if (loading) {
  return <div className="p-6">Loading employees...</div>;
}
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Employee Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all employee accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.status === "blocked").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
  {employees.filter((e) => e.status === "pending").length}
</div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                Manage employee accounts and permissions
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                className="gap-2"
                onClick={() => setShowCreateDialog(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </Button>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.status === "active" ? "default" : "destructive"
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDetailsDialog(true);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowBlockDialog(true);
                          }}
                        >
                          {employee.status === "active"
                            ? "Block Account"
                            : "Unblock Account"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>
              Create a new staff account for the booking system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employee-name">Full name</Label>
                <Input
                  id="employee-name"
                  required
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={createForm.gender || "Male"}
                  onValueChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-dob">Date of birth</Label>
                <Input
                  id="employee-dob"
                  type="date"
                  value={createForm.dateOfBirth || ""}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-phone">Phone</Label>
                <Input
                  id="employee-phone"
                  required
                  inputMode="numeric"
                  value={createForm.phoneNumber}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-email">Email</Label>
                <Input
                  id="employee-email"
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employee-address">Address</Label>
                <Input
                  id="employee-address"
                  value={createForm.address || ""}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employee-password">Password</Label>
                <Input
                  id="employee-password"
                  required
                  type="password"
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creatingEmployee}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingEmployee}>
                {creatingEmployee ? "Creating..." : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee?.status === "active"
                ? "Block Employee Account"
                : "Unblock Employee Account"}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee?.status === "active"
                ? `Are you sure you want to block ${selectedEmployee?.name}'s account? They will no longer be able to access the system.`
                : `Are you sure you want to unblock ${selectedEmployee?.name}'s account? They will regain access to the system.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={
                selectedEmployee?.status === "active"
                  ? "destructive"
                  : "default"
              }
              onClick={handleBlockEmployee}
            >
              {selectedEmployee?.status === "active"
                ? "Block Account"
                : "Unblock Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {selectedEmployee.name}
                  </h3>
                  <Badge
                    variant={
                      selectedEmployee.status === "active"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {selectedEmployee.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2 text-sm">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Họ và tên</p>
                    <p className="font-medium">
                      {selectedEmployee.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Giới tính</p>
                    <p className="font-medium">
                      {selectedEmployee.gender || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Ngày sinh</p>
                    <p className="font-medium">
                      {selectedEmployee.dateOfBirth
                        ? new Date(
                            selectedEmployee.dateOfBirth,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm sm:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">
                      {selectedEmployee.address || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Mã số CCCD</p>
                    <p className="font-medium">
                      {selectedEmployee.nationalId || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {selectedEmployee.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">
                      {selectedEmployee.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Ngày tham gia</p>
                    <p className="font-medium">
                      {new Date(
                        selectedEmployee.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

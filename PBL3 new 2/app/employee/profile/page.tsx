"use client";

import { useState, useEffect } from "react";
import {
  getEmployeeProfile,
  getMyPendingProfileUpdate,
  submitProfileUpdateRequest,
  changeEmployeePassword,
} from "@/lib/employee-profile-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Clock,
  AlertTriangle,
  Check,
  MapPin,
  UserRound,
  Lock,
} from "lucide-react";


export default function EmployeeProfilePage() {
  



  const [profileData, setProfileData] = useState({
  fullName: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  nationalId: "",
  email: "",
  phone: "",
  status: "",
  createdAt: "",
});

const [isEditing, setIsEditing] = useState(false);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const [pendingRequest, setPendingRequest] = useState<null | {
  requestId: string | number;
  status: "pending" | "approved" | "rejected";
  address?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}>(null);

const [formData, setFormData] = useState({
  fullName: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  email: "",
  phone: "",
});

const [passwordForm, setPasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
useEffect(() => {
  const loadData = async () => {
    try {
      const [profile, pending] = await Promise.all([
        getEmployeeProfile(),
        getMyPendingProfileUpdate(),
      ]);

      setProfileData({
        fullName: profile.fullName || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        address: profile.address || "",
        nationalId: profile.nationalId || "",
        email: profile.email || "",
        phone: profile.phone || "",
        status: profile.status || "",
        createdAt: profile.createdAt || "",
      });

      setFormData({
        fullName: profile.fullName || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        address: profile.address || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });

      setPendingRequest(pending);
    } catch (error) {
      console.error("Load employee profile failed:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
 const handleSave = () => {
  setShowConfirmDialog(true);
};

const handleConfirmSave = async () => {
  try {
    setSaving(true);
    setShowConfirmDialog(false);

    await submitProfileUpdateRequest({
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
    });

    const pending = await getMyPendingProfileUpdate();
    setPendingRequest(pending);
    setIsEditing(false);
  } catch (error) {
    console.error("Submit profile update request failed:", error);
    alert(error instanceof Error ? error.message : "Không gửi được yêu cầu cập nhật");
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
  setFormData({
    fullName: profileData.fullName,
    gender: profileData.gender,
    dateOfBirth: profileData.dateOfBirth,
    address: profileData.address,
    email: profileData.email,
    phone: profileData.phone,
  });

  setPasswordForm({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  setIsEditing(false);
};
  const handleChangePassword = async () => {
  try {
    setSaving(true);

    await changeEmployeePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      newPasswordConfirm: passwordForm.confirmPassword,
    });

    alert("Đổi mật khẩu thành công");

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error("Change password failed:", error);
    alert(error instanceof Error ? error.message : "Đổi mật khẩu thất bại");
  } finally {
    setSaving(false);
  }
};

  const noChangesDetected =
    formData.address === profileData.address &&
    formData.email === profileData.email &&
    formData.phone === profileData.phone &&
!passwordForm.newPassword;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View and edit your profile information
        </p>
      </div>

      {pendingRequest?.status === "pending" && (
  <Card className="border-yellow-500/50 bg-yellow-500/10">
    <CardContent className="flex items-start gap-4 pt-6">
      <Clock className="h-6 w-6 text-yellow-600" />
      <div>
        <h3 className="font-medium">Đang đợi xác nhận từ quản lý</h3>
        <p className="text-sm text-muted-foreground">
          Yêu cầu cập nhật thông tin cá nhân của bạn đã được gửi và đang chờ quản lý phê duyệt.
        </p>

        <div className="mt-2 text-sm">
          {pendingRequest.email && pendingRequest.email !== profileData.email && (
            <Badge variant="secondary" className="mr-1">
              Email: {pendingRequest.email}
            </Badge>
          )}

          {pendingRequest.phone && pendingRequest.phone !== profileData.phone && (
            <Badge variant="secondary" className="mr-1">
              Phone: {pendingRequest.phone}
            </Badge>
          )}

          {pendingRequest.address && pendingRequest.address !== profileData.address && (
            <Badge variant="secondary" className="mr-1">
              Address updated
            </Badge>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {profileData.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{profileData.fullName}</CardTitle>
            <CardDescription>
              <Badge variant="secondary">Employee</Badge>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profileData.email}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profileData.phone}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profileData.address}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span>{profileData.gender}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Status: </span>
              <Badge className="bg-accent text-accent-foreground">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  You can only change address, email, phone number, and password
                </CardDescription>
              </div>
<Input
  id="currentPassword"
  type="password"
  value={passwordForm.currentPassword}
  onChange={(e) =>
    setPasswordForm({
      ...passwordForm,
      currentPassword: e.target.value,
    })
  }
  disabled={!isEditing}
/>
             {!isEditing && pendingRequest?.status !== "pending" &&  (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={formData.gender}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Change Password</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
  id="currentPassword"
  type="password"
  value={passwordForm.currentPassword}
  onChange={(e) =>
    setPasswordForm({
      ...passwordForm,
      currentPassword: e.target.value,
    })
  }
  disabled={!isEditing}
/>
                  </div>
                  <div className="mt-4">
  <Button
    type="button"
    onClick={handleChangePassword}
    disabled={
      saving ||
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    }
  >
    Đổi mật khẩu
  </Button>
</div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                   <Input
  id="newPassword"
  type="password"
  value={passwordForm.newPassword}
  onChange={(e) =>
    setPasswordForm({
      ...passwordForm,
      newPassword: e.target.value,
    })
  }
  disabled={!isEditing}
/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
  id="confirmPassword"
  type="password"
  value={passwordForm.confirmPassword}
  onChange={(e) =>
    setPasswordForm({
      ...passwordForm,
      confirmPassword: e.target.value,
    })
  }
  disabled={!isEditing}
/>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSave}>
                    Submit for Approval
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted bg-muted/30">
        <CardContent className="flex items-start gap-4 pt-6">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          <div>
            <h3 className="font-medium">Why do profile edits need approval?</h3>
            <p className="text-sm text-muted-foreground">
              Full name, gender, and date of birth are read-only. You can only
              request changes for address, email, phone number, and password.
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Profile Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes will be sent to a manager for review. You will be
              notified once they are approved or rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-lg bg-secondary/50 p-4">
            <h4 className="mb-2 font-medium">Changes to submit:</h4>
            <ul className="space-y-1 text-sm">
              {formData.address !== profileData.address && (
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-accent" />
                  Address: {profileData.address} → {formData.address}
                </li>
              )}

              {formData.email !== profileData.email && (
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-accent" />
                  Email: {profileData.email} → {formData.email}
                </li>
              )}

              {formData.phone !== profileData.phone && (
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-accent" />
                  Phone: {profileData.phone} → {formData.phone}
                </li>
              )}

              {passwordForm.newPassword && (
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-accent" />
                  Password will be changed
                </li>
              )}

              {noChangesDetected && (
                <li className="text-muted-foreground">No changes detected</li>
              )}
            </ul>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Submit for Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

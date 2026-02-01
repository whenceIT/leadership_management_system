"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

interface Role {
  id: number;
  name: string;
  slug: string;
  permissions: string | null;
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface ApiResponse {
  success: boolean;
  data?: Role;
  message?: string;
}

// Define available permissions based on the system
const availablePermissions: Permission[] = [
  { id: 1, name: "Users Management", slug: "users.manage", description: "Full access to user management" },
  { id: 2, name: "Users View", slug: "users.view", description: "View user information" },
  { id: 3, name: "Users Create", slug: "users.create", description: "Create new users" },
  { id: 4, name: "Users Edit", slug: "users.edit", description: "Edit user information" },
  { id: 5, name: "Users Delete", slug: "users.delete", description: "Delete users" },
  { id: 6, name: "Roles Management", slug: "roles.manage", description: "Full access to role management" },
  { id: 7, name: "Roles View", slug: "roles.view", description: "View roles" },
  { id: 8, name: "Roles Create", slug: "roles.create", description: "Create new roles" },
  { id: 9, name: "Roles Edit", slug: "roles.edit", description: "Edit roles" },
  { id: 10, name: "Roles Delete", slug: "roles.delete", description: "Delete roles" },
  { id: 11, name: "Loans Management", slug: "loans.manage", description: "Full access to loan management" },
  { id: 12, name: "Loans View", slug: "loans.view", description: "View loan information" },
  { id: 13, name: "Loans Create", slug: "loans.create", description: "Create new loans" },
  { id: 14, name: "Loans Edit", slug: "loans.edit", description: "Edit loan information" },
  { id: 15, name: "Loans Delete", slug: "loans.delete", description: "Delete loans" },
  { id: 16, name: "Loans Approve", slug: "loans.approve", description: "Approve loan applications" },
  { id: 17, name: "Savings Management", slug: "savings.manage", description: "Full access to savings management" },
  { id: 18, name: "Savings View", slug: "savings.view", description: "View savings information" },
  { id: 19, name: "Savings Create", slug: "savings.create", description: "Create new savings accounts" },
  { id: 20, name: "Savings Edit", slug: "savings.edit", description: "Edit savings information" },
  { id: 21, name: "Savings Delete", slug: "savings.delete", description: "Delete savings accounts" },
  { id: 22, name: "Reports Management", slug: "reports.manage", description: "Full access to reports" },
  { id: 23, name: "Reports View", slug: "reports.view", description: "View reports" },
  { id: 24, name: "Reports Export", slug: "reports.export", description: "Export reports" },
  { id: 25, name: "Settings Management", slug: "settings.manage", description: "Full access to system settings" },
  { id: 26, name: "Settings View", slug: "settings.view", description: "View system settings" },
  { id: 27, name: "Settings Edit", slug: "settings.edit", description: "Edit system settings" },
  { id: 28, name: "Audit Trail", slug: "audit.view", description: "View audit trail" },
  { id: 29, name: "Clients Management", slug: "clients.manage", description: "Full access to client management" },
  { id: 30, name: "Clients View", slug: "clients.view", description: "View client information" },
  { id: 31, name: "Clients Create", slug: "clients.create", description: "Create new clients" },
  { id: 32, name: "Clients Edit", slug: "clients.edit", description: "Edit client information" },
  { id: 33, name: "Clients Delete", slug: "clients.delete", description: "Delete clients" },
  { id: 34, name: "Payroll Management", slug: "payroll.manage", description: "Full access to payroll" },
  { id: 35, name: "Payroll View", slug: "payroll.view", description: "View payroll information" },
  { id: 36, name: "Payroll Process", slug: "payroll.process", description: "Process payroll" },
  { id: 37, name: "Assets Management", slug: "assets.manage", description: "Full access to assets" },
  { id: 38, name: "Assets View", slug: "assets.view", description: "View assets" },
  { id: 39, name: "Assets Create", slug: "assets.create", description: "Create new assets" },
  { id: 40, name: "Assets Edit", slug: "assets.edit", description: "Edit assets" },
  { id: 41, name: "Assets Delete", slug: "assets.delete", description: "Delete assets" },
  { id: 42, name: "Leave Management", slug: "leave.manage", description: "Full access to leave management" },
  { id: 43, name: "Leave View", slug: "leave.view", description: "View leave requests" },
  { id: 44, name: "Leave Approve", slug: "leave.approve", description: "Approve leave requests" },
  { id: 45, name: "Advances Management", slug: "advances.manage", description: "Full access to advances" },
  { id: 46, name: "Advances View", slug: "advances.view", description: "View advances" },
  { id: 47, name: "Advances Approve", slug: "advances.approve", description: "Approve advances" },
  { id: 48, name: "Communication", slug: "communication.send", description: "Send communications" },
  { id: 49, name: "Policies Management", slug: "policies.manage", description: "Full access to policies" },
  { id: 50, name: "Policies View", slug: "policies.view", description: "View policies" },
];

export default function RolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:3001/api/roles/${roleId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: ApiResponse = await response.json();

        if (data.success && data.data) {
          setRole(data.data);
          const permissions = data.data.permissions ? JSON.parse(data.data.permissions) : [];
          setSelectedPermissions(permissions);
        } else {
          setError(data.message || "Failed to fetch role");
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setError("Failed to connect to server. Please check if API is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionSlug: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionSlug)
        ? prev.filter((p) => p !== permissionSlug)
        : [...prev, permissionSlug]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedPermissions.length === availablePermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(availablePermissions.map((p) => p.slug));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:3001/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setSuccess("Permissions updated successfully!");
        setTimeout(() => {
          router.push("/admin/users/roles");
        }, 1500);
      } else {
        setError(data.message || "Failed to update permissions");
      }
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category
  const groupedPermissions: Record<string, Permission[]> = {
    Users: availablePermissions.filter((p) => p.slug.startsWith("users.")),
    Roles: availablePermissions.filter((p) => p.slug.startsWith("roles.")),
    Clients: availablePermissions.filter((p) => p.slug.startsWith("clients.")),
    Loans: availablePermissions.filter((p) => p.slug.startsWith("loans.")),
    Savings: availablePermissions.filter((p) => p.slug.startsWith("savings.")),
    Payroll: availablePermissions.filter((p) => p.slug.startsWith("payroll.")),
    Assets: availablePermissions.filter((p) => p.slug.startsWith("assets.")),
    Leave: availablePermissions.filter((p) => p.slug.startsWith("leave.")),
    Advances: availablePermissions.filter((p) => p.slug.startsWith("advances.")),
    Reports: availablePermissions.filter((p) => p.slug.startsWith("reports.")),
    Settings: availablePermissions.filter((p) => p.slug.startsWith("settings.")),
    Policies: availablePermissions.filter((p) => p.slug.startsWith("policies.")),
    Communication: availablePermissions.filter((p) => p.slug.startsWith("communication.")),
    Audit: availablePermissions.filter((p) => p.slug.startsWith("audit.")),
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Permissions" />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading role permissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Permissions" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Permissions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage permissions for role: <span className="font-medium text-gray-900 dark:text-white">{role?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge size="sm" color="info">
              {selectedPermissions.length} selected
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/admin/users/roles")}
            >
              Back to Roles
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Permissions:</strong> Select the permissions that users with this role should have access to.
          </p>
        </div>

        {/* Select All */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedPermissions.length === availablePermissions.length}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select All Permissions
            </span>
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedPermissions.length} of {availablePermissions.length} selected
          </span>
        </div>

        {/* Permissions Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              permissions.length > 0 && (
                <div key={category} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          selectedPermissions.includes(permission.slug)
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.slug)}
                          onChange={() => handlePermissionToggle(permission.slug)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                        />
                        <div className="flex-1">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            {permission.name}
                          </span>
                          {permission.description && (
                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                              {permission.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/admin/users/roles")}
              disabled={saving}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

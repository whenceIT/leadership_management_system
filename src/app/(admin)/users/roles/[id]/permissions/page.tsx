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

interface PermissionsApiResponse {
  success: boolean;
  data?: Permission[];
  message?: string;
}

interface RoleApiResponse {
  success: boolean;
  data?: Role;
  message?: string;
}

export default function RolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch permissions from database
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`/api/permissions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: PermissionsApiResponse = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setAvailablePermissions(data.data);
        } else {
          console.error("Failed to fetch permissions:", data.message);
          setAvailablePermissions([]);
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setAvailablePermissions([]);
      }
    };

    fetchPermissions();
  }, []);

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/roles/${roleId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: RoleApiResponse = await response.json();

        if (data.success && data.data) {
          setRole(data.data);
          const permissions = data.data.permissions ? JSON.parse(data.data.permissions) : [];
          setSelectedPermissions(permissions);
        } else {
          setError(data.message || "Failed to fetch role");
          setRole(null);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setError("Failed to connect to server. Please check if API is running.");
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      fetchRole();
    }
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
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      const data: RoleApiResponse = await response.json();

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
  const groupedPermissions: Record<string, Permission[]> = {};
  
  availablePermissions.forEach((permission) => {
    // Extract category from slug (e.g., "users.view" -> "Users")
    const parts = permission.slug.split('.');
    const category = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Other';
    
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = [];
    }
    groupedPermissions[category].push(permission);
  });

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
              Manage permissions for role: <span className="font-medium text-gray-900 dark:text-white">{role?.name || 'Unknown'}</span>
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

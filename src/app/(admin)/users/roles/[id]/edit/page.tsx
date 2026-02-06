"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/button/Button";

interface Role {
  id: number;
  name: string;
  slug: string;
  time_limit: number;
  from_time: string | null;
  to_time: string | null;
  access_days: string | null;
  permissions: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data?: Role;
  message?: string;
}

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    time_limit: false,
    from_time: "",
    to_time: "",
    access_days: [] as string[],
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://smartbackend.whencefinancesystem.com/roles/${roleId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: ApiResponse = await response.json();

        if (data.success && data.data) {
          setRole(data.data);
          setFormData({
            name: data.data.name,
            slug: data.data.slug,
            time_limit: data.data.time_limit === 1,
            from_time: data.data.from_time || "",
            to_time: data.data.to_time || "",
            access_days: data.data.access_days ? JSON.parse(data.data.access_days) : [],
          });
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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle access day toggle
  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      access_days: prev.access_days.includes(day)
        ? prev.access_days.filter((d) => d !== day)
        : [...prev.access_days, day],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`https://smartbackend.whencefinancesystem.com/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setSuccess("Role updated successfully!");
        setTimeout(() => {
          router.push("/admin/users/roles");
        }, 1500);
      } else {
        setError(data.message || "Failed to update role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Role" />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading role...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Role" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Role
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update role information and access settings
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/admin/users/roles")}
          >
            Back to Roles
          </Button>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="e.g., Administrator"
            />
          </div>

          {/* Role Slug */}
          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="e.g., administrator"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              A unique identifier for the role (lowercase, no spaces)
            </p>
          </div>

          {/* Time Limit */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="time_limit"
                checked={formData.time_limit}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Time Limit
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Restrict access to specific time periods
            </p>
          </div>

          {/* Time Range */}
          {formData.time_limit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="from_time"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  From Time
                </label>
                <input
                  type="time"
                  id="from_time"
                  name="from_time"
                  value={formData.from_time}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="to_time"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  To Time
                </label>
                <input
                  type="time"
                  id="to_time"
                  name="to_time"
                  value={formData.to_time}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Access Days */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Access Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    formData.access_days.includes(day)
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select days when this role can access the system
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

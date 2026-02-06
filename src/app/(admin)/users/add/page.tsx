"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

interface Office {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface Province {
  id: number;
  name: string;
}

interface DropdownData {
  offices: Office[];
  roles: Role[];
  provinces: Province[];
}

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    officeId: "",
    roleId: "",
    gender: "unspecified",
    address: "",
    provinceId: "",
    status: "Active",
    enable2FA: false,
    timeLimit: false,
    fromTime: "",
    toTime: "",
    accessDays: [] as string[],
  });

  const [dropdownData, setDropdownData] = useState<DropdownData>({
    offices: [],
    roles: [],
    provinces: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://smart.whencefinancesystem.com/api/dropdown/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success && data.data) {
          setDropdownData(data.data);
        } else {
          setError(data.message || 'Failed to fetch dropdown data');
        }
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setError('Failed to connect to server. Please check if API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCheckboxChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      accessDays: prev.accessDays.includes(day)
        ? prev.accessDays.filter(d => d !== day)
        : [...prev.accessDays, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('https://smart.whencefinancesystem.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          office_id: formData.officeId ? parseInt(formData.officeId) : null,
          role_id: formData.roleId ? parseInt(formData.roleId) : null,
          gender: formData.gender,
          address: formData.address,
          status: formData.status,
          enable_google2fa: formData.enable2FA ? 1 : 0,
          time_limit: formData.timeLimit ? 1 : 0,
          from_time: formData.fromTime || null,
          to_time: formData.toTime || null,
          access_days: formData.accessDays.join(','),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("User created successfully!");
        // Reset form or redirect
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          officeId: "",
          roleId: "",
          gender: "unspecified",
          address: "",
          provinceId: "",
          status: "Active",
          enable2FA: false,
          timeLimit: false,
          fromTime: "",
          toTime: "",
          accessDays: [] as string[],
        });
      } else {
        alert(data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to connect to server. Please check if API is running.");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add User" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Create New User
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the details below to add a new user to the system
            </p>
          </div>
          <Link href="/users/view">
            <Button size="sm" variant="outline">
              Back to Users
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="+260 97 123 4567"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Province
                </label>
                <select
                  name="provinceId"
                  value={formData.provinceId || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Province</option>
                  {dropdownData.provinces.map((province) => (
                    <option key={province.id} value={province.id.toString()}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Account Information
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Confirm password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Office <span className="text-red-500">*</span>
                </label>
                <select
                  name="officeId"
                  value={formData.officeId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Office</option>
                  {dropdownData.offices.map((office) => (
                    <option key={office.id} value={office.id.toString()}>
                      {office.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Role</option>
                  {dropdownData.roles.map((role) => (
                    <option key={role.id} value={role.id.toString()}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enable2FA"
                  id="enable2FA"
                  checked={formData.enable2FA}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="enable2FA" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>

          {/* Access Settings */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Access Settings
            </h4>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                name="timeLimit"
                id="timeLimit"
                checked={formData.timeLimit}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="timeLimit" className="text-sm text-gray-700 dark:text-gray-300">
                Enable Time-Based Access
              </label>
            </div>
            {formData.timeLimit && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    From Time
                  </label>
                  <input
                    type="time"
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    To Time
                  </label>
                  <input
                    type="time"
                    name="toTime"
                    value={formData.toTime}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Access Days
              </label>
              <div className="flex flex-wrap gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.accessDays.includes(day)}
                      onChange={() => handleCheckboxChange(day)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Link href="/users/view">
              <Button size="md" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button size="md" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

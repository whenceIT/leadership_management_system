"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
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
  user_count: number;
  created_at: string;
  updated_at: string;
}

interface RoleUser {
  id: number;
  user_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_name: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: Role[] | RoleUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export default function RolesPage() {
  const [showPermissions, setShowPermissions] = useState<number | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<"roles" | "assignments">("roles");

  // Fetch roles from API
  const fetchRoles = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`http://localhost:3001/api/roles?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setRoles(data.data as Role[]);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      } else {
        setError(data.message || "Failed to fetch roles");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to connect to server. Please check if API is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch role-user assignments
  const fetchRoleUsers = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`http://localhost:3001/api/role-users?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setRoleUsers(data.data as RoleUser[]);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      } else {
        setError(data.message || "Failed to fetch role-user assignments");
      }
    } catch (err) {
      console.error("Error fetching role-users:", err);
      setError("Failed to connect to server. Please check if API is running.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === "roles") {
      fetchRoles(currentPage, searchTerm);
    } else {
      fetchRoleUsers(currentPage, searchTerm);
    }
  }, [activeTab]);

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    if (activeTab === "roles") {
      fetchRoles(1, searchTerm);
    } else {
      fetchRoleUsers(1, searchTerm);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeTab === "roles") {
      fetchRoles(page, searchTerm);
    } else {
      fetchRoleUsers(page, searchTerm);
    }
  };

  // Parse permissions from JSON string
  const parsePermissions = (permissions: string | null): string[] => {
    if (!permissions) return [];
    try {
      return JSON.parse(permissions);
    } catch {
      return [];
    }
  };

  // Parse access days from JSON string
  const parseAccessDays = (accessDays: string | null): string => {
    if (!accessDays) return "All days";
    try {
      const days = JSON.parse(accessDays);
      if (Array.isArray(days) && days.length === 7) {
        return "All days";
      }
      return days.join(", ");
    } catch {
      return "All days";
    }
  };

  // Delete role-user assignment
  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("Are you sure you want to remove this role assignment?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/role-users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchRoleUsers(currentPage, searchTerm);
      } else {
        setError(data.message || "Failed to delete role assignment");
      }
    } catch (err) {
      console.error("Error deleting role assignment:", err);
      setError("Failed to connect to server.");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage User Roles" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <input
                type="text"
                placeholder={activeTab === "roles" ? "Search roles..." : "Search assignments..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </form>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={activeTab === "roles" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("roles");
                setCurrentPage(1);
              }}
            >
              Roles
            </Button>
            <Button
              size="sm"
              variant={activeTab === "assignments" ? "primary" : "outline"}
              onClick={() => {
                setActiveTab("assignments");
                setCurrentPage(1);
              }}
            >
              Assignments
            </Button>
            {activeTab === "roles" && (
              <Button size="sm" variant="primary">
                Add New Role
              </Button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>Roles & Permissions:</strong> Define user roles and assign specific permissions to control access to different system features.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        {/* Roles Table */}
        {activeTab === "roles" && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-500">Loading roles...</div>
              </div>
            ) : roles.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-500">No roles found</div>
              </div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1000px]">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Role Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Users
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Permissions
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Access
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                        Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold text-white">
                                {role.name[0]}
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {role.name}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {role.slug}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <Badge size="sm" color="success">
                              {role.user_count} users
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <div>
                              <button
                                onClick={() => setShowPermissions(showPermissions === role.id ? null : role.id)}
                                className="text-sm text-brand-500 hover:text-brand-600"
                              >
                                {showPermissions === role.id ? "Hide" : "Show"} ({parsePermissions(role.permissions).length})
                              </button>
                              {showPermissions === role.id && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {parsePermissions(role.permissions).map((perm, index) => (
                                    <Badge key={index} size="sm" color="warning">
                                      {perm}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div>
                              <div className="text-xs">
                                {role.time_limit === 1 ? (
                                  <Badge size="sm" color="warning">Time Limited</Badge>
                                ) : (
                                  <Badge size="sm" color="success">24/7</Badge>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-gray-400">
                                {role.from_time && role.to_time ? `${role.from_time} - ${role.to_time}` : parseAccessDays(role.access_days)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="px-3 py-2">
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="px-3 py-2">
                                Permissions
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 py-2 text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Role-User Assignments Table */}
        {activeTab === "assignments" && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-500">Loading assignments...</div>
              </div>
            ) : roleUsers.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-500">No role assignments found</div>
              </div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          User
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Role
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Assigned Date
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {roleUsers.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                                {assignment.first_name[0]}{assignment.last_name[0]}
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {assignment.first_name} {assignment.last_name}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {assignment.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <Badge size="sm" color="success">
                              {assignment.role_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 py-2 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && ((activeTab === "roles" && roles.length > 0) || (activeTab === "assignments" && roleUsers.length > 0)) && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

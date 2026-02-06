"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

interface InactiveUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  office_name: string;
  status: "Active" | "Inactive";
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  data: InactiveUser[];
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function InactiveUsersPage() {
  const [users, setUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [officeId, setOfficeId] = useState<string>("");
  const [offices, setOffices] = useState<{ id: number; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch offices on mount
  useEffect(() => {
    async function fetchOffices() {
      try {
        const response = await fetch("https://smartbackend.whencefinancesystem.com/offices");
        const data = await response.json();
        if (data.success) {
          setOffices(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch offices:", err);
      }
    }
    fetchOffices();
  }, []);

  // Fetch inactive users when page, search, or officeId changes
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          ...(search && { search }),
          ...(officeId && { officeId }),
        });
        const response = await fetch(
          `https://smartbackend.whencefinancesystem.com/users/inactive?${params.toString()}`
        );
        const data: ApiResponse = await response.json();
        if (data.success) {
          setUsers(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        } else {
          setError(data.message || "Failed to fetch inactive users");
        }
      } catch (err) {
        setError("Failed to connect to server");
        console.error("Error fetching inactive users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [currentPage, search, officeId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOfficeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOfficeId(e.target.value);
    setCurrentPage(1);
  };

  const handleReactivate = async (userId: number) => {
    if (!confirm("Are you sure you want to reactivate this user?")) {
      return;
    }
    try {
      const response = await fetch(
        `https://smartbackend.whencefinancesystem.com/users/${userId}/reactivate`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.success) {
        // Refresh user list
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          ...(search && { search }),
          ...(officeId && { officeId }),
        });
        const refreshResponse = await fetch(
          `https://smartbackend.whencefinancesystem.com/users/inactive?${params.toString()}`
        );
        const refreshData: ApiResponse = await refreshResponse.json();
        if (refreshData.success) {
          setUsers(refreshData.data);
          setTotal(refreshData.pagination.total);
        }
      } else {
        alert(data.message || "Failed to reactivate user");
      }
    } catch (err) {
      alert("Failed to connect to server");
      console.error("Error reactivating user:", err);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="View Inactive Users" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search inactive users..."
              value={search}
              onChange={handleSearch}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={officeId}
              onChange={handleOfficeChange}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Offices</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id.toString()}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>
          <Link href="/users/view">
            <Button size="sm" variant="outline">
              View Active Users
            </Button>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Inactive users cannot access system. You can reactivate them if needed.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
          </div>
        ) : (
          <>
            {/* Inactive Users Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[900px]">
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
                          Email
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Phone
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Office
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Status
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Created Date
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
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell className="px-5 py-8 text-center text-gray-500">
                            No inactive users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-sm font-semibold text-white">
                                  {user.first_name[0]}
                                  {user.last_name[0]}
                                </div>
                                <div>
                                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {user.first_name} {user.last_name}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user.email}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user.phone || "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user.office_name || "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <Badge size="sm" color="error">
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleString()
                                : "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="px-3 py-2 text-green-600 hover:text-green-700"
                                  onClick={() => handleReactivate(user.id)}
                                >
                                  Reactivate
                                </Button>
                                <Button size="sm" variant="outline" className="px-3 py-2">
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min((currentPage - 1) * 10 + 1, total)} of {total} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

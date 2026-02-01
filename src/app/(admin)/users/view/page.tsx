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

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  office_name: string;
  status: "Active" | "Inactive";
  last_login: string;
}

interface ApiResponse {
  success: boolean;
  data: User[];
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ViewUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [officeId, setOfficeId] = useState<string>("");
  const [offices, setOffices] = useState<{ id: number; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch offices
  useEffect(() => {
    async function fetchOffices() {
      try {
        const response = await fetch("http://localhost:3001/api/offices");
        const data = await response.json();
        if (data.success) {
          setOffices(data.data);
        }
      } catch (err) {
        console.error("Error fetching offices:", err);
      }
    }
    fetchOffices();
  }, []);

  // Fetch users
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
          `http://localhost:3001/api/users?${params.toString()}`
        );
        const data: ApiResponse = await response.json();

        if (data.success) {
          setUsers(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("Failed to connect to server");
        console.error("Error fetching users:", err);
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

  const handleDeactivate = async (userId: number) => {
    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/deactivate`, {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        // Refresh users list
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          ...(search && { search }),
          ...(officeId && { officeId }),
        });

        const usersResponse = await fetch(
          `http://localhost:3001/api/users?${params.toString()}`
        );
        const usersData: ApiResponse = await usersResponse.json();

        if (usersData.success) {
          setUsers(usersData.data);
        }
      } else {
        alert(data.message || "Failed to deactivate user");
      }
    } catch (err) {
      console.error("Error deactivating user:", err);
      alert("Failed to deactivate user");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="View Users" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search users..."
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
          <Link href="/users/add">
            <Button size="sm" variant="primary">
              Add New User
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-200 border-t-brand-500"></div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Users Table */}
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
                          Last Login
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
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                                  {user.first_name[0]}{user.last_name[0]}
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
                              <Badge size="sm" color="success">
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user.last_login
                                ? new Date(user.last_login).toLocaleString()
                                : "Never"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <div className="flex items-center gap-2">
                                <Link href={`/users/${user.id}/edit`}>
                                  <Button size="sm" variant="outline" className="px-3 py-2">
                                    Edit
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="px-3 py-2 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeactivate(user.id)}
                                >
                                  Deactivate
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

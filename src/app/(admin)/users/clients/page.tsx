"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect, useCallback } from "react";
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

interface ClientUser {
  id: number;
  client_id: number;
  account_no: string;
  client_first_name: string;
  client_last_name: string;
  client_full_name: string;
  client_type: "individual" | "business" | "ngo" | "other";
  client_status: "pending" | "active" | "inactive" | "declined" | "closed" | "blacklisted";
  office_name: string | null;
  user_id: number | null;
  user_email: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
  user_status: "Active" | "Inactive" | null;
  linked_at: string;
}

interface ApiResponse {
  success: boolean;
  data: ClientUser[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ClientUsersPage() {
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchClientUsers = useCallback(async (page: number = 1, search: string = "", clientType: string = "", status: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(clientType && { clientType }),
        ...(status && { status }),
      });

      const response = await fetch(`http://localhost:3001/api/clients/users?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setClientUsers(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
        }
      } else {
        setError(data.message || "Failed to fetch client users");
      }
    } catch (err) {
      console.error("Error fetching client users:", err);
      setError("Failed to connect to server. Please check if the API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientUsers(currentPage, searchTerm, clientTypeFilter, statusFilter);
  }, [currentPage, fetchClientUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClientTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchClientUsers(1, searchTerm, clientTypeFilter, statusFilter);
  };

  const getClientInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return "?";
    return `${firstName ? firstName[0] : ""}${lastName ? lastName[0] : ""}`.toUpperCase();
  };

  const getClientName = (firstName: string | null, lastName: string | null, fullName: string | null) => {
    if (fullName) return fullName;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return firstName || lastName || "Unknown";
  };

  const getUserName = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return firstName || lastName || "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
        return "error";
      case "declined":
        return "error";
      case "closed":
        return "error";
      case "blacklisted":
        return "error";
      default:
        return "warning";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="View Client Users" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search client users..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={clientTypeFilter}
              onChange={handleClientTypeChange}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Client Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="ngo">NGO</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="declined">Declined</option>
              <option value="closed">Closed</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
          <Link href="/users/add">
            <Button size="sm" variant="primary">
              Add Client User
            </Button>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Client Users:</strong> These are users linked to client accounts in the system. They can access client-specific features and manage their accounts.
          </p>
        </div>

        {/* Client Users Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Client Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Account No.
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      User Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Client Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Client Status
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
                      Linked Date
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="px-5 py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">Loading client users...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={10} className="px-5 py-8 text-center">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                      </TableCell>
                    </TableRow>
                  ) : clientUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="px-5 py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No client users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientUsers.map((clientUser) => (
                      <TableRow key={clientUser.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                              {getClientInitials(clientUser.client_first_name, clientUser.client_last_name)}
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {getClientName(clientUser.client_first_name, clientUser.client_last_name, clientUser.client_full_name)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {clientUser.account_no || "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {clientUser.user_id ? getUserName(clientUser.user_first_name, clientUser.user_last_name) : "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {clientUser.user_email || "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {clientUser.user_status ? (
                            <Badge
                              size="sm"
                              color={clientUser.user_status === "Active" ? "success" : "error"}
                            >
                              {clientUser.user_status}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge size="sm" color="warning">
                            {clientUser.client_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge size="sm" color={getStatusColor(clientUser.client_status)}>
                            {clientUser.client_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {clientUser.office_name || "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(clientUser.linked_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex items-center gap-2">
                            <Link href={`/clients/${clientUser.client_id}`}>
                              <Button size="sm" variant="outline" className="px-3 py-2">
                                View Client
                              </Button>
                            </Link>
                            {clientUser.user_id && (
                              <Link href={`/users/view/${clientUser.user_id}`}>
                                <Button size="sm" variant="outline" className="px-3 py-2">
                                  View User
                                </Button>
                              </Link>
                            )}
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
            Showing {total > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, total)} of {total} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

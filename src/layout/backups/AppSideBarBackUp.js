"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  AccountingIcon,
  AdvancesIcon,
  ApprovalsIcon,
  AssetsIcon,
  AuditTrailIcon,
  CalenderIcon,
  ChevronDownIcon,
  CommunicationIcon,
  GridIcon,
  HorizontaLDots,
  LedgerIcon,
  LeaveIcon,
  LoansIcon,
  PayrollIcon,
  PoliciesIcon,
  ReportsIcon,
  SettingsIcon,
  TicketIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <TicketIcon />,
    name: "Tickets",
    path: "/tickets",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    name: "Ledger",
    icon: <LedgerIcon />,
    subItems: [
      { name: "General Ledger", path: "/ledger/general", pro: false },
      { name: "Branch Ledgers", path: "/ledger/branch", pro: false },
    ],
  },
  {
    name: "Loans",
    icon: <LoansIcon />,
    subItems: [
      { name: "Active Loans", path: "/loans/active", pro: false },
      { name: "My Active Loans", path: "/loans/my-active", pro: false },
      { name: "Branch Active Loans", path: "/loans/branch-active", pro: false },
      { name: "Pending Approval", path: "/loans/pending-approval", pro: false },
      { name: "Awaiting Disbursement", path: "/loans/awaiting-disbursement", pro: false },
      { name: "Loans Declined", path: "/loans/declined", pro: false },
      { name: "Loans Written Off", path: "/loans/written-off", pro: false },
      { name: "Loans Closed", path: "/loans/closed", pro: false },
      { name: "Loans Rescheduled", path: "/loans/rescheduled", pro: false },
      { name: "Loan Applications", path: "/loans/applications", pro: false },
      { name: "Add Loan", path: "/loan/create", pro: false },
      { name: "Manage Loan Products", path: "/loans/products", pro: false },
      { name: "Loan Calculator", path: "/loans/calculator", pro: false },
    ],
  },
  {
    name: "Approvals",
    icon: <ApprovalsIcon />,
    subItems: [
      { name: "Loans Pending", path: "/approvals/loans-pending", pro: false },
      { name: "Top Ups Pending Approval", path: "/approvals/top-ups-pending", pro: false },
      { name: "Transaction Approvals", path: "/approvals/transactions", pro: false },
      { name: "Reloan Approvals", path: "/approvals/reloans", pro: false },
      { name: "Waiver Approvals", path: "/approvals/waivers", pro: false },
      { name: "Charge Approvals", path: "/approvals/charges", pro: false },
      { name: "Clients Pending Approval", path: "/approvals/clients", pro: false },
      { name: "Advances Pending Approvals", path: "/approvals/advances", pro: false },
      { name: "Advance-TopUps Approvals", path: "/approvals/advance-topups", pro: false },
      { name: "Pending Leave Approvals", path: "/approvals/leave", pro: false },
    ],
  },

  {
    name: "Payroll Loan Applications",
    icon: <PayrollIcon />,
    subItems: [
      { name: "Pending approval", path: "/payroll/pending", pro: false },
      { name: "Approved", path: "/payroll/approved", pro: false },
      { name: "Declined", path: "/payroll/declined", pro: false },
    ],
  },
  {
    name: "Company Policies",
    icon: <PoliciesIcon />,
    subItems: [
      { name: "View Policies", path: "/policies/view", pro: false },
      { name: "User Responses", path: "/policies/user-responses", pro: false },
      { name: "Add Policies", path: "/policies/add", pro: false },
    ],
  },
  {
    name: "Accounting",
    icon: <AccountingIcon />,
    subItems: [
      { name: "Chart of Accounts", path: "/accounting/gl_account/data", pro: false },
      { name: "Journals", path: "/accounting/journal/data", pro: false },
      { name: "Add Journal Entry", path: "/accounting/journal/create", pro: false },
      { name: "Reconciliation", path: "/accounting/reconciliation/data", pro: false },
      { name: "Close Periods", path: "/accounting/period/data", pro: false },
    ],
  },
  {
    name: "Reports",
    icon: <ReportsIcon />,
    subItems: [
      { name: "Client Reports", path: "/report/client_report", pro: false },
      { name: "Loan Reports", path: "/report/loan_report", pro: false },
      { name: "Financial Reports", path: "/report/financial_report", pro: false },
      { name: "Organisation Reports", path: "/report/company_report", pro: false },
      { name: "Savings Reports", path: "/report/savings_report", pro: false },
      { name: "Report Scheduler", path: "/report/report_scheduler/data", pro: false },
    ],
  },
  {
    name: "Advances",
    icon: <AdvancesIcon />,
    subItems: [
      { name: "Apply for Advance", path: "/advances/apply", pro: false },
      { name: "My Advances", path: "/advances/my_advances", pro: false },
      { name: "Active Advances", path: "/advances/active_advances", pro: false },
      { name: "Pending Approvals", path: "/advances/pending_approvals", pro: false },
      { name: "TopUps Pending Approval", path: "/advances/topups_pending_approval", pro: false },
      { name: "Declined Advances", path: "/advances/declined_advances", pro: false },
      { name: "Closed Advances", path: "/advances/closed_advances", pro: false },
    ],
  },
  {
    name: "Annual Leave",
    icon: <LeaveIcon />,
    subItems: [
      { name: "My Leave Days", path: "/leave/my_leave_days", pro: false },
      { name: "Active Leave", path: "/leave/active_leave", pro: false },
      { name: "Pending Leave Approvals", path: "/leave/pending_leave_approvals", pro: false },
      { name: "Declined Leave", path: "/leave/declined_leave", pro: false },
    ],
  },
  {
    name: "Communication",
    icon: <CommunicationIcon />,
    subItems: [
      { name: "View Campaigns", path: "/communication/data", pro: false },
      { name: "Create Campaign", path: "/communication/create", pro: false },
    ],
  },
  {
    name: "Assets",
    icon: <AssetsIcon />,
    subItems: [
      { name: "View Assets", path: "/asset/data", pro: false },
      { name: "Add Asset", path: "/asset/create", pro: false },
      { name: "Manage Asset Types", path: "/asset/type/data", pro: false },
    ],
  },
  {
    name: "Users",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "View Users", path: "/users/view", pro: false },
      { name: "View Inactive Users", path: "/users/inactive", pro: false },
      { name: "View Client Users", path: "/users/clients", pro: false },
      { name: "Manage Roles", path: "/users/roles", pro: false },
      { name: "Add User", path: "/users/add", pro: false },
    ],
  },
  {
    icon: <AuditTrailIcon />,
    name: "Audit Trail",
    path: "/audit-trail",
  },
  {
    name: "Settings",
    icon: <SettingsIcon />,
    subItems: [
      { name: "General", path: "/settings/general", pro: false },
      { name: "Organisation", path: "/settings/organisation", pro: false },
      { name: "System fail safes", path: "/settings/fail-safes", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if current path matches any submenu item
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    // If no submenu item matches, close open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname,isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu === index) {
        return null;
      }
      return index;
    });
  };

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group  ${
                openSubmenu === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu === index
                    ? `${subMenuHeight[`${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex items-center gap-3 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/logo.jpg"
            alt="Logo"
            width={isExpanded || isHovered || isMobileOpen ? 40 : 40}
            height={isExpanded || isHovered || isMobileOpen ? 40 : 40}
            className="object-contain"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Whence
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;

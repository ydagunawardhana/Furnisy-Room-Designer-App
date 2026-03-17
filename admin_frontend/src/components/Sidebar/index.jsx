import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../../icons";
import { useSidebar } from "../../context/SidebarContext";
import { MdLogout } from "react-icons/md";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: <GridIcon />,
        label: "Dashboard",
        route: "/",
      },
      {
        icon: <BoxCubeIcon />,
        label: "Products Management",
        route: "/products",
        children: [
          { label: "All Products", route: "/products" },
          { label: "Categories", route: "/categories" },
        ],
      },
      {
        icon: <ListIcon />,
        label: "Orders Management",
        route: "/orders",
        children: [
          { label: "All Orders", route: "/orders" },
          { label: "Invoices & Payments", route: "/orders/invoices" },
        ],
      },
      {
        icon: <UserCircleIcon />,
        label: "Customers Management",
        route: "/customers",
        children: [
          { label: "All Customers", route: "/customers" },
          { label: "User Saved Rooms", route: "/customers/saved-rooms" },
        ],
      },
      {
        icon: <PlugInIcon />,
        label: "System Settings",
        route: "/settings",
      },
    ],
  },
];

const Sidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback((path) => pathname === path, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    menuGroups.forEach((group, groupIndex) => {
      group.menuItems.forEach((menuItem, itemIndex) => {
        if (menuItem.children) {
          menuItem.children.forEach((subItem) => {
            if (isActive(subItem.route)) {
              setOpenSubmenu({
                type: groupIndex,
                index: itemIndex,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, groupIndex) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === groupIndex &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: groupIndex, index };
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      if (typeof closeDropdown === "function") {
        closeDropdown();
      }

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-fade-up" : "animate-fade-down"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3`}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </div>
            <span className="text-[14px] font-medium tracking-wide">
              Logged out successfully!
            </span>
          </div>
        ),
        { id: "logoutToast", position: "top-right", duration: 2000 }
      );

      setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        className={`py-10 px-16 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo copy.svg"
                alt="Logo"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo copy.svg"
                alt="Logo"
                width={100}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo copy.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`}>
                <h2
                  className={`mb-4 text-[13px] uppercase flex leading-[20px] text-black font-semibold ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    group.name
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                <ul className="flex flex-col gap-4">
                  {group.menuItems.map((menuItem, index) => {
                    const isGroupActive = menuItem.children?.some((sub) =>
                      isActive(sub.route)
                    );
                    const isItemOpen =
                      openSubmenu?.type === groupIndex &&
                      openSubmenu?.index === index;

                    const isOpen = isItemOpen || isGroupActive;

                    return (
                      <li key={`menu-item-${groupIndex}-${index}`}>
                        {menuItem.children ? (
                          <div className="flex flex-col">
                            <button
                              onClick={() => {
                                handleSubmenuToggle(index, groupIndex);
                              }}
                              className={`menu-item group ${
                                isOpen
                                  ? "menu-item-active"
                                  : "menu-item-inactive"
                              } cursor-pointer ${
                                !isExpanded && !isHovered
                                  ? "lg:justify-center"
                                  : "lg:justify-start"
                              }`}
                            >
                              <span
                                className={`menu-item-icon-size ${
                                  isOpen
                                    ? "menu-item-icon-active"
                                    : "menu-item-icon-inactive"
                                }`}
                              >
                                {menuItem.icon}
                              </span>
                              {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">
                                  {menuItem.label}
                                </span>
                              )}
                              {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon
                                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                    isOpen ? "rotate-180 text-brand-500" : ""
                                  }`}
                                />
                              )}
                            </button>
                            {(isExpanded || isHovered || isMobileOpen) && (
                              <div
                                ref={(el) => {
                                  subMenuRefs.current[
                                    `${groupIndex}-${index}`
                                  ] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                  height: isOpen
                                    ? subMenuHeight[`${groupIndex}-${index}`]
                                      ? `${
                                          subMenuHeight[
                                            `${groupIndex}-${index}`
                                          ]
                                        }px`
                                      : "auto"
                                    : "0px",
                                }}
                              >
                                <ul className="mt-2 space-y-1 ml-9">
                                  {menuItem.children.map(
                                    (subItem, subIndex) => (
                                      <li
                                        key={`sub-item-${groupIndex}-${index}-${subIndex}`}
                                      >
                                        <Link
                                          to={subItem.route}
                                          className={`menu-dropdown-item ${
                                            isActive(subItem.route)
                                              ? "menu-dropdown-item-active"
                                              : "menu-dropdown-item-inactive"
                                          }`}
                                        >
                                          {subItem.label}
                                        </Link>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={menuItem.route}
                            className={`menu-item group ${
                              isActive(menuItem.route)
                                ? "menu-item-active"
                                : "menu-item-inactive"
                            } ${
                              !isExpanded && !isHovered
                                ? "lg:justify-center"
                                : "lg:justify-start"
                            }`}
                          >
                            <span
                              className={`menu-item-icon-size ${
                                isActive(menuItem.route)
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive"
                              }`}
                            >
                              {menuItem.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                              <span className="menu-item-text">
                                {menuItem.label}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button Section (Always at the bottom) */}
        <div className="mt-auto pb-6">
          <button
            onClick={handleLogout}
            className={`menu-item group menu-item-inactive w-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={`menu-item-icon-size group-hover:text-red-500 transition-colors`}
            >
              <MdLogout size={22} />
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text font-medium group-hover:text-red-500 transition-colors">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

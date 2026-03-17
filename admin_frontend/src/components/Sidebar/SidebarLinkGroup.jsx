import { useState } from "react";

const SidebarLinkGroup = ({ children, activeCondition }) => {
  const [open, setOpen] = useState(activeCondition);

  const handleClick = () => {
    setOpen(!open);
  };

  return <li className="list-none">{children(handleClick, open)}</li>;
};

export default SidebarLinkGroup;

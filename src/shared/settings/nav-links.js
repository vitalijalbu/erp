import { IconUserEdit, IconBuilding, IconSettingsAutomation, IconUserCircle, IconUserCog, IconUsersGroup, IconClock } from "@tabler/icons-react";

const navLinks = [
{
  title: "Account",
  items: [
    {
      label: "My account",
      description: "My account",
      icon: <IconUserEdit/>,
      url: "/settings/account"
    },    
    {
      label: "Timezone",
      description: "Set account timezone",
      icon: <IconClock/>,
      url: "/settings/timezone"
    },
  ],
},
{
  title: "Users",
  items: [
    {
      label: "Users",
      description: "User Management",
      icon: <IconUserCircle/>,
      url: "/users"
    },
    {
      label: "Role Management",
      description: "Role Management",
      icon: <IconUserCog/>,
      url: "/users/roles"
    }
  ],
},
{
  title: "General",
  items: [
    {
      label: "General Settings",
      description: "General Settings",
      icon: <IconSettingsAutomation/>,
      url: "#"
    },
    {
      label: "Company Information",
      description: "Company Information",
      icon: <IconBuilding/>,
      url: "#"
    }
  ],
},
{
  title: "Other",
  items: [
    {
      label: "Business partners",
      description: "Manage business partners",
      icon: <IconUsersGroup/>,
      url: "/business-partners"
    },
    {
      label: "Warehouses",
      description: "Manage warehouses",
      icon: <IconBuilding/>,
      url: "/warehouses"
    }
  ],
},
];

export default navLinks;

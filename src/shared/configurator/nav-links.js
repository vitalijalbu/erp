import {
  IconCategory,
  IconTriangleSquareCircle,
  IconListDetails
} from "@tabler/icons-react";

const navLinks = [
  {
    title: "Fast links",
    items: [
      {
        label: "Functions",
        description: "Manage all configurator functions",
        icon: <IconCategory />,
        url: "/configurator/functions",
      },
      {
        label: "Features",
        description: "Manage configurator features",
        icon: <IconTriangleSquareCircle />,
        url: "/configurator/features",
      }, 
      {
        label: "Standard products",
        description: "Manage standard products",
        icon: <IconListDetails />,
        url: "/configurator/standard-products",
      }, 
      {
        label: "Constraints",
        description: "Manage standard products",
        icon: <IconListDetails />,
        url: "/configurator/constraints",
      },
    ]}
];

export default navLinks;

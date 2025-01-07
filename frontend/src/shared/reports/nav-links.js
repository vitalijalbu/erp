import {
  Icon123,
  IconCompass,
  IconCut,
  IconActivity,
  IconUserCircle,
} from "@tabler/icons-react";

const navLinks = [
  {
    title: "Cutting",
    items: [
      {
        label: "Cutting",
        description: "Cutting reports overview",
        icon: <IconCut />,
        url: "/reports/cutting",
      },
      {
        label: "Cutting waste",
        description: "Cutting waste reports overview",
        icon: <IconCut />,
        url: "/reports/cutting/waste",
      },
    ]},
    {
      title: "Other",
      items: [
      {
        label: "Activity viewer",
        description: "Activity reports overview",
        icon: <IconActivity />,
        url: "/reports/activity",
      },
      {
        label: "Graph stock at date",
        description: "Graph stock at date reports overview",
        icon: <IconActivity />,
        url: "/reports/graphs/stock-date",
      },
      {
        label: "Transactions history",
        description: "Transactions reports overview",
        icon: <IconActivity />,
        url: "/reports/transactions",
      },
      {
        label: "Stock limits",
        description: "Stock limits reports overview",
        icon: <IconActivity />,
        url: "/reports/stock-limits",
      },
      {
        label: "Open Purchases from Chiorino SPA",
        description: "Purchases reports overview",
        icon: <IconActivity />,
        url: "/reports/purchases",
      },
      {
        label: "Unload item",
        description: "Unload item reports overview",
        icon: <IconActivity />,
        url: "/reports/unload-item",
      },
    ],
  },
  {
    title: "Lots",
    items: [
      {
        label: "Transactions history",
        description: "Transactions reports overview",
        icon: <IconActivity />,
        url: "/reports/transactions",
      },
      {
        label: "Lot tracking",
        description: "Lot tracking reports overview",
        icon: <IconActivity />,
        url: "/reports/lots/tracking",
      },
      {
        label: "Lot shipped",
        description: "Lot tracking reports overview",
        icon: <IconActivity />,
        url: "/reports/lots/shipped",
      },
    ],
  },
];

export default navLinks;

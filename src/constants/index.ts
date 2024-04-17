export const tags = [
  {
    id: "1037985352536830013",
    name: "Knowledge",
  },
  {
    id: "1037985383465627679",
    name: "Bug",
  },
  {
    id: "1037985445172215839",
    name: "New Feature",
  },
  {
    id: "1044545382782349393",
    name: "Resolved",
  },
  {
    id: "1044546639513276416",
    name: "Documentation update",
  },
  {
    id: "1052438915778363422",
    name: "No Response",
  },
  {
    id: "1052458635298619474",
    name: "Priority 1",
  },
  {
    id: "1052798794221240321",
    name: "Priority 2",
  },
  {
    id: "1057180917623435295",
    name: "Priority 3",
  },
  {
    id: "1057181111920369674",
    name: "Priority 4",
  },
  {
    id: "1206900864086974504",
    name: "In Process",
  },
  {
    id: "1207181596482871336",
    name: "Pending from Org",
  },
  {
    id: "1213041779310469180",
    name: "Bug at Meta's End",
  },
  {
    id: "1213042817652232222",
    name: "Task",
  },
];

export const getTags = (tagId: string) => {
  const tag = tags.find((tag) => tag.id === tagId);
  return tag?.name || "";
};

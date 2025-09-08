import { useState } from "react";
import { Tree, TreeNode } from "@/components/ui/tree";
import { GraduationCapIcon, ChevronRight } from "lucide-react";
import { CourseModal } from "./CourseModal";
import { GroupModal } from "./GroupModal";
import { ContentModal } from "./ContentModal";
import { Button } from "@/components/ui/button";

const treeData: TreeNode[] = [
  {
    id: "1_abc",
    label: "Anonymity",
    children: [
      {
        id: "2_abd",
        label: "Land Trusts",
        children: [
          {
            id: "3_ebc",
            label: "Watch The Video",
          },
          {
            id: "3_eas",
            label: "How to use a land trust?",
          },
          {
            id: "3_ddd",
            label: "How do land trusts reduce lawsuit risk?",
          },
          {
            id: "3_kkk",
            label: "What are the best practices around structuring entities with partners?",
          },
          {
            id: "3_rwe",
            label: "Additional Resources",
          },
        ],
      },
      {
        id: "2_ack",
        label: "Hub-And-Spoke",
        children: [
          {
            id: "3_ber",
            label: "Watch The Masterclass",
          },
          {
            id: "3_tyc",
            label: "How to use an LLC for your Operations Company?",
          },
          {
            id: "3_gyd",
            label: "What are the best practices around structuring entities with partners?",
          },
          {
            id: "3_ycf",
            label: "How to file taxes with partners in an LLC?",
          },
          {
            id: "3_ter",
            label: "Additional Resources",
          },
        ],
      },
    ],
  },
  {
    id: "1_ite",
    label: "Root Node 2",
    children: [
      {
        id: "2_tcg",
        label: "Branch 2",
        children: [
          {
            id: "3_cjg",
            label: "Leaf 2",
          },
        ],
      },
    ],
  },
];

export function CoursesSection() {
  const [openIndex, setOpenIndex] = useState(-1);

  const closeModal = () => {
    setOpenIndex(-1);
  }

  const onCreate = (n) => {
    setOpenIndex(n.id[0]);
  }
  const onEdit = (n) => {
    setOpenIndex(n.id[0] - 1);
  }
  const onDelete = (n) => {

  }

  return (
    <div className="flex-1 p-4">
      <div className="flex gap-4 items-center bg-white p-6 rounded-lg border border-royal-light-gray mb-5">
        <GraduationCapIcon className="h-10 w-10 text-royal-gray" />
        <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Courses</h1>
      </div>
      <div className="flex mb-2">
        <div className="flex  items-center">
          <div
            className="cursor-pointer flex items-center text-gray-800"
          >
            <span className="text-lg font-medium">Courses</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </div>
          <div
            className="cursor-pointer flex items-center text-gray-800"
          >
            <span className="text-lg font-medium">Bundles</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </div>
          <div
            className="cursor-pointer flex items-center text-gray-800"
          >
            <span className="text-lg font-medium">Content</span>
          </div>
        </div>
        <Button className="ml-auto mr-4  bg-blue-600 text-white hover:bg-blue-700 px-3 py-1  rounded-lg text-sm" onClick={() => setOpenIndex(0)}>
          Create Course
        </Button>
      </div>
      <Tree
        data={treeData}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CourseModal isOpen={openIndex == 0} closeDialog={closeModal} />
      <GroupModal isOpen={openIndex == 1} closeDialog={closeModal} />
      <ContentModal isOpen={openIndex == 2} closeDialog={closeModal}/>
    </div>
  );
}
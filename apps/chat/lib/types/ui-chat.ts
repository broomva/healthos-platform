export interface UIChat {
  createdAt: Date;
  id: string;
  isPinned: boolean;
  projectId: string | null;
  title: string;
  updatedAt: Date;
  userId: string;
  visibility: "private" | "public";
}

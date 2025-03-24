import { CreateDaoForm } from "@/components/CreateDaoForm";

export default function CreateDaoPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New DAO</h1>
      <CreateDaoForm />
    </main>
  );
} 
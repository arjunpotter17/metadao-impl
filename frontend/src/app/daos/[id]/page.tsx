import { api } from '@/utils/api';
import Link from 'next/link';

interface DaoPageProps {
  params: {
    id: string;
  };
}

export default async function DaoPage({ params }: DaoPageProps) {
  const dao = await api.getDaoById(params.id);
  const proposals = await api.getDaoProposals(params.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to DAOs
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{dao.name}</h1>
        <p className="text-gray-600">{dao.description}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Proposals</h2>
        <div className="grid gap-4">
          {proposals.map((proposal, index) => (
            <Link
              key={proposal.id}
              href={`/daos/${params.id}/proposals/${index}`}
              className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
              <p className="text-gray-600">{proposal.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 
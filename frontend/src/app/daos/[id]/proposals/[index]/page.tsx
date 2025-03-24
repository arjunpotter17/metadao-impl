import { api } from '@/utils/api';
import Link from 'next/link';

interface ProposalPageProps {
  params: {
    id: string;
    index: string;
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const proposal = await api.getProposalByIndex(params.id, params.index);

  return (
    <main className="container mx-auto px-4 py-8">
      <Link 
        href={`/daos/${params.id}`} 
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to DAO Proposals
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600">{proposal.description}</p>
        </div>
      </div>
    </main>
  );
} 
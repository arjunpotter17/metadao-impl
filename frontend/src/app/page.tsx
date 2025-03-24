import { api } from '@/utils/api';
import DaoCard from '@/components/DaoCard';
import Link from 'next/link';

export default async function Home() {
  const daos = await api.getAllDaos();
  console.log('this is daos',daos);
  return daos.length > 0 ? (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Decentralized Autonomous Organizations</h1>
        <Link
          href="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New DAO
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daos.map((dao) => (
          <DaoCard key={dao.id} dao={dao} />
        ))}
      </div>
    </main>
  ) : (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">No DAOs found</h1>
    </main>
  );
}

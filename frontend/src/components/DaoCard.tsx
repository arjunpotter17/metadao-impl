import Link from 'next/link';
import { DAO } from '@/utils/api';

interface DaoCardProps {
  dao: DAO;
}

export default function DaoCard({ dao }: DaoCardProps) {
  return (
    <Link href={`/daos/${dao.id}`} className="block">
      <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-2">{dao.name}</h2>
        <p className="text-gray-600">{dao.description}</p>
      </div>
    </Link>
  );
} 
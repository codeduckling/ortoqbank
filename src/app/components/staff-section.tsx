import Image from 'next/image';

interface StaffMember {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

const staffMembers: StaffMember[] = [
  {
    name: 'Dra. Ana Silva',
    role: 'Ortopedista Sênior',
    description:
      'Especialista em cirurgia de joelho e quadril com mais de 15 anos de experiência.',
    imageUrl: '/doc1.webp',
  },
  {
    name: 'Dr. Carlos Oliveira',
    role: 'Especialista em Trauma',
    description:
      'Focado em tratamentos inovadores para lesões esportivas e recuperação rápida.',
    imageUrl: '/doc2.webp',
  },
  {
    name: 'Dr. João Oliveira',
    role: 'Pesquisador',
    description:
      'Lidera pesquisas em regeneração óssea e desenvolve novos protocolos de tratamento.',
    imageUrl: '/doc3.webp',
  },
];

export default function StaffSection() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#2196F3] md:text-4xl">
          Nossa Equipe
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {staffMembers.map((member, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-lg"
            >
              <div className="relative h-[400px] w-full">
                <Image
                  src={member.imageUrl || '/placeholder.svg'}
                  alt={`Foto de ${member.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={index === 0}
                  className="rounded-t-lg object-cover object-top"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-xl font-semibold text-[#2196F3]">
                  {member.name}
                </h3>
                <p className="mb-2 text-sm text-gray-500">{member.role}</p>
                <p className="text-gray-700">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

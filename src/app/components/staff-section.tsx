import Image from 'next/image';

interface StaffMember {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

const staffMembers: StaffMember[] = [
  {
    name: 'Dr. Ana Silva',
    role: 'Ortopedista Sênior',
    description:
      'Especialista em cirurgia de joelho e quadril com mais de 15 anos de experiência.',
    imageUrl: '/placeholder.svg?height=200&width=200',
  },
  {
    name: 'Dr. Carlos Oliveira',
    role: 'Especialista em Trauma',
    description:
      'Focado em tratamentos inovadores para lesões esportivas e recuperação rápida.',
    imageUrl: '/placeholder.svg?height=200&width=200',
  },
  {
    name: 'Dra. Mariana Santos',
    role: 'Pesquisadora Chefe',
    description:
      'Lidera pesquisas em regeneração óssea e desenvolve novos protocolos de tratamento.',
    imageUrl: '/placeholder.svg?height=200&width=200',
  },
];

export default function StaffSection() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-blue-600 md:text-4xl">
          Nossa Equipe
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {staffMembers.map((member, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-lg"
            >
              <div className="relative aspect-square">
                <Image
                  src={member.imageUrl || '/placeholder.svg'}
                  alt={`Foto de ${member.name}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-xl font-semibold text-blue-600">
                  {member.name}
                </h3>
                <p className="mb-2 text-sm text-gray-600">{member.role}</p>
                <p className="text-gray-700">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

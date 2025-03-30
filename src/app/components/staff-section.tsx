import Image from 'next/image';

interface StaffMember {
  name: string;
  role: string;
  description: string[];
  imageUrl: string;
}

const staffMembers: StaffMember[] = [
  {
    name: 'Daniel Duarte Perini',
    role: 'Cirurgia da Coluna Vertebral',
    description: [
      'Médico graduado pela Faculdade de Medicina da USP (FMUSP)',
      'Ortopedista pelo Instituto de Ortopedia e Traumatologia do HC-FMUSP (IOT)',
      'Fellowship Cirurgia da Coluna Vertebral (IOT)',
    ],
    imageUrl: '/doc1.webp',
  },
  {
    name: 'Vitor Ricardo Moraes',
    role: 'Cirurgia do Joelho',
    description: [
      'Médico graduado pela Faculdade de Medicina de Ribeirão Preto da USP (FMRP-USP)',
      'Ortopedista pelo Instituto de Ortopedia e Traumatologia do HC-FMUSP (IOT)',
      'Fellowship Cirurgia do Joelho (IOT)',
    ],
    imageUrl: '/doc2.webp',
  },
  {
    name: 'Flavio de Fava Sanches',
    role: 'Cirurgia do Joelho',
    description: [
      'Médico graduado pela PUC-SP',
      'Ortopedista pelo Instituto de Ortopedia e Traumatologia do HC-FMUSP (IOT)',
      'Fellowship Cirurgia do Joelho (IOT)',
    ],
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
              className="mx-auto max-w-[320px] overflow-hidden rounded-lg border border-blue-200 bg-white shadow-lg md:max-w-full"
            >
              <div className="relative h-[180px] w-full md:h-[250px]">
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
                <p className="mb-2 text-sm font-medium text-gray-600">
                  {member.role}
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600">
                  {member.description.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { Check, GraduationCap, Loader2, Target } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';

import { api } from '../../convex/_generated/api';
import DynamicPricingCards from './dynamic-pricing-cards';

// Create a context to cache access results
type AccessContextType = {
  hasAccess: boolean | undefined;
  isLoading: boolean;
};

const AccessContext = createContext<AccessContextType>({
  hasAccess: undefined,
  isLoading: true,
});

// Provider component to be used at the layout level
export function AccessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Only run the Convex query if user is not an admin
  const accessResult = useQuery(
    api.users.hasCurrentYearAccess,
    isAdmin ? 'skip' : undefined,
  );

  // Check if user is admin based on Clerk metadata (only once per session)
  useEffect(() => {
    if (!user || adminCheckComplete) return;

    try {
      // Access the user's metadata to check for admin role
      const role = user.publicMetadata?.role;
      setIsAdmin(role === 'admin');
    } catch (error) {
      console.error('Error checking admin role:', error);
    } finally {
      setAdminCheckComplete(true);
    }
  }, [user, adminCheckComplete]);

  // Determine overall access status
  const hasAccess =
    isAdmin ||
    (accessResult &&
      typeof accessResult === 'object' &&
      accessResult.hasAccess);

  const isLoading =
    !adminCheckComplete || (accessResult === undefined && !isAdmin);

  return (
    <AccessContext.Provider value={{ hasAccess, isLoading }}>
      {children}
    </AccessContext.Provider>
  );
}

// Hook to use the access context
export function useAccess() {
  return useContext(AccessContext);
}

// Simplified AccessCheck component that uses the context
export default function AccessCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasAccess, isLoading } = useAccess();

  // While loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#2196F3]" />
        <p className="text-lg font-medium">Verificando seu acesso...</p>
      </div>
    );
  }

  // If user has access, show the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Enhanced promotional component when user doesn't have access
  return (
    <div className="mx-auto my-8 max-w-5xl">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold text-[#2196F3] md:text-3xl">
          Acesso OrtoQBank
        </h2>
        <p className="text-lg text-gray-600">
          Para acessar este conteúdo, você precisa adquirir o passe anual de{' '}
          {new Date().getFullYear()}.
        </p>
      </div>

      {/* Dynamic Pricing Cards - Fetched from Stripe */}
      <DynamicPricingCards />

      {/* Benefits section */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <BenefitCard
          icon={GraduationCap}
          title="Trilhas de Estudo"
          description="Acesso a trilhas de estudo com questões inéditas organizadas por temas"
        />
        <BenefitCard
          icon={Target}
          title="Simulados Completos"
          description="Simulados que reproduzem o formato do TEOT, com questões exclusivas"
        />
        <BenefitCard
          icon={Check}
          title="Testes Personalizados"
          description="Crie testes personalizados focando nas suas áreas de melhoria"
        />
      </div>

      {/* Testimonial */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="mb-4 text-gray-700">
          &ldquo;O OrtoQBank foi essencial para a minha aprovação no TEOT.
          Material organizado e questões de alta qualidade.&rdquo;
        </p>
        <p className="font-medium text-gray-900">
          Dr. João Silva, aprovado no TEOT 2023
        </p>
      </div>
    </div>
  );
}

// Reusable component for benefits
function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Icon className="mb-3 h-8 w-8 text-[#2196F3]" />
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

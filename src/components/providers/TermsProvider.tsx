'use client';
import { useMutation, useQuery } from 'convex/react';
import { ReactNode, useEffect, useState } from 'react';

import { TermsOfServiceModal } from '@/components/common/TermsOfServiceModal';

import { api } from '../../../convex/_generated/api';

interface TermsProviderProps {
  children: ReactNode;
}

export function TermsProvider({ children }: TermsProviderProps) {
  const termsAccepted = useQuery(api.users.getTermsAccepted);
  const setTermsAccepted = useMutation(api.users.setTermsAccepted);

  // Use a state to prevent flickering when data is loading
  const [showModal, setShowModal] = useState(false);

  // Update modal visibility when query data changes
  useEffect(() => {
    if (termsAccepted === false) {
      setShowModal(true);
    }
  }, [termsAccepted]);

  const handleAccept = () => {
    setTermsAccepted({ accepted: true });
    setShowModal(false);
  };

  return (
    <>
      <TermsOfServiceModal open={showModal} onAccept={handleAccept} />
      {children}
    </>
  );
}

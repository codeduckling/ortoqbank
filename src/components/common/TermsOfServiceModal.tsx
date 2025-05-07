'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsOfServiceModalProps {
  open: boolean;
  onAccept: () => void;
}

export function TermsOfServiceModal({
  open,
  onAccept,
}: TermsOfServiceModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Termos de Uso e Serviço</DialogTitle>
          <DialogDescription>
            Por favor, leia e aceite os termos de uso para continuar utilizando
            o OrtoQBank.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto py-4">
          <div className="prose dark:prose-invert">
            <h2>Termos de Uso</h2>
            <p>
              Bem-vindo ao OrtoQBank. Ao utilizar nossa plataforma, você
              concorda com os seguintes termos e condições:
            </p>

            <h3>1. Uso do Serviço</h3>
            <p>
              O OrtoQBank oferece uma plataforma de questões e simulados para
              estudantes e profissionais da área de ortodontia. Todo o conteúdo
              disponibilizado é para uso exclusivo de estudo e aprendizado.
            </p>

            <h3>2. Contas de Usuário</h3>
            <p>
              Você é responsável por manter a confidencialidade da sua conta e
              senha, e por restringir o acesso ao seu computador. Você concorda
              em aceitar responsabilidade por todas as atividades que ocorrerem
              sob sua conta.
            </p>

            <h3>3. Conteúdo</h3>
            <p>
              O conteúdo disponibilizado na plataforma é protegido por direitos
              autorais e outras leis de propriedade intelectual. O uso não
              autorizado do conteúdo para fins além do estudo pessoal é
              estritamente proibido.
            </p>

            <h3>4. Pagamentos</h3>
            <p>
              Alguns recursos da plataforma podem requerer pagamento. Ao
              adquirir um plano pago, você concorda com os termos de pagamento e
              renovação apresentados no momento da compra.
            </p>

            <h3>5. Política de Privacidade</h3>
            <p>
              Todas as informações pessoais que você nos fornece estão sujeitas
              à nossa Política de Privacidade, que rege nossa coleta e uso de
              suas informações.
            </p>

            <h3>6. Modificações</h3>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento.
              As alterações entrarão em vigor imediatamente após sua publicação
              no site.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onAccept} className="w-full sm:w-auto">
            Aceito os Termos de Serviço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { QuestionForm } from './_components/question-form';
import {
  IKImage,
  IKVideo,
  ImageKitProvider,
  IKUpload,
  ImageKitContext,
} from 'imagekitio-next';
export default function CreateQuestionPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <QuestionForm />
      <h1>ImageKit Next.js quick start</h1>
      <IKImage
        urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
        path="default-image.jpg"
        width={400}
        height={400}
        alt="Alt text"
      />
    </div>
  );
}

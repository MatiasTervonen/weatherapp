import { useTranslationContext } from "@/app/components/translationProvider";

type TranslationMessages = {
  [key: string]: string | TranslationMessages;
};

export function useTranslation(namespace?: string) {
  const { messages }: { messages: TranslationMessages } =
    useTranslationContext();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: string | TranslationMessages | undefined =
      namespace && namespace in messages ? messages[namespace] : messages;

    for (const k of keys) {
      if (typeof value !== "object" || value === null || !(k in value)) {
        return key;
      }
      value = value[k];
    }

    return typeof value === "string" ? value : key;
  };

  return { t };
}

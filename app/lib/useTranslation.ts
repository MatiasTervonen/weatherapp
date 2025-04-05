import { useTranslationContext } from "@/app/components/translationProvider";

export function useTranslation(namespace?: string) {
  const { messages }: { messages: Record<string, any> } = useTranslationContext();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = namespace && namespace in messages ? messages[namespace] : messages;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    return typeof value === "string" ? value : key;
  };

  return { t };
}
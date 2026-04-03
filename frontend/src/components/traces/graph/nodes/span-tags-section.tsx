import { SpanInfoField } from "./span-info-field";

interface Tag {
  key: string;
  value: string | number | boolean;
}

interface SpanTagsSectionProps {
  tags: Tag[];
}

export function SpanTagsSection({ tags }: Readonly<SpanTagsSectionProps>) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Tags</h3>
      <div className="space-y-1">
        {tags.map((tag) => (
          <SpanInfoField key={tag.key} label={tag.key} value={tag.value} />
        ))}
      </div>
    </div>
  );
}


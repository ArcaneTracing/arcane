export type InstrumentationLibrary =
  | 'openinference'
  | 'openllmetry'
  | 'openlit'
  | 'opentelemetry';

export interface TemplateInfo {
  id: InstrumentationLibrary;
  name: string;
  description: string;
  logoPath: string;
}

const templateLoaders = import.meta.glob<string>('./*.yaml', {
  query: '?raw',
  import: 'default',
});

const templateCache = new Map<InstrumentationLibrary, string>();

export async function loadTemplate(
  library: InstrumentationLibrary,
): Promise<string> {
  const cached = templateCache.get(library);
  if (cached) {
    return cached;
  }

  const loader = templateLoaders[`./${library}.yaml`];
  if (!loader) {
    throw new Error(`Template not found for library: ${library}`);
  }

  const content = await loader();
  templateCache.set(library, content);
  return content;
}

export const TEMPLATE_INFO: Record<
  InstrumentationLibrary,
  TemplateInfo
> = {
  openinference: {
    id: 'openinference',
    name: 'OpenInference',
    description: 'OpenTelemetry-based inference tracing',
    logoPath: '/images/logos/openinference.png',
  },
  openllmetry: {
    id: 'openllmetry',
    name: 'OpenLLMetry',
    description: 'OpenTelemetry LLM observability',
    logoPath: '/images/logos/openllmetry.png',
  },
  openlit: {
    id: 'openlit',
    name: 'OpenLIT',
    description: 'OpenTelemetry LLM instrumentation',
    logoPath: '/images/logos/openlit.png',
  },
  opentelemetry: {
    id: 'opentelemetry',
    name: 'OpenTelemetry',
    description: 'OpenTelemetry semantic conventions for traces',
    logoPath: '/images/logos/opentelemetry.png',
  },
};

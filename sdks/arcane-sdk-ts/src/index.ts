import { ArcaneClient } from './client';
import { PromptsResource } from './resources/prompts';
import { DatasourcesResource } from './resources/datasources';
import { TracesResource } from './resources/traces';
import { DatasetsResource } from './resources/datasets';
import { EntitiesResource } from './resources/entities';
import { EvaluationsResource } from './resources/evaluations';
import { ExperimentsResource } from './resources/experiments';

export type { ArcaneClientConfig } from './client';
export { ArcaneClient } from './client';
export { ArcanApiError, ArcanNotFoundError, ArcanUnauthorizedError } from './errors';
export type * from './types';

/**
 * High-level client for the Arcane public API.
 * Use project-scoped API keys for authentication.
 *
 * @example
 * ```ts
 * import { Arcan } from 'arcane-sdk';
 *
 * const arcan = new Arcan({
 *   baseUrl: 'https://api.example.com',
 *   apiKey: process.env.ARCAN_API_KEY!,
 * });
 *
 * const prompts = await arcan.prompts.list();
 * const datasets = await arcan.datasets.list();
 *
 * for await (const result of arcan.experiments.listResultsPaginated('exp-id')) {
 *   console.log(result);
 * }
 * ```
 */
export class Arcan extends ArcaneClient {
  readonly prompts: PromptsResource;
  readonly datasources: DatasourcesResource;
  readonly traces: TracesResource;
  readonly datasets: DatasetsResource;
  readonly entities: EntitiesResource;
  readonly evaluations: EvaluationsResource;
  readonly experiments: ExperimentsResource;

  constructor(config: import('./client').ArcaneClientConfig) {
    super(config);
    this.prompts = new PromptsResource(this);
    this.datasources = new DatasourcesResource(this);
    this.traces = new TracesResource(this);
    this.datasets = new DatasetsResource(this);
    this.entities = new EntitiesResource(this);
    this.evaluations = new EvaluationsResource(this);
    this.experiments = new ExperimentsResource(this);
  }
}
